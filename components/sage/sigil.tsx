"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SigilStatus = "online" | "warn" | "error" | "idle" | "secure";

const statusToColor: Record<SigilStatus, string> = {
  online: "var(--sage-lime, #A8C633)",
  warn: "#E5C341",
  error: "var(--sage-coral, #E85D3A)",
  idle: "var(--sage-ink-muted, #A8A29E)",
  secure: "var(--sage-brand, #3D5AFE)",
};

const statusToLabel: Record<SigilStatus, string> = {
  online: "ONLINE",
  warn: "WARN",
  error: "OFFLINE",
  idle: "IDLE",
  secure: "SECURE",
};

export interface SigilProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Semantic status of the indicator. */
  status?: SigilStatus;
  /** Label to render after the dot. Falls back to the status label. */
  label?: React.ReactNode;
  /** Hide the textual label (dot only). */
  hideLabel?: boolean;
  /** Pulse the dot. Default true. */
  pulse?: boolean;
}

/**
 * <Sigil /> — a dot + uppercase mono label used as a status indicator.
 * Used in the navbar, hero, and footer to signal system state.
 */
export const Sigil = React.forwardRef<HTMLSpanElement, SigilProps>(function Sigil(
  { status = "online", label, hideLabel = false, pulse = true, className, ...rest },
  ref,
) {
  const color = statusToColor[status];
  const text = label ?? statusToLabel[status];

  return (
    <span
      ref={ref}
      className={cn(
        "sage-sigil inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]",
        "[font-family:var(--font-mono),ui-monospace,monospace]",
        className,
      )}
      style={{ color }}
      role="status"
      aria-label={typeof text === "string" ? text : statusToLabel[status]}
      {...rest}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-block h-1.5 w-1.5 rounded-full",
          pulse && "before:absolute before:inset-0 before:rounded-full before:bg-current before:opacity-60",
          pulse && "before:animate-ping",
        )}
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
      {!hideLabel ? <span>{text}</span> : null}
    </span>
  );
});
