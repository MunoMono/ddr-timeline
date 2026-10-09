import { category, palette, MIN, MAX } from '../../models/employment'
import type { TimelineLane } from '../../utils/timeline'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'


export default function TimelineOverview({lanes,start,end,periods,selectedPeriod}:{lanes:TimelineLane[];start:number;end:number;periods:DDRPeriod[];selectedPeriod:DDRPeriod|null}) {
  const percent=(date:number)=>((date-MIN)/(MAX-MIN))*1000
  return <section className="overview" aria-label="Full period overview">
    <div className="overview-top">
      <span>DEPARTMENT OF DESIGN RESEARCH / OVERVIEW</span>
      <span>{selectedPeriod ? selectedPeriod.start : Math.floor(start)} — {selectedPeriod ? selectedPeriod.end : Math.min(1985,Math.ceil(end))}</span>
    </div>
    <div className="minimap">
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" role="img" aria-label="Overview of all documented employment periods">
        {periods.filter(p=>p.slug!=='1965-1985').map(p=><rect key={p.slug} x={percent(p.start)} width={percent(p.end+1)-percent(p.start)} y={0} height={100} fill={selectedPeriod?.slug===p.slug?'var(--cds-highlight)':'var(--cds-layer-accent)'} opacity={selectedPeriod?.slug===p.slug?0.5:0.1}><title>{p.label}: {p.start}–{p.end}</title></rect>)}
        {lanes.map(d=><rect key={d.person.staff_code} x={percent(Math.max(MIN,d.start))}
          width={percent(Math.min(MAX,d.end+1))-percent(Math.max(MIN,d.start))}
          y={13+(d.lane%7)*9} height={5}
          fill={palette[category(d.person.job_title_label)]} opacity={0.72}/>)}
        <rect className="minimap-focus" x={percent(start)}
          width={Math.max(10,percent(end)-percent(start))}
          y={0} height={100}
          fill="none" stroke="#ff832b" strokeWidth={2}/>
      </svg>
    </div>
    <div className="minimap-labels"><span>1965</span><span>1970</span><span>1980</span><span>1985</span></div>
  </section>
}
