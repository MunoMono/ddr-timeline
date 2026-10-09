import { Search, Select, SelectItem } from '@carbon/react'
import { categories } from '../../models/employment'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function StaffFilters({
  search,onSearch,role,onRole,periods,periodStatus,period,onPeriod
}:{
  search:string;onSearch:(s:string)=>void;role:string;onRole:(s:string)=>void;count:number;
  periods:DDRPeriod[];periodStatus:'loading'|'live'|'unavailable';period:DDRPeriod|null;
  onPeriod:(slug:string)=>void
}) {
  return <div className="filter-stripe" aria-label="Staff filters">
    <div className="filter-cell">
      <label className="cds--label filter-search-label" htmlFor="staff-search">Search staff</label>
      <Search id="staff-search" size="md" labelText="Search staff" placeholder="Find someone in the archive…" value={search} onChange={e=>onSearch(e.target.value)}/>
    </div>
    <div className="filter-cell">
      <Select id="role-select" labelText="Role family" value={role} onChange={e=>onRole(e.target.value)}>
        {categories.map(c=><SelectItem key={c} value={c} text={c}/>)}
      </Select>
    </div>
    <div className="filter-cell">
      <Select id="period-select" labelText="Critical period" value={period?.slug||''}
        disabled={periodStatus !== 'live'} onChange={e=>onPeriod(e.target.value)}>
        <SelectItem value="" text={periodStatus==='loading'?'Loading periods…':periodStatus==='unavailable'?'Periods unavailable':'All periods'}/>
        {periods.filter(p=>p.slug!=='1965-1985').map(p=><SelectItem key={p.slug} value={p.slug} text={p.start+'–'+p.end+' · '+p.label}/>)}
      </Select>
    </div>
  </div>
}