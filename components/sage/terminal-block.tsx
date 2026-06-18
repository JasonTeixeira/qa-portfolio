"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TerminalLine =
  | { kind: "prompt"; user?: string; host?: string; cwd?: string; command: string }
  | { kind: "output"; text: React.ReactNode }
  | { kind: "comment"; text: React.ReactNode }
  | { kind: "ok"; text: React.ReactNode }
  | { kind: "err"; text: React.ReactNode }
  | { kind: "blank" };

export interface TerminalBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lines to render. Each line becomes its own row. */
  lines: TerminalLine[];
  /** Show the title bar with traffic-light dots and a label. */
  chrome?: boolean;
  /** Label rendered in the chrome bar, e.g. `~/sage/work — zsh`. */
  chromeLabel?: string;
  /** Append a blinking cursor to the final line. Default true. */
  trailingCursor?: boolean;
  /** When true, draw the scan-line CRT overlay on top of the block. */
  scanlines?: boolean;
}

/**
 * <TerminalBlock /> — declarative renderer for a terminal transcript.
 * Consumes the `.sage-prompt*` classes defined in app/globals.css.
 */
export const TerminalBlock = React.forwardRef<HTMLDivElement, TerminalBlockProps>(
  function TerminalBlock(
    {
      lines,
      chrome = false,
      chromeLabel = "~/sage — zsh",
      trailingCursor = true,
      scanlines = false,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg border border-[var(--sage-border)] bg-[var(--sage-surface-raised,#12110F)]",
          scanlines && "sage-scanlines",
          className,
        )}
        {...rest}
      >
        {chrome ? (
          <div className="flex items-center gap-2 border-b border-[var(--sage-border)] bg-[var(--sage-surface-overlay,#1A1917)] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E85D3A]" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E5C341]" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#A8C633]" aria-hidden />
            <span className="ml-2 truncate text-xs font-medium text-[var(--sage-ink-muted,#A8A29E)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {chromeLabel}
            </span>
          </div>
        ) : null}

        <div className="p-4 text-sm leading-relaxed">
          {lines.map((line, i) => {
            const isLast = i === lines.length - 1;
            const showCursor = trailingCursor && isLast;
            switch (line.kind) {
              case "prompt": {
                const user = line.user ?? "sage";
                const host = line.host ?? "ideas";
                const cwd = line.cwd ?? "~";
                return (
                  <div key={i} className="sage-prompt">
                    <span aria-hidden className="select-none">
                      <span className="text-[var(--sage-lime,#A8C633)]">
                        {user}@{host}
                      </span>
                      <span className="text-[var(--sage-ink-muted,#A8A29E)]">:</span>
                      <span className="text-[var(--sage-brand,#3D5AFE)]">{cwd}</span>
                      <span className="text-[var(--sage-ink-muted,#A8A29E)]">$ </span>
                    </span>
                    <span className="text-[var(--sage-ink,#F4F2EF)]">{line.command}</span>
                    {showCursor ? <span className="sage-cursor" aria-hidden /> : null}
                  </div>
                );
              }
              case "output":
                return (
                  <div key={i} className="sage-prompt-output">
                    {line.text}
                    {showCursor ? <span className="sage-cursor ml-0.5" aria-hidden /> : null}
                  </div>
                );
              case "comment":
                return (
                  <div key={i} className="sage-prompt-comment">
                    # {line.text}
                  </div>
                );
              case "ok":
                return (
                  <div key={i} className="sage-prompt-ok">
                    ✓ {line.text}
                  </div>
                );
              case "err":
                return (
                  <div key={i} className="sage-prompt-err">
                    ✗ {line.text}
                  </div>
                );
              case "blank":
                return <div key={i} aria-hidden>&nbsp;</div>;
              default:
                return null;
            }
          })}
        </div>
      </div>
    );
  },
);
