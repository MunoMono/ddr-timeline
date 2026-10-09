import { useEffect, useMemo, useState } from 'react'
import { Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction, Theme } from '@carbon/react'
import { Moon, Sun } from '@carbon/icons-react'
import { category, type Staff } from './models/employment'
import { useEmployment } from './hooks/useEmployment'
import TimelineHeader from './components/Header/TimelineHeader'
import StaffFilters from './components/Staff/StaffFilters'
import TimelineCanvas from './components/Timeline/TimelineCanvas'
import { useDDRPeriods, type DDRPeriod } from './hooks/useDDRPeriods'
import { year } from './models/employment'

const THEME_KEY = 'ddr-timeline-theme'
export default function App() {
  const [dark, setDark] = useState(() => {
    try { return window.localStorage.getItem(THEME_KEY) !== 'g10' } catch { return true }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'g90' : 'g10'
    try { window.localStorage.setItem(THEME_KEY, dark ? 'g90' : 'g10') } catch { /* Storage disabled */ }
  }, [dark])
  const { people, source } = useEmployment()
  const { periods, status: periodStatus } = useDDRPeriods()
  const [period, setPeriod] = useState<DDRPeriod | null>(null)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('All roles')
  const [selected, setSelected] = useState<Staff | null>(null)
  const filtered = useMemo(() =>
    people.filter(p =>
      (!period || (year(p.start_date) !== null && year(p.end_date) !== null && year(p.start_date)! <= period.end && year(p.end_date)! >= period.start)) &&
      (role === 'All roles' || category(p.job_title_label) === role) &&
      `${p.agent_name} ${p.job_title_label}`.toLowerCase().includes(search.toLowerCase())
    ), [people, role, search, period])
  return <Theme theme={dark ? 'g90' : 'g10'}>
    <div className="ddr-app-shell">
      <Header aria-label="DDR timeline application">
        <HeaderName href="#" prefix="">Graham Newman RCA PhD</HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setDark(current => !current)} tooltipAlignment="end">
            {dark ? <Sun size={20}/> : <Moon size={20}/>}
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <main className="redesign">
    <TimelineHeader source={source} count={people.length}/>
    <TimelineCanvas people={filtered} selected={selected} onSelect={setSelected} periods={periods} selectedPeriod={period} toolbar={<StaffFilters search={search} onSearch={setSearch} role={role} onRole={setRole} count={filtered.length} periods={periods} periodStatus={periodStatus} period={period} onPeriod={(slug) => { setPeriod(periods.find(p => p.slug === slug) || null); setSelected(null) }}/>} />
      </main>
    </div>
  </Theme>
}
