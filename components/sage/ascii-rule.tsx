"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "dashed" | "dotted" | "solid" | "double";

export interface AsciiRuleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style of the rule. */
  variant?: Variant;
  /** Optional label rendered inline with the rule, e.g. "// section 02". */
  label?: React.ReactNode;
  /** Label placement. Default "left". */
  align?: "left" | "center" | "right";
  /** Force an explicit color (otherwise uses --sage-border). */
  tone?: "default" | "cyan" | "coral" | "lime" | "magenta";
}

const toneToColor: Record<NonNullable<AsciiRuleProps["tone"]>, string> = {
  default: "var(--sage-border, #2A2826)",
  cyan: "var(--sage-brand, #0ED3CF)",
  coral: "var(--sage-coral, #E85D3A)",
  lime: "var(--sage-lime, #A8C633)",
  magenta: "var(--sage-magenta, #C7236E)",
};

/**
 * <AsciiRule /> — dashed/dotted divider, optionally annotated.
 * The CSS class `.sage-rule-dashed` provides the base style; here we extend
 * it with variant, label, and tone control.
 */
export const AsciiRule = React.forwardRef<HTMLDivElement, AsciiRuleProps>(function AsciiRule(
  { variant = "dashed", label, align = "left", tone = "default", className, style, ...rest },
  ref,
) {
  const color = toneToColor[tone];

  const ruleStyle: React.CSSProperties = {
    borderTopStyle: variant,
    borderTopWidth: variant === "double" ? 3 : 1,
    borderTopColor: color,
    ...style,
  };

  if (!label) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn("w-full", className)}
        style={ruleStyle}
        {...rest}
      />
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      aria-label={typeof label === "string" ? label : undefined}
      className={cn(
        "flex w-full items-center gap-3 text-[10px] uppercase tracking-[0.18em]",
        "[font-family:var(--font-mono),ui-monospace,monospace]",
        className,
      )}
      style={{ color, ...style }}
      {...rest}
    >
      {align !== "left" ? <span className="h-px flex-1" style={ruleStyle} /> : null}
      <span className="shrink-0 text-[var(--sage-ink-muted,#A8A29E)]">
        {label}
      </span>
      {align !== "right" ? <span className="h-px flex-1" style={ruleStyle} /> : null}
    </div>
  );
});
