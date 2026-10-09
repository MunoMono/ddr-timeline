import { Grid, Column, Search, Select, SelectItem } from '@carbon/react'
import { categories } from '../../models/employment'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function StaffFilters({
  search,onSearch,role,onRole,count,periods,periodStatus,period,onPeriod
}:{
  search:string;onSearch:(s:string)=>void;role:string;onRole:(s:string)=>void;count:number;
  periods:DDRPeriod[];periodStatus:'loading'|'live'|'unavailable';period:DDRPeriod|null;
  onPeriod:(slug:string)=>void
}) {
  return <Grid condensed className="filter-stripe" aria-label="Staff filters">
    <Column sm={4} md={3} lg={5} className="filter-cell">
      <label className="cds--label filter-search-label" htmlFor="staff-search">Search staff</label>
      <Search id="staff-search" size="md" labelText="Search staff" placeholder="Find someone in the archive…" value={search} onChange={e=>onSearch(e.target.value)}/>
    </Column>
    <Column sm={4} md={2} lg={4} className="filter-cell">
      <Select id="role-select" labelText="Role family" value={role} onChange={e=>onRole(e.target.value)}>
        {categories.map(c=><SelectItem key={c} value={c} text={c}/>)}
      </Select>
    </Column>
    <Column sm={4} md={3} lg={5} className="filter-cell">
      <Select id="period-select" labelText="Critical period" value={period?.slug||''}
        disabled={periodStatus !== 'live'} onChange={e=>onPeriod(e.target.value)}>
        <SelectItem value="" text={periodStatus==='loading'?'Loading periods…':periodStatus==='unavailable'?'Periods unavailable':'All periods'}/>
        {periods.filter(p=>p.slug!=='1965-1985').map(p=><SelectItem key={p.slug} value={p.slug} text={p.start+'–'+p.end+' · '+p.label}/>)}
      </Select>
    </Column>
    <Column sm={4} md={8} lg={2} className="filter-count-cell"><span className="filter-counter">{count} MATCHES</span></Column>
  </Grid>
}