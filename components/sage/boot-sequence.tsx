"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TerminalBlock, type TerminalLine } from "./terminal-block";

export interface BootStep {
  /** Type-out command body for `prompt` lines, or full line text for others. */
  text: string;
  /** Line kind to render. Default: "prompt". */
  kind?: TerminalLine["kind"];
  /** Override per-step typing speed (ms per character). */
  speedMs?: number;
  /** Pause AFTER the line finishes typing, before the next one starts (ms). */
  holdMs?: number;
}

export interface BootSequenceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered list of boot steps to stream. */
  steps: BootStep[];
  /** Per-character typing speed in ms. Default 22. */
  speedMs?: number;
  /** Delay before the first step starts. Default 200. */
  startDelayMs?: number;
  /** Show the terminal chrome bar. */
  chrome?: boolean;
  chromeLabel?: string;
  /** Show CRT scan-line overlay. */
  scanlines?: boolean;
  /** Called once when every step has finished animating. */
  onComplete?: () => void;
  /** Skip animation entirely (e.g. reduced-motion fallback handled by caller). */
  instant?: boolean;
}

/**
 * <BootSequence /> — streams a list of terminal lines character-by-character.
 *
 * - Respects `prefers-reduced-motion: reduce` by snapping to the final frame.
 * - Cleans up timers on unmount.
 * - Built on top of <TerminalBlock /> so styling stays consistent.
 */
export function BootSequence({
  steps,
  speedMs = 22,
  startDelayMs = 200,
  chrome = true,
  chromeLabel = "~/sage/boot — zsh",
  scanlines = true,
  onComplete,
  instant = false,
  className,
  ...rest
}: BootSequenceProps) {
  const [renderedSteps, setRenderedSteps] = React.useState<number>(instant ? steps.length : 0);
  const [currentText, setCurrentText] = React.useState<string>("");
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const completeFiredRef = React.useRef(false);

  React.useEffect(() => {
    // Reduced-motion + instant short-circuit.
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (instant || prefersReduced) {
      setRenderedSteps(steps.length);
      setCurrentText("");
      if (!completeFiredRef.current) {
        completeFiredRef.current = true;
        onComplete?.();
      }
      return;
    }

    const timeouts = timeoutsRef.current;
    let cancelled = false;

    const runStep = (idx: number, delay: number) => {
      const step = steps[idx];
      if (!step) {
        const t = setTimeout(() => {
          if (cancelled) return;
          if (!completeFiredRef.current) {
            completeFiredRef.current = true;
            onComplete?.();
          }
        }, delay);
        timeouts.push(t);
        return;
      }

      const charSpeed = step.speedMs ?? speedMs;
      const holdMs = step.holdMs ?? 220;
      const text = step.text;

      // Start typing this step after `delay` ms
      const startTimeout = setTimeout(() => {
        if (cancelled) return;
        let charIdx = 0;
        const tick = () => {
          if (cancelled) return;
          charIdx += 1;
          setCurrentText(text.slice(0, charIdx));
          if (charIdx < text.length) {
            const t = setTimeout(tick, charSpeed);
            timeouts.push(t);
          } else {
            // Commit the step and move to next after holdMs
            const commit = setTimeout(() => {
              if (cancelled) return;
              setRenderedSteps((n) => n + 1);
              setCurrentText("");
              runStep(idx + 1, 80);
            }, holdMs);
            timeouts.push(commit);
          }
        };
        tick();
      }, delay);

      timeouts.push(startTimeout);
    };

    runStep(0, startDelayMs);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant, steps.length]);

  const committedLines = React.useMemo<TerminalLine[]>(() => {
    return steps.slice(0, renderedSteps).map((s) => mapStep(s, s.text));
  }, [steps, renderedSteps]);

  const liveLine: TerminalLine | null = React.useMemo(() => {
    if (renderedSteps >= steps.length) return null;
    const active = steps[renderedSteps];
    if (!active) return null;
    return mapStep(active, currentText);
  }, [steps, renderedSteps, currentText]);

  const lines = liveLine ? [...committedLines, liveLine] : committedLines;

  return (
    <TerminalBlock
      lines={lines}
      chrome={chrome}
      chromeLabel={chromeLabel}
      scanlines={scanlines}
      trailingCursor
      className={cn(className)}
      {...rest}
    />
  );
}

function mapStep(step: BootStep, text: string): TerminalLine {
  const kind = step.kind ?? "prompt";
  switch (kind) {
    case "prompt":
      return { kind: "prompt", command: text };
    case "output":
      return { kind: "output", text };
    case "comment":
      return { kind: "comment", text };
    case "ok":
      return { kind: "ok", text };
    case "err":
      return { kind: "err", text };
    case "blank":
      return { kind: "blank" };
    default:
      return { kind: "output", text };
  }
}
