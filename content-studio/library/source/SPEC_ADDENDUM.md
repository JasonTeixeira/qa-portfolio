# Nexural Visual Teaching System — SPEC ADDENDUM
Gap-fixes to the original Visual Asset Master Spec, as built in Phases 1–11.
Everything below is implemented in the design files; this doc makes it canonical for the code handoff.

## A1.5 — Aggregation contract (fills spec gap §1)
Every Family A–E asset accepts `{type: 'time'|'tick'|'volume'|'range', size}`.
- Time: 1m / 5m / 15m / 30m / 60m / daily
- Volume: e.g. 10,000 contracts/bar → irregular timestamps (implemented in Desk Workspace)
- Panel headers ALWAYS state the aggregation. No unlabeled charts.

## H3 — Session & contract registry (fills spec gap §2)
Per instrument: contract code (ESU6), tick size, tick value ($12.50), multiplier,
settlement price, roll date, RTH/ETH session map. Implemented as the contract strip
in Desk Workspace; feeds J2's P&L math. ONH/ONL + settlement are levels in H2.

## G3/G4 — Cross-market context (fills spec gap §3)
- G3 CORRELATION STRIP: ES NQ YM ZN DXY CL VIX TICK ribbon (Desk Workspace toolbar row 2)
- G4 EVENT MARKERS: economic-calendar flags on the time axis (FOMC marker implemented)

## J3 — Risk manager (fills spec gap §4)
R defined as fixed risk from invalidation distance × tick value.
J2 implements: auto-stop 8 ticks behind entry, P&L displayed in $ AND R,
stops execute as market orders. Size derives from stop distance, never the reverse.

## Data/replay engine contract (fills spec gap §5)
All mocks are deterministic fixtures (seeded mulberry32 PRNG) — same seed, same tape, every render.
Replay is first-class: scrub (B1 developing VA, E1 curtain), tick-rebuild (C1 bar replay),
streaming (D2 tape), interactive sim clock (J2). Production heatmap at density 10 = canvas/WebGL.

## Allowed-indicator whitelist (prevents over-applying the banned list)
VWAP + anchored VWAP (±σ), volume profile (POC/VAH/VAL, real 70% algorithm), TPO,
delta/CVD, ATR (sizing only), ADR, TWAP, open interest, internals ($TICK $ADD $VOLD).
Banned list unchanged: no lagging-oscillator soup, no unlabeled magic levels.

## Accuracy governance notes carried into designs
- Provenance badge on every data pane: LIVE (green) / ILLUSTRATIVE (amber) / MODEL (cyan). Non-dismissible.
- MODEL panels state assumptions on-panel (e.g. F1 dealer-sign convention).
- VA is the real smallest-contiguous-70% algorithm; gamma is real Black–Scholes; delta = ask − bid exactly.
- Absorption is ALWAYS defined by effect (aggression without progress), never by vibe.
- Spoofing appears only as a labeled recognition lesson (E1 SPOOF FLICKER).

## File map (design → code)
- Foundation / tokens .......... Nexural Viz Foundation.dc.html
- §6.5 Desk hero ............... Nexural Desk Workspace.dc.html
- Family A ..................... Nexural Family A.dc.html
- Family B ..................... Nexural Family B.dc.html
- Family C ..................... Nexural Family C.dc.html
- Family D ..................... Nexural Family D.dc.html
- Family E ..................... Nexural Family E.dc.html
- Family F ..................... Nexural Family F.dc.html
- Families G+H ................. Nexural Family GH.dc.html
- Family I ..................... Nexural Family I.dc.html
- Family J (J2 sim) ............ Nexural Family J.dc.html
- J1 storyboard ................ Nexural Viz Storyboard.dc.html
- Hub .......................... Nexural System Hub.dc.html

## Remaining (Phase 12 continuation)
- Pilot 2 storyboard (options/GEX lesson: pin day → short-γ break)
- Pilot 3 storyboard (auction/value lesson: gap open vs value)
- 5 motion studies (§6.8): wall-consumed, delta-flip, VA-migration, sweep, hedging-loop
- Final QA pass across all files
