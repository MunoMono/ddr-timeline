import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Employment = {
  staff_code: string
  agent_name: string
  job_title_code: string
  job_title_label: string
  start_date: string | null
  end_date: string | null
  is_primary: boolean
}
type Payload = { agent_employment: Employment[] }
type Source = 'loading' | 'live' | 'snapshot'
const QUERY = `query StaffEmployment { agent_employment { staff_code agent_name job_title_code job_title_label start_date end_date is_primary } }`
const GRAPHQL = import.meta.env.VITE_GRAPHQL_URL || 'https://api.ddrarchive.org/graphql'
const START = 1960
const END = 1989
const YEARS = Array.from({ length: END - START + 1 }, (_, i) => START + i)
const parseYear = (date: string | null) => date ? Number(date.slice(0, 4)) : null
const categories = ['All roles', 'Research', 'Teaching', 'Administration', 'Technical', 'Other'] as const
type Category = typeof categories[number]

function roleGroup(title: string): Exclude<Category, 'All roles'> {
  const t = title.toLowerCase()
  if (/secretary|administration|information research officer/.test(t)) return 'Administration'
  if (/technician|programmer|computing/.test(t)) return 'Technical'
  if (/tutor|teaching|education unit/.test(t)) return 'Teaching'
  if (/research|fellow|associate|assistant/.test(t)) return 'Research'
  return 'Other'
}
const colors: Record<Exclude<Category, 'All roles'>, string> = {
  Research: '#265cbf', Teaching: '#d66c35', Administration: '#8b64a5',
  Technical: '#167d78', Other: '#71756b'
}
const isEmployment = (value: unknown): value is Employment => {
  if (typeof value !== 'object' || value === null) return false
  const x = value as Record<string, unknown>
  return typeof x.staff_code === 'string' && typeof x.agent_name === 'string' &&
    typeof x.job_title_label === 'string' && (x.start_date === null || typeof x.start_date === 'string') &&
    (x.end_date === null || typeof x.end_date === 'string')
}
async function loadSnapshot(): Promise<Employment[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/agent_employment.json`)
  if (!res.ok) throw Error('Source snapshot could not be loaded.')
  const json: Payload = await res.json()
  if (!Array.isArray(json.agent_employment)) throw Error('Invalid snapshot.')
  return json.agent_employment.filter(isEmployment)
}
async function loadLive(signal: AbortSignal): Promise<Employment[]> {
  const res = await fetch(GRAPHQL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY }), signal
  })
  if (!res.ok) throw Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw Error(json.errors[0].message || 'GraphQL error')
  const rows = json?.data?.agent_employment
  if (!Array.isArray(rows) || !rows.every(isEmployment)) throw Error('GraphQL employment response did not match expected schema.')
  return rows
}
function duration(record: Employment) {
  if (!record.start_date || !record.end_date) return 'Tenure not established'
  const from = parseYear(record.start_date)!
  const to = parseYear(record.end_date)!
  return `${from}–${to} · ${to - from + 1} calendar years (inclusive)`
}
export default function App() {
  const [records, setRecords] = useState<Employment[]>([])
  const [source, setSource] = useState<Source>('loading')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<Category>('All roles')
  const [sort, setSort] = useState<'name' | 'start' | 'duration'>('start')
  const [year, setYear] = useState<number | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [showUnknown, setShowUnknown] = useState(true)
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    ;(async () => {
      try {
        const live = await loadLive(controller.signal)
        if (active) { setRecords(live); setSource('live') }
      } catch (e) {
        if (!active) return
        try {
          const snapshot = await loadSnapshot()
          if (active) { setRecords(snapshot); setSource('snapshot'); setError(e instanceof Error ? e.message : 'Live API unavailable') }
        } catch {
          if (active) { setError('Neither the API nor archival snapshot could be loaded.'); setSource('snapshot') }
        }
      }
    })()
    return () => { active = false; controller.abort() }
  }, [])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return records.filter(r => {
      const a = parseYear(r.start_date), b = parseYear(r.end_date)
      if (!showUnknown && (a === null || b === null)) return false
      if (role !== 'All roles' && roleGroup(r.job_title_label) !== role) return false
      if (q && !`${r.agent_name} ${r.job_title_label} ${r.staff_code}`.toLowerCase().includes(q)) return false
      if (year !== null && (a === null || b === null || a > year || b < year)) return false
      return true
    }).sort((a, b) => sort === 'name' ? a.agent_name.localeCompare(b.agent_name) :
      sort === 'duration' ? ((parseYear(b.end_date) ?? 0) - (parseYear(b.start_date) ?? 0)) -
        ((parseYear(a.end_date) ?? 0) - (parseYear(a.start_date) ?? 0)) || a.agent_name.localeCompare(b.agent_name) :
      (parseYear(a.start_date) ?? 9999) - (parseYear(b.start_date) ?? 9999) || a.agent_name.localeCompare(b.agent_name))
  }, [records, role, query, sort, year, showUnknown])
  const active = filtered.find(r => r.staff_code === selected) || null
  const dated = filtered.filter(r => r.start_date && r.end_date)
  const unknown = filtered.length - dated.length
  const decade = [1960, 1970, 1980]
  const counts = YEARS.map(y => records.filter(r => {
    const a = parseYear(r.start_date), b = parseYear(r.end_date)
    return a !== null && b !== null && a <= y && b >= y
  }).length)
  const maximum = Math.max(...counts, 1)

  return (
    <div className="atlas">
      <header className="masthead">
        <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="DDR staff atlas home"><span className="wordmark-symbol">D<span>·</span>R</span><span>ROYAL COLLEGE OF ART<br/>DEPARTMENT OF DESIGN RESEARCH</span></a>
        <div className="masthead-right"><span className="edition">ARCHIVAL VISUALISATION / 01</span><a href="https://ddrarchive.org/api" target="_blank" rel="noreferrer">Source archive ↗</a></div>
      </header>
      <div className="hero">
        <div className="hero-top"><span className="kicker"><span className="live-circle"/> A LIVING INDEX OF AN HISTORICAL RECORD</span><span>1960—1989 / PERSONNEL</span></div>
        <h1>People <em>in</em> time<span className="hero-stop">.</span></h1>
        <div className="hero-bottom"><p>Who made the Department of Design Research? Explore documented staff, roles, and employment tenures across three decades.</p><div className="hero-index"><strong>{records.length || '—'}</strong><span>RECORDED<br/>STAFF ENTRIES</span></div></div>
      </div>
      <section className="insights" aria-label="Timeline overview">
        <div className="insight-title"><span className="eyebrow">01 / THE OVERVIEW</span><h2>A department<br/>in motion.</h2><p>Year-by-year staff presence inferred from supplied start and end dates. Tap a bar to isolate one year.</p></div>
        <div className="histogram" aria-label="Staff counts by year">
          <div className="histogram-bars">
            {YEARS.map((y, i) => <button type="button" className={`histobar ${year === y ? 'is-current' : ''}`} key={y}
              title={`${y}: ${counts[i]} records`} aria-label={`Filter to ${y}, ${counts[i]} recorded staff`} aria-pressed={year === y}
              onClick={() => setYear(year === y ? null : y)}><span style={{ height: `${Math.max(3, counts[i] / maximum * 100)}%` }}/></button>)}
          </div>
          <div className="histogram-axis">{decade.map(y => <span key={y}>{y}</span>)}<span>1989</span></div>
          <div className="histogram-key"><i/> STAFF WITH DOCUMENTED TENURE <b>{year === null ? 'ALL YEARS' : year}</b></div>
        </div>
      </section>
      <section className="collection" aria-labelledby="people-heading">
        <div className="collection-head"><div><span className="eyebrow">02 / EXPLORE THE RECORD</span><h2 id="people-heading">Staff timelines<span className="count-sup">{filtered.length}</span></h2></div><span className="status"><i className={source === 'live' ? 'is-live' : ''}/>{source === 'loading' ? 'Loading records' : source === 'live' ? 'LIVE GRAPHQL DATA' : 'ARCHIVAL SNAPSHOT'}</span></div>
        <div className="toolbar">
          <label className="search-wrap"><span>FIND A PERSON OR ROLE</span><input type="search" placeholder="Search names, roles…" value={query} onChange={e => setQuery(e.target.value)}/></label>
          <label><span>ROLE FAMILY</span><select value={role} onChange={e => setRole(e.target.value as Category)}>{categories.map(x => <option key={x}>{x}</option>)}</select></label>
          <label><span>ORDER BY</span><select value={sort} onChange={e => setSort(e.target.value as typeof sort)}><option value="start">Start date</option><option value="name">Name A—Z</option><option value="duration">Longest tenure</option></select></label>
          <label className="check-wrap"><input type="checkbox" checked={showUnknown} onChange={e => setShowUnknown(e.target.checked)}/>Include undated</label>
          <button className="reset" type="button" onClick={() => { setQuery(''); setRole('All roles'); setSort('start'); setYear(null); setShowUnknown(true) }}>RESET ↗</button>
        </div>
        <div className="legend">{(Object.keys(colors) as Array<Exclude<Category,'All roles'>>).map(c => <button key={c} type="button" aria-pressed={role === c} onClick={() => setRole(role === c ? 'All roles' : c)}><i style={{ background: colors[c] }}/>{c}</button>)}<span className="legend-extra">{unknown} undated in current view</span></div>
        <div className="timeline-table">
          <div className="table-header"><span>NAME / DOCUMENTED ROLE</span><div className="ruler" aria-label="Years 1960 to 1989">{[1960,1965,1970,1975,1980,1985,1989].map(y => <span key={y} style={{ left: `${(y - START) / (END - START) * 100}%` }}>{y}</span>)}</div><span className="tenure-head">PERIOD</span></div>
          {filtered.map(r => {
            const a = parseYear(r.start_date), b = parseYear(r.end_date)
            const known = a !== null && b !== null && b >= a
            const group = roleGroup(r.job_title_label)
            return <button type="button" key={r.staff_code} className={`staff-row ${selected === r.staff_code ? 'selected' : ''}`} onClick={() => setSelected(selected === r.staff_code ? null : r.staff_code)} aria-expanded={selected === r.staff_code}>
              <span className="person"><strong>{r.agent_name}</strong><small>{r.job_title_label}</small></span>
              <span className="time-track">{[1965,1970,1975,1980,1985].map(y => <i key={y} className="vertical-rule" style={{ left: `${(y - START) / (END - START) * 100}%` }}/>)}
                {known ? <span className="tenure-bar" style={{ left: `${Math.max(0,(a-START)/(END-START)*100)}%`, width: `${Math.max(0.9,(Math.min(END,b)-Math.max(START,a)+0.8)/(END-START)*100)}%`, background: colors[group] }} /> : <span className="missing-dates">DATE UNKNOWN</span>}
              </span><span className="tenure-text">{known ? `${a}—${b}` : '—'}<span className="row-arrow">{selected === r.staff_code ? '−' : '+'}</span></span>
            </button>
          })}
          {source !== 'loading' && filtered.length === 0 && <div className="no-results">No matching records. Try clearing your filters.</div>}
          {source === 'loading' && <div className="no-results">Loading recorded employment history…</div>}
        </div>
        {active && <div className="detail-panel" aria-live="polite"><button className="close-detail" type="button" onClick={() => setSelected(null)} aria-label="Close person details">✕</button><span className="eyebrow">03 / PERSON RECORD · {active.staff_code}</span><h3>{active.agent_name}</h3><p className="person-role">{active.job_title_label}</p><dl><div><dt>DOCUMENTED PERIOD</dt><dd>{duration(active)}</dd></div><div><dt>ROLE CODE</dt><dd>{active.job_title_code}</dd></div><div><dt>PRIMARY ENTRY</dt><dd>{active.is_primary ? 'Yes' : 'No'}</dd></div><div><dt>SOURCE</dt><dd>{source === 'live' ? 'DDR Archive GraphQL' : 'Researcher-supplied JSON extract'}</dd></div></dl><p className="evidence-note">These dates describe the span recorded in the dataset. They do not independently establish exact employment dates or when changes between successive roles occurred. Multi-stage job titles are preserved verbatim.</p></div>}
      </section>
      <footer className="foot"><div><strong>DDR / PEOPLE IN TIME</strong><p>Research interface · Royal College of Art design research history</p></div><div><p>{source === 'live' ? 'Source: live DDR GraphQL endpoint' : 'Source: supplied employment extract (offline fallback)'}</p><p>{error ? `Live API note: ${error}` : 'Source status verified in browser at load time.'}</p><p>Annual bins reflect recorded inclusive year ranges; missing dates remain unknown.</p></div></footer>
    </div>
  )
}
