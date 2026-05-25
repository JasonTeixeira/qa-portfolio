/**
 * SageAmbient — Replaces generic floating orbs with a subtle
 * architectural grid + flowing data lines that evoke systems thinking.
 * The motion is barely perceptible — ambient, not distracting.
 *
 * Server component — slow-pan and pulse driven by CSS keyframes.
 */
export function FloatingOrbs() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* Subtle dot grid — evokes precision engineering */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #0ED3CF 0.5px, transparent 0.5px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Slow ambient wash — teal top-left */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] sage-orb-teal"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(14,211,207,0.06), transparent 70%)',
        }}
      />

      {/* Warm wash — coral bottom-right */}
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] sage-orb-coral"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(232,93,58,0.04), transparent 70%)',
        }}
      />

      {/* Flowing data line — horizontal, evokes pipeline */}
      <div
        className="absolute top-[35%] left-0 w-full h-px sage-data-line-1"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(14,211,207,0.08) 30%, rgba(232,93,58,0.06) 70%, transparent 100%)',
        }}
      />

      {/* Second data line — lower, offset timing */}
      <div
        className="absolute top-[68%] left-0 w-full h-px sage-data-line-2"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(168,198,51,0.06) 40%, rgba(14,211,207,0.06) 80%, transparent 100%)',
        }}
      />

      {/* Vertical accent — architectural column */}
      <div
        className="absolute top-0 left-[72%] w-px h-full sage-data-line-3"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(14,211,207,0.05) 40%, rgba(199,35,110,0.04) 70%, transparent 100%)',
        }}
      />
    </div>
  )
}
