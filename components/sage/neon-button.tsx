"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "cyan" | "coral" | "lime" | "magenta";
type Variant = "solid" | "ghost";
type Size = "sm" | "md" | "lg";

const toneToBloom: Record<Tone, string> = {
  cyan: "sage-bloom-cyan",
  coral: "sage-bloom-coral",
  lime: "sage-bloom-lime",
  magenta: "sage-bloom-magenta",
};

const toneToVar: Record<Tone, string> = {
  cyan: "var(--sage-brand, #3D5AFE)",
  coral: "var(--sage-coral, #E85D3A)",
  lime: "var(--sage-lime, #A8C633)",
  magenta: "var(--sage-magenta, #C7236E)",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

interface BaseProps {
  tone?: Tone;
  variant?: Variant;
  size?: Size;
  bloom?: boolean;
  /** Render an ASCII chevron after the label, e.g. `→`. Default true. */
  arrow?: boolean;
  /** Override the chevron character. */
  arrowChar?: string;
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href">;

export type NeonButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * <NeonButton /> — primary cyberpunk CTA with bloom + sweep highlight.
 * Renders an <a> when `href` is provided, otherwise a <button>.
 */
export const NeonButton = React.forwardRef<HTMLElement, NeonButtonProps>(function NeonButton(
  props,
  ref,
) {
  const {
    tone = "cyan",
    variant = "solid",
    size = "md",
    bloom = true,
    arrow = true,
    arrowChar = "→",
    children,
    className,
  } = props;

  const accent = toneToVar[tone];

  const base = cn(
    "sage-neon-cta",
    "relative inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-wide uppercase",
    "border transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sage-bg,#09090B)]",
    sizeClasses[size],
    variant === "solid"
      ? "text-[#0A0A0A]"
      : "text-[var(--sage-ink,#F4F2EF)] bg-transparent hover:bg-[rgba(61,90,254,0.06)]",
    bloom && toneToBloom[tone],
    className,
  );

  const style: React.CSSProperties = {
    ["--sage-cta-accent" as never]: accent,
    backgroundColor: variant === "solid" ? accent : "transparent",
    borderColor: accent,
    ["--tw-ring-color" as never]: accent,
  };

  const inner = (
    <>
      <span className="relative z-10 [font-family:var(--font-mono),ui-monospace,monospace]">
        {children}
      </span>
      {arrow ? (
        <span aria-hidden className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">
          {arrowChar}
        </span>
      ) : null}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...anchorRest } = props as ButtonAsLink;
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(base, "group")}
        style={style}
        {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {inner}
      </Link>
    );
  }

  const { ...buttonRest } = props as ButtonAsButton;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonRest.type ?? "button"}
      className={cn(base, "group")}
      style={style}
      {...(buttonRest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {inner}
    </button>
  );
});
