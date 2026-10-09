import { Button } from '@carbon/react'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function PeriodSelector({periods, selected, onSelect, status}:{
  periods: DDRPeriod[]; selected: DDRPeriod | null; onSelect:(period:DDRPeriod|null)=>void;
  status:'loading'|'live'|'unavailable'
}) {
  const phases = periods.filter(period => period.slug !== '1965-1985')
  return <section className="critical-periods" aria-label="Researcher's critical periodisation">
    <div className="critical-periods-intro">
      <div>
        <h2>Critical periods</h2>
        <p>Researcher's interpretative periodisation, not official RCA institutional classifications. Boundaries are approximate calendar-year groupings.</p>
      </div>
      <Button kind="ghost" size="sm" disabled={!selected} onClick={()=>onSelect(null)}>All periods</Button>
    </div>
    {status === 'loading' && <p role="status">Loading critical periods from DDR GraphQL…</p>}
    {status === 'unavailable' && <p role="status">Critical periods are unavailable from the DDR API. No replacement chronology has been invented.</p>}
    {status === 'live' && <div className="critical-periods-grid">
      {phases.map(period => <button type="button" key={period.slug}
        className="critical-period" aria-pressed={selected?.slug === period.slug}
        onClick={()=>onSelect(selected?.slug === period.slug ? null : period)}>
        <span className="critical-period-years">{period.start}–{period.end}</span>
        <strong>{period.label}</strong>
        {period.description && <small>{period.description}</small>}
      </button>)}
    </div>}
  </section>
}
