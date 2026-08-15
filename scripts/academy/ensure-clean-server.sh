#!/usr/bin/env bash
# Ensure exactly ONE clean Next dev server on :3040 for the academy loops.
# Idempotent + safe to re-run. Exits 0 when :3040 serves 200, non-zero otherwise.
#
#   bash scripts/academy/ensure-clean-server.sh
set -uo pipefail

PORT=3040
URL="http://127.0.0.1:${PORT}/academy"
LOG=/tmp/devserver-${PORT}.log
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1

ready() { [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 6 "$URL" 2>/dev/null)" = "200" ]; }

# 1. Already healthy? Done.
if ready; then echo "[server] already healthy on :${PORT}"; exit 0; fi

# 2. Kill anything on the port + stray Next processes, then clear the corrupt dev cache.
echo "[server] not healthy — cleaning up…"
lsof -ti:${PORT} 2>/dev/null | xargs kill -9 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 2
# .next/dev corruption (ENOENT routes-manifest / "compaction already active") is the
# usual cause of 500s after a concurrent build — clear it.
rm -rf .next/dev 2>/dev/null

# 3. Start one clean dev server.
echo "[server] starting clean dev server on :${PORT}…"
nohup npx next dev -p ${PORT} > "$LOG" 2>&1 &
PID=$!

# 4. Bail early if the port is held by something we couldn't kill.
sleep 4
if grep -q "EADDRINUSE" "$LOG" 2>/dev/null; then
  echo "[server] ABORT: :${PORT} is held by another process (a concurrent Next build?). Pause it and retry." >&2
  exit 2
fi

# 5. Wait up to ~90s for first compile + 200.
for i in $(seq 1 45); do
  if ready; then echo "[server] ready on :${PORT} (pid $PID) after ~$((i*2))s"; exit 0; fi
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "[server] ABORT: dev server exited early — see $LOG" >&2; tail -8 "$LOG" >&2; exit 3
  fi
  sleep 2
done
echo "[server] ABORT: not ready after ~90s — see $LOG" >&2; tail -8 "$LOG" >&2
exit 4
