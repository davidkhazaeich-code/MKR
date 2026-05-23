'use client'

export default function ScrollIndicator() {
  return (
    <div className="dest-reveal-scroll-hint" aria-hidden="true">
      <span className="dest-reveal-scroll-text">SCROLL</span>
      <div className="dest-reveal-scroll-line">
        <div className="dest-reveal-scroll-dot" />
      </div>
    </div>
  )
}
