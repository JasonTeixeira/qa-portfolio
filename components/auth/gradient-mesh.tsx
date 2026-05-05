// CSS-only animated gradient mesh background for auth pages.
// Three radial blobs drift on long, offset cycles. No JS, no canvas.
// Sits absolutely behind content; mark callers `relative` and put content `relative z-10`.
export function GradientMesh({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <style>{`
        @keyframes sage-drift-a {
          0%   { transform: translate3d(-15%, -10%, 0) scale(1); }
          50%  { transform: translate3d(10%, 8%, 0) scale(1.15); }
          100% { transform: translate3d(-15%, -10%, 0) scale(1); }
        }
        @keyframes sage-drift-b {
          0%   { transform: translate3d(20%, 30%, 0) scale(1.05); }
          50%  { transform: translate3d(-10%, -5%, 0) scale(0.95); }
          100% { transform: translate3d(20%, 30%, 0) scale(1.05); }
        }
        @keyframes sage-drift-c {
          0%   { transform: translate3d(40%, -20%, 0) scale(0.9); }
          50%  { transform: translate3d(15%, 20%, 0) scale(1.1); }
          100% { transform: translate3d(40%, -20%, 0) scale(0.9); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sage-mesh-blob { animation: none !important; }
        }
      `}</style>
      <div
        className="sage-mesh-blob absolute inset-0 mix-blend-screen opacity-60"
        style={{
          background:
            'radial-gradient(40% 40% at 30% 30%, rgba(6,182,212,0.55), transparent 60%)',
          animation: 'sage-drift-a 22s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="sage-mesh-blob absolute inset-0 mix-blend-screen opacity-50"
        style={{
          background:
            'radial-gradient(35% 35% at 70% 60%, rgba(139,92,246,0.45), transparent 60%)',
          animation: 'sage-drift-b 28s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="sage-mesh-blob absolute inset-0 mix-blend-screen opacity-40"
        style={{
          background:
            'radial-gradient(30% 30% at 50% 80%, rgba(34,211,238,0.35), transparent 60%)',
          animation: 'sage-drift-c 34s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(9,9,11,0.65) 100%)',
        }}
      />
    </div>
  );
}
