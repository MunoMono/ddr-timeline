import { Search, Select, SelectItem } from '@carbon/react'
import { categories } from '../../models/employment'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function StaffFilters({
  search,onSearch,role,onRole,count,periods,periodStatus,period,onPeriod
}:{
  search:string;onSearch:(s:string)=>void;role:string;onRole:(s:string)=>void;count:number;
  periods:DDRPeriod[];periodStatus:'loading'|'live'|'unavailable';period:DDRPeriod|null;
  onPeriod:(slug:string)=>void
}) {
  return <section className="filter-stripe" aria-label="Staff filters">
    <div className="find"><Search size="md" labelText="Find staff" placeholder="Find someone in the archive…" value={search} onChange={e=>onSearch(e.target.value)}/></div>
    <Select id="role-select" labelText="Role family" value={role} onChange={e=>onRole(e.target.value)}>
      {categories.map(c=><SelectItem key={c} value={c} text={c}/>)}
    </Select>
    <Select id="period-select" labelText="Critical period (researcher's interpretation)" value={period?.slug||''}
      disabled={periodStatus !== 'live'} onChange={e=>onPeriod(e.target.value)}>
      <SelectItem value="" text={periodStatus==='loading'?'Loading periods…':periodStatus==='unavailable'?'Periods unavailable':'All periods'}/>
      {periods.filter(p=>p.slug!=='1965-1985').map(p=><SelectItem key={p.slug} value={p.slug} text={p.start+'–'+p.end+' · '+p.label}/>)}
    </Select>
    <div className="filter-counter"><span>{count} MATCHES</span></div>
  </section>
}