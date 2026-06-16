'use client'

import Image from 'next/image'
import type { AttributedTestimonial } from '@/data/social-proof/attributed'

type Props = {
  testimonial?: AttributedTestimonial
  variant?: 'card' | 'pullquote'
}

export function AttributedTestimonial({
  testimonial,
  variant = 'card',
}: Props) {
  if (!testimonial) return null

  const content = (
    <>
      <blockquote className="text-base leading-7 text-[var(--sage-ink)]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      {testimonial.outcome ? (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
          {testimonial.outcome}
        </p>
      ) : null}
      <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--sage-border)] pt-5">
        {testimonial.logo ? (
          <Image
            src={testimonial.logo}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-[4px] border border-[var(--sage-border)] object-contain"
          />
        ) : (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] font-mono text-xs text-[var(--sage-accent-readable)]"
            aria-hidden
          >
            {testimonial.name
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </span>
        )}
        <span>
          <span className="block text-sm font-semibold text-[var(--sage-ink)]">
            {testimonial.name}
          </span>
          <span className="block text-xs leading-5 text-[var(--sage-ink-muted)]">
            {testimonial.title} · {testimonial.company}
          </span>
        </span>
      </figcaption>
    </>
  )

  if (variant === 'pullquote') {
    return (
      <figure className="border-y border-[var(--sage-border)] py-8">
        {content}
      </figure>
    )
  }

  return (
    <figure className="border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-6">
      {content}
    </figure>
  )
}
