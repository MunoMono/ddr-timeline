import { useMemo, useState } from 'react'
import { category, type Staff } from './models/employment'
import { useEmployment } from './hooks/useEmployment'
import TimelineHeader from './components/Header/TimelineHeader'
import StaffFilters from './components/Staff/StaffFilters'
import TimelineCanvas from './components/Timeline/TimelineCanvas'

export default function App() {
  const { people, source } = useEmployment()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('All roles')
  const [selected, setSelected] = useState<Staff | null>(null)
  const filtered = useMemo(() =>
    people.filter(p =>
      (role === 'All roles' || category(p.job_title_label) === role) &&
      `${p.agent_name} ${p.job_title_label}`.toLowerCase().includes(search.toLowerCase())
    ), [people, role, search])
  return <main className="redesign">
    <TimelineHeader source={source} count={people.length}/>
    <StaffFilters search={search} onSearch={setSearch} role={role} onRole={setRole} count={filtered.length}/>
    <TimelineCanvas people={filtered} selected={selected} onSelect={setSelected}/>
  </main>
}
