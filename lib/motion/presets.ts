import type { Variants, Transition } from 'framer-motion';

export const EASE_OUT_EXPO: Transition['ease'] = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUINT: Transition['ease'] = [0.22, 1, 0.36, 1];

// Part of the shared motion API — reserved for later phases; no callers yet.
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_QUINT } },
};

/**
 * slideUpVisible — like slideUp but starts at opacity:1 (no fade).
 * Use for above-the-fold elements that must be LCP-visible on first paint.
 */
export const slideUpVisible: Variants = {
  hidden: { opacity: 1, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_QUINT } },
};

/**
 * slideUpVisibleDelay — like slideUpVisible but with a custom delay.
 * Use for hand-choreographed entrance cascades (e.g. hero headline → paragraph → CTA).
 * Resting state (hidden/show values) is identical to slideUpVisible.
 */
export const slideUpVisibleDelay = (delay: number): Variants => ({
  hidden: { opacity: 1, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_QUINT, delay } },
});

// Part of the shared motion API — reserved for later phases; no callers yet.
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});
