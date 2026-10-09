import { useRef, useState, type PointerEvent } from 'react'
import { category, palette, MIN, MAX } from '../../models/employment'
import type { TimelineLane } from '../../utils/timeline'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function TimelineOverview({ lanes, start, end, selectedPeriod, onScrub }: {
  lanes: TimelineLane[]
  start: number
  end: number
  periods: DDRPeriod[]
  selectedPeriod: DDRPeriod | null
  onScrub: (year: number) => void
}) {
  const scrubRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState(false)
  const seek = (event: PointerEvent<SVGSVGElement>) => {
    const node = scrubRef.current
    if (!node) return
    const bounds = node.getBoundingClientRect()
    if (bounds.width <= 0) return
    const fraction = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    onScrub(MIN + fraction * (MAX - MIN))
  }
  const startDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    seek(event)
  }
  const endDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
  }
  const x = (year: number) => ((year - MIN) / (MAX - MIN)) * 1000
  const lo = Math.max(MIN, Math.min(MAX, start))
  const hi = Math.max(lo, Math.min(MAX, end))
  const left = x(lo)
  const right = x(hi)
  const focusWidth = Math.max(0, right - left)
  return (
    <section className="overview" aria-label="Full period overview">
      <div className="overview-top">
        <span>DEPARTMENT OF DESIGN RESEARCH / OVERVIEW</span>
        <span>{selectedPeriod ? selectedPeriod.start : Math.floor(start)} — {selectedPeriod ? selectedPeriod.end : Math.min(1985, Math.ceil(end))}</span>
      </div>
      <div className={dragging ? "minimap is-scrubbing" : "minimap"}>
        <svg ref={scrubRef} viewBox="0 0 1000 100" preserveAspectRatio="none"
          role="slider" tabIndex={0} aria-label="Scrub the historical timeline"
          aria-valuemin={MIN} aria-valuemax={MAX} aria-valuenow={Math.round((lo + hi) / 2)}
          aria-valuetext={`Timeline centered around ${Math.round((lo + hi) / 2)}`}
          onPointerDown={startDrag}
          onPointerMove={event => { if (dragging) seek(event) }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={event => {
            const center = (lo + hi) / 2
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault()
              onScrub(center + (event.key === 'ArrowLeft' ? -0.5 : 0.5))
            } else if (event.key === 'Home' || event.key === 'End') {
              event.preventDefault()
              onScrub(event.key === 'Home' ? MIN : MAX)
            }
          }}>
          {lanes.map(d => {
            const from = Math.max(MIN, d.start)
            const to = Math.min(MAX, d.end + 1)
            return <rect key={d.person.staff_code} x={x(from)} width={Math.max(0, x(to) - x(from))}
              y={13 + (d.lane % 7) * 9} height={5}
              fill={palette[category(d.person.job_title_label)]} opacity={0.72} />
          })}
          {focusWidth < 998 && (
            <rect className="minimap-focus" x={left} width={focusWidth} y={1} height={98}
              fill="var(--cds-highlight)" fillOpacity={0.24} stroke="none" />
          )}
          {lo > MIN && <line x1={left} x2={left} y1={0} y2={100} stroke="var(--cds-focus)" strokeWidth={1.3} />}
          {hi < MAX && <line x1={right} x2={right} y1={0} y2={100} stroke="var(--cds-focus)" strokeWidth={1.3} />}
        </svg>
      </div>
      <div className="minimap-labels" aria-hidden="true">
        <span>1965</span><span>1970</span><span>1980</span><span>1985</span>
      </div>
    </section>
  )
}
