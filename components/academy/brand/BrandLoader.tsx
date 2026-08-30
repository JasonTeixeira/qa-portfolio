import { SageMark } from './SageMark'

/**
 * Branded route-transition loader: the Sage mark with a soft breathing pulse
 * and an indeterminate progress sweep. Rendered by segment-level loading.tsx
 * files, so it appears while a page's server work streams in. Motion is gated
 * behind prefers-reduced-motion — reduced-motion users get a still mark.
 */
export function BrandLoader({ label = 'Loading', minHeight = '70vh' }: { label?: string; minHeight?: string }) {
  return (
    <div style={{ minHeight, display: 'grid', placeItems: 'center', background: '#0B0B0E' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media (prefers-reduced-motion: no-preference) {
  .sageLoaderMark { animation: sageLoaderPulse 1.4s ease-in-out infinite; }
  .sageLoaderBar::after {
    content: ''; position: absolute; inset: 0 auto 0 0; width: 42%;
    background: linear-gradient(90deg, transparent, #3D5AFE, transparent);
    animation: sageLoaderSlide 1.15s ease-in-out infinite;
  }
}
@keyframes sageLoaderPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.82; } }
@keyframes sageLoaderSlide { 0% { transform: translateX(-110%); } 100% { transform: translateX(280%); } }
`,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <span className="sageLoaderMark" style={{ display: 'grid', placeItems: 'center' }}>
          <SageMark size={46} radius={13} />
        </span>
        <span
          className="sageLoaderBar"
          aria-hidden="true"
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: 120,
            height: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#6B6B78',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
