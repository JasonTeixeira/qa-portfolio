// Phase 10: RSC — pure anchor, no client state.

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      tabIndex={0}
    >
      Skip to main content
    </a>
  )
}
