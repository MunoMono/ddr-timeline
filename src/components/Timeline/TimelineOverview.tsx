import { category, palette, MIN, MAX } from '../../models/employment'
import type { TimelineLane } from '../../utils/timeline'


export default function TimelineOverview({lanes,start,end}:{lanes:TimelineLane[];start:number;end:number}) {
  const percent=(date:number)=>((date-MIN)/(MAX-MIN))*1000
  return <section className="overview" aria-label="Full period overview">
    <div className="overview-top">
      <span>DEPARTMENT OF DESIGN RESEARCH / OVERVIEW</span>
      <span>{Math.floor(start)} — {Math.min(1985,Math.ceil(end))}</span>
    </div>
    <div className="minimap">
      <svg viewBox="0 0 1000 100" preserveAspectRatio="none" role="img" aria-label="Overview of all documented employment periods">
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
