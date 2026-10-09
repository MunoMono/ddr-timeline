import { Button } from '@carbon/react'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

/** Proportional secondary timeline, aligned to the fixed 1965–1986 time domain. */
export default function PeriodSelector({ periods, selected, onSelect, status }: {
  periods: DDRPeriod[]
  selected: DDRPeriod | null
  onSelect: (period: DDRPeriod | null) => void
  status: 'loading' | 'live' | 'unavailable'
}) {
  const phases = periods.filter(p => p.slug !== '1965-1985')
  const x = (year: number) => ((year - 1965) / 21) * 1000
  return <section className="phase-slide-rule" aria-label="DDR critical period slide rule">
    <div className="phase-rail-meta">
      <span>CRITICAL PERIODS <span className="phase-rail-qualifier">/ researcher's interpretation, not official RCA phases</span></span>
      <Button kind="ghost" size="sm" disabled={!selected} onClick={() => onSelect(null)}>All periods</Button>
    </div>
    {status === 'loading' && <p role="status">Loading critical periods…</p>}
    {status === 'unavailable' && <p role="status">Critical period authority is currently unavailable.</p>}
    {status === 'live' && <svg className="phase-rule-svg" viewBox="0 0 1000 90" preserveAspectRatio="none" role="group" aria-label="Select a researcher's interpretative period">
      {phases.map(p => {
        const left = x(p.start)
        const width = x(p.end + 1) - left
        const active = selected?.slug === p.slug
        const choose = () => onSelect(active ? null : p)
        return <g key={p.slug} role="button" tabIndex={0} className="phase-rule-mark"
          aria-label={p.label + ', ' + p.start + ' to ' + p.end + '. ' + (p.description || '')}
          aria-pressed={active} onClick={choose} onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose() }
          }}>
          <title>{p.label} ({p.start}–{p.end}) — {p.description || 'No description recorded.'} Researcher's interpretation, not an official RCA phase.</title>
          <rect x={left} y={0} width={width} height={90} className={active ? 'phase-mark-active' : 'phase-mark-background'}/>
          <line x1={left} y1={0} x2={left} y2={90} className="phase-rule-boundary"/>
          <text x={left+5} y={22} className="phase-mark-years">{p.start}–{p.end}</text>
          <text x={left+5} y={41} className="phase-mark-name">{width > 115 ? p.label.slice(0, Math.floor(width/7)) : p.label.slice(0, Math.max(4,Math.floor(width/8))) + '…'}</text>
        </g>
      })}
    </svg>}
    <p className="phase-rule-hint">Select a period to slice documented staff tenures. Hover or focus a segment for its description.</p>
  </section>
}
