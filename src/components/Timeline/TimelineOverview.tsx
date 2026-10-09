import { category, palette, MIN, MAX } from '../../models/employment'
import type { TimelineLane } from '../../utils/timeline'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function TimelineOverview({ lanes, start, end, selectedPeriod }: {
  lanes: TimelineLane[]
  start: number
  end: number
  periods: DDRPeriod[]
  selectedPeriod: DDRPeriod | null
}) {
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
      <div className="minimap">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" role="img" aria-label="Overview of documented employment periods">
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
