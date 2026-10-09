import { Button } from '@carbon/react'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

/** Shared year axis. No invented period data: records come from GraphQL. */
export default function PeriodSelector({ periods, selected, onSelect, status }: {
  periods: DDRPeriod[]
  selected: DDRPeriod | null
  onSelect: (period: DDRPeriod | null) => void
  status: 'loading' | 'live' | 'unavailable'
}) {
  const phases = periods.filter(p => p.slug !== '1965-1985')
  const width = (p: DDRPeriod) => ((p.end + 1 - p.start) / 21) * 100
  const offset = (p: DDRPeriod) => ((p.start - 1965) / 21) * 100
  return <section className="phase-slide-rule" aria-label="DDR critical period slide rule">
    <div className="phase-rail-meta">
      <span>CRITICAL PERIODS <span className="phase-rail-qualifier">/ researcher's interpretation, not official RCA phases</span></span>
      <Button kind="ghost" size="sm" disabled={!selected} onClick={() => onSelect(null)}>All periods</Button>
    </div>
    {status === 'loading' && <p role="status">Loading critical periods…</p>}
    {status === 'unavailable' && <p role="status">Critical period authority is currently unavailable.</p>}
    {status === 'live' && <div className="phase-rule" role="group" aria-label="Select an interpretative period to filter staff">
      {phases.map(p => <div className="phase-rule-slot" key={p.slug}
        style={{ left: offset(p) + '%', width: width(p) + '%' }}>
        <button type="button" className="phase-rule-button" aria-pressed={selected?.slug === p.slug}
          aria-label={p.label + ', ' + p.start + ' to ' + p.end}
          onClick={() => onSelect(selected?.slug === p.slug ? null : p)}>
          <span className="phase-rule-dates">{p.start}–{p.end}</span>
          <span className="phase-rule-title">{p.label}</span>
          <span className="phase-tooltip" role="tooltip">
            <strong>{p.label} · {p.start}–{p.end}</strong>
            <span>{p.description || 'No description recorded.'}</span>
            <small>Interpretative periodisation; not an official institutional phase.</small>
          </span>
        </button>
      </div>)}
    </div>}
  </section>
}
