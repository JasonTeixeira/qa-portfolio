/**
 * Dark skeleton matching the redesigned catalog (palette #0B0B0E / #111115 /
 * #1E1E24) so navigation never flashes a light frame before the page streams.
 */
export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading the course catalog"
      style={{ minHeight: '100vh', background: '#0B0B0E', overflowX: 'clip' }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes catalogPulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .catalog-skel { animation: none !important; } }`,
        }}
      />
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(56px, 8vw, 96px) clamp(20px, 4vw, 48px)' }}>
        <div className="catalog-skel" style={{ width: 260, height: 12, borderRadius: 6, background: '#1E1E24', animation: 'catalogPulse 1.4s ease-in-out infinite' }} />
        <div className="catalog-skel" style={{ width: 'min(560px, 90%)', height: 44, borderRadius: 10, background: '#111115', border: '1px solid #1E1E24', marginTop: 20, animation: 'catalogPulse 1.4s ease-in-out infinite' }} />
        <div className="catalog-skel" style={{ height: 180, borderRadius: 16, background: '#111115', border: '1px solid #1E1E24', marginTop: 40, animation: 'catalogPulse 1.4s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18, marginTop: 40 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="catalog-skel"
              style={{
                height: 200,
                borderRadius: 14,
                background: '#111115',
                border: '1px solid #1E1E24',
                animation: `catalogPulse 1.4s ease-in-out ${i * 0.12}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
