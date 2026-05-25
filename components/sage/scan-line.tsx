"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScanLineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add the periodic horizontal sweep on top of the scan-line pattern. */
  sweep?: boolean;
  /** Add subtle CRT flicker. Disabled by default for performance. */
  flicker?: boolean;
  /** Layer the dot-grid noise texture under the scan lines. */
  grid?: boolean;
  /** Children to wrap. The overlay sits above them but is pointer-events: none. */
  children?: React.ReactNode;
}

/**
 * <ScanLine /> — CRT scan-line overlay wrapper.
 *
 * Stacks scan lines, optional sweep, optional flicker, and optional dot-grid.
 * All effects respect prefers-reduced-motion via the global stylesheet.
 */
export const ScanLine = React.forwardRef<HTMLDivElement, ScanLineProps>(
  function ScanLine({ sweep = false, flicker = false, grid = false, className, children, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          "sage-scanlines",
          sweep && "sage-sweep",
          flicker && "sage-crt-flicker",
          grid && "sage-grid-noise",
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
