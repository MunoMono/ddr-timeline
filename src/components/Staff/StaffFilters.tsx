import { Search, Select, SelectItem } from '@carbon/react'
import { categories } from '../../models/employment'
export default function StaffFilters({search,onSearch,role,onRole,count}:{search:string;onSearch:(s:string)=>void;role:string;onRole:(s:string)=>void;count:number}) {
  return <section className="filter-stripe" aria-label="Staff filters">
    <div className="find"><Search size="md" labelText="Find staff" placeholder="Find someone in the archive…" value={search} onChange={e=>onSearch(e.target.value)}/></div>
    <Select id="role-select" labelText="Role family" value={role} onChange={e=>onRole(e.target.value)}>
      {categories.map(c=><SelectItem key={c} value={c} text={c}/>)}
    </Select>
    <div className="filter-counter"><span>{count} MATCHES</span></div>
  </section>
}
