import { useRef, useState, type PointerEvent } from 'react'
import { category, palette, MIN, MAX } from '../../models/employment'
import type { TimelineLane } from '../../utils/timeline'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function TimelineOverview({ lanes, start, end, onScrub, onWindowChange }: {
  lanes: TimelineLane[]
  start: number
  end: number
  periods: DDRPeriod[]
  selectedPeriod: DDRPeriod | null
  onScrub: (year: number) => void
  onWindowChange: (start: number, end: number) => void
}) {
  const scrubRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<null | { mode: 'left' | 'right' | 'pan' | 'seek'; pointerX: number; start: number; end: number }>(null)
  const [dragging, setDragging] = useState<'left' | 'right' | 'pan' | 'seek' | null>(null)
  const minimumSpan = (MAX - MIN) / 12
  const coordinate = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      year: MIN + Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width))) * (MAX - MIN),
      pixelsPerYear: bounds.width / (MAX - MIN),
    }
  }
  const startDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const { year, pixelsPerYear } = coordinate(event)
    const tolerance = 15 / Math.max(1, pixelsPerYear)
    const mode = Math.abs(year - lo) <= tolerance ? 'left'
      : Math.abs(year - hi) <= tolerance ? 'right'
      : focusWidth < 998 && year >= lo && year <= hi ? 'pan' : 'seek'
    dragRef.current = { mode, pointerX: year, start: lo, end: hi }
    setDragging(mode)
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
    if (mode === 'seek') onScrub(year)
  }
  const moveDrag = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const year = coordinate(event).year
    const delta = year - drag.pointerX
    if (drag.mode === 'left') {
      onWindowChange(Math.max(MIN, Math.min(drag.end - minimumSpan, drag.start + delta)), drag.end)
    } else if (drag.mode === 'right') {
      onWindowChange(drag.start, Math.min(MAX, Math.max(drag.start + minimumSpan, drag.end + delta)))
    } else if (drag.mode === 'pan') {
      const span = drag.end - drag.start
      const beginning = Math.max(MIN, Math.min(MAX - span, drag.start + delta))
      onWindowChange(beginning, beginning + span)
    } else {
      onScrub(year)
    }
  }
  const endDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null
    setDragging(null)
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
        <span>{lo.toFixed(1)} — {Math.min(1985, hi).toFixed(1)}</span>
      </div>
      <div className={dragging ? "minimap is-scrubbing is-scrubbing-" + dragging : "minimap"}>
        <svg ref={scrubRef} viewBox="0 0 1000 100" preserveAspectRatio="none"
          role="slider" tabIndex={0} aria-label="Scrub the historical timeline"
          aria-valuemin={MIN} aria-valuemax={MAX} aria-valuenow={Math.round((lo + hi) / 2)}
          aria-valuetext={`Timeline centered around ${Math.round((lo + hi) / 2)}`}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
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
            <rect x={left} width={focusWidth} y={1} height={98} fill="var(--cds-highlight)" fillOpacity={0.22} pointerEvents="none" />
          )}
          {/* Slim visual grips; the existing 15px pointer tolerance preserves easy resizing. */}
          <rect className="minimap-resize-handle" x={Math.max(0, Math.min(996, left - 2))} width={4} y={12} height={76} rx={2} />
          <rect className="minimap-resize-handle" x={Math.max(0, Math.min(996, right - 2))} width={4} y={12} height={76} rx={2} />
        </svg>
      </div>
      <div className="minimap-labels" aria-hidden="true">
        <span>1965</span><span>1970</span><span>1980</span><span>1985</span>
      </div>
    </section>
  )
}
