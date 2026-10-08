import { useEffect, useMemo, useRef, useState } from 'react'
import { select, scaleLinear, zoom, zoomIdentity, type ZoomBehavior } from 'd3'
import { Button, Search, Tag, Select, SelectItem } from '@carbon/react'
import {
  Add,
  Subtract,
  Reset,
  ArrowLeft,
  ArrowRight,
  Close,
  Information,
} from '@carbon/icons-react'
import './App.css'

type Staff = {
  staff_code: string
  agent_name: string
  job_title_code: string
  job_title_label: string
  start_date: string | null
  end_date: string | null
  is_primary: boolean
}
type Category = 'Research' | 'Teaching' | 'Administration' | 'Technical' | 'Other'
const API = import.meta.env.VITE_GRAPHQL_URL || 'https://api.ddrarchive.org/graphql'
const QUERY =
  'query { agent_employment { staff_code agent_name job_title_code job_title_label start_date end_date is_primary } }'
const MIN = 1965,
  MAX = 1986
const year = (s: string | null) => (s ? Number(s.slice(0, 4)) : null)
function category(label: string): Category {
  const t = label.toLowerCase()
  if (/secretary|administration|information research officer/.test(t))
    return 'Administration'
  if (/technician|programmer|computing/.test(t)) return 'Technical'
  if (/tutor|teaching|education unit/.test(t)) return 'Teaching'
  if (/research|fellow|associate|assistant/.test(t)) return 'Research'
  return 'Other'
}
const palette: Record<Category, string> = {
  Research: '#0f62fe',
  Teaching: '#ff832b',
  Administration: '#be95ff',
  Technical: '#42be65',
  Other: '#a8a8a8',
}
const categories = [
  'All roles',
  'Research',
  'Teaching',
  'Administration',
  'Technical',
  'Other',
] as const
const fmt = (n: number) => String(n)
function InteractiveTimeline({
  people,
  selected,
  onSelect,
}: {
  people: Staff[]
  selected: Staff | null
  onSelect: (s: Staff | null) => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [dimensions, setDimensions] = useState({ w: 1050, h: 610 })
  const [view, setView] = useState({ k: 1, x: 0 })
  const [hover, setHover] = useState<{ person: Staff; x: number; y: number } | null>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const chartW = dimensions.w
  const left = 26
  const base = scaleLinear()
    .domain([MIN, MAX])
    .range([left, chartW - 22])
  const scale = base
    .copy()
    .range([left + view.x, left + view.x + (chartW - 22 - left) * view.k])
  const dated = people.filter(
    (p) =>
      year(p.start_date) !== null &&
      year(p.end_date) !== null &&
      year(p.start_date)! <= 1985 &&
      year(p.end_date)! >= MIN,
  )
  const lanes = useMemo(() => {
    const sorted = [...dated].sort(
      (a, b) =>
        (year(a.start_date) ?? 0) - (year(b.start_date) ?? 0) ||
        a.agent_name.localeCompare(b.agent_name),
    )
    const ends: number[] = []
    return sorted.map((person) => {
      const start = year(person.start_date)!,
        end = year(person.end_date)!
      let lane = ends.findIndex((last) => last < start)
      if (lane < 0) {
        lane = ends.length
        ends.push(end)
      } else ends[lane] = end
      return { person, lane, start, end }
    })
  }, [dated])
  const laneCount = Math.max(1, ...lanes.map((d) => d.lane + 1))
  const laneH = Math.max(27, Math.min(48, 450 / laneCount))
  const sceneH = Math.max(400, laneCount * laneH + 116)
  const visible = lanes.filter(
    (d) => scale(d.end + 1) > -50 && scale(d.start) < chartW + 50,
  )
  const tickStep = view.k >= 6 ? 1 : view.k >= 3 ? 2 : 5
  const ticks = Array.from(
    { length: Math.ceil((MAX - MIN) / tickStep) + 1 },
    (_, i) => MIN + i * tickStep,
  ).filter((y) => y <= 1985)
  useEffect(() => {
    if (!root.current || typeof ResizeObserver === 'undefined') return
    const ob = new ResizeObserver(([entry]) =>
      setDimensions({
        w: Math.max(320, entry.contentRect.width),
        h: Math.max(300, entry.contentRect.height),
      }),
    )
    ob.observe(root.current)
    return () => ob.disconnect()
  }, [])
  useEffect(() => {
    const node = svg.current
    if (!node) return
    const w = dimensions.w
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .translateExtent([
        [0, 0],
        [w, sceneH],
      ])
      .extent([
        [0, 0],
        [w, sceneH],
      ])
      .filter((e) => e.type !== 'wheel' || e.ctrlKey || e.metaKey)
      .on('zoom', (e) => setView({ k: e.transform.k, x: e.transform.x }))
    zoomRef.current = behavior
    select(node).call(behavior)
    return () => {
      select(node).on('.zoom', null)
    }
  }, [dimensions.w, sceneH])
  const act = (op: 'in' | 'out' | 'reset' | 'left' | 'right') => {
    if (!svg.current || !zoomRef.current) return
    const el = select(svg.current),
      z = zoomRef.current
    const target = el.transition().duration(320)
    if (op === 'reset') target.call(z.transform, zoomIdentity)
    else if (op === 'in' || op === 'out')
      target.call(z.scaleBy, op === 'in' ? 1.7 : 1 / 1.7, [chartW / 2, sceneH / 2])
    else target.call(z.translateBy, op === 'left' ? 110 : -110, 0)
  }
  const overviewStart = Math.max(MIN, scale.invert(left))
  const overviewEnd = Math.min(MAX, scale.invert(chartW - 22))
  const near = selected
    ? people.filter(
        (p) =>
          p.staff_code !== selected.staff_code &&
          year(p.start_date) !== null &&
          year(p.end_date) !== null &&
          year(selected.start_date) !== null &&
          year(selected.end_date) !== null &&
          year(p.start_date)! <= year(selected.end_date)! &&
          year(p.end_date)! >= year(selected.start_date)!,
      ).length
    : 0
  return (
    <div className="explorer">
      <div className="explorer-top">
        <div className="explorer-title">
          <span className="eyebrow">
            INTERACTIVE ARCHIVAL CANVAS <span className="orange-dot">●</span> 1965—1985
          </span>
          <h2>
            Working lives<span>.</span>
          </h2>
          <p>
            Follow the people who shaped a department. Select a band to examine its
            recorded history.
          </p>
        </div>
        <div className="navigation">
          <div className="nav-hint">DRAG ← → TO TRAVEL · PINCH TO ZOOM</div>
          <div className="nav-actions">
            <Button
              kind="ghost"
              size="md"
              hasIconOnly
              iconDescription="Earlier years"
              renderIcon={ArrowLeft}
              onClick={() => act('left')}
            />
            <Button
              kind="ghost"
              size="md"
              hasIconOnly
              iconDescription="Later years"
              renderIcon={ArrowRight}
              onClick={() => act('right')}
            />
            <Button
              kind="ghost"
              size="md"
              hasIconOnly
              iconDescription="Zoom out"
              renderIcon={Subtract}
              onClick={() => act('out')}
            />
            <Button
              kind="ghost"
              size="md"
              hasIconOnly
              iconDescription="Zoom in"
              renderIcon={Add}
              onClick={() => act('in')}
            />
            <Button
              kind="ghost"
              size="md"
              hasIconOnly
              iconDescription="Reset view"
              renderIcon={Reset}
              onClick={() => act('reset')}
            />
          </div>
        </div>
      </div>
      <div className="overview">
        <div className="overview-top">
          <span>DEPARTMENT OF DESIGN RESEARCH / OVERVIEW</span>
          <span>
            {Math.floor(overviewStart)} — {Math.min(1985, Math.ceil(overviewEnd))}
          </span>
        </div>
        <div className="minimap">
          <div
            className="minimap-window"
            style={{
              left: `${((overviewStart - MIN) / (MAX - MIN)) * 100}%`,
              width: `${Math.max(1, ((overviewEnd - overviewStart) / (MAX - MIN)) * 100)}%`,
            }}
          />
          {lanes.map((d) => (
            <span
              key={d.person.staff_code}
              className="minimap-band"
              style={{
                left: `${((Math.max(MIN, d.start) - MIN) / (MAX - MIN)) * 100}%`,
                width: `${((Math.min(MAX, d.end + 1) - Math.max(MIN, d.start)) / (MAX - MIN)) * 100}%`,
                top: `${13 + (d.lane % 7) * 9}%`,
                background: palette[category(d.person.job_title_label)],
              }}
            />
          ))}
        </div>
        <div className="minimap-labels">
          <span>1965</span>
          <span>1970</span>
          <span>1980</span>
          <span>1985</span>
        </div>
      </div>
      <div className="canvas-wrap" ref={root}>
        <svg
          ref={svg}
          viewBox={`0 0 ${chartW} ${sceneH}`}
          className="main-canvas"
          role="img"
          aria-label="Drag, pinch and select employment bands on the interactive historical timeline"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const point = e.clientX - rect.left
            setCursor(scale.invert(point))
          }}
          onPointerLeave={() => {
            setCursor(null)
            setHover(null)
          }}
        >
          <rect width={chartW} height={sceneH} fill="#161616" />
          {ticks.map((y) => (
            <g key={y}>
              <line
                x1={scale(y)}
                y1="48"
                x2={scale(y)}
                y2={sceneH - 35}
                stroke="#393939"
                strokeDasharray={y % 10 === 0 ? 'none' : '3 9'}
              />
              <text
                x={scale(y) + 5}
                y="30"
                fill={y % 10 === 0 ? '#f4f4f4' : '#a8a8a8'}
                fontSize={y % 10 === 0 ? 17 : 11}
                fontFamily="IBM Plex Mono, monospace"
              >
                {y}
              </text>
            </g>
          ))}
          {Array.from({ length: laneCount }, (_, i) => (
            <line
              key={i}
              x1="0"
              x2={chartW}
              y1={74 + i * laneH + laneH - 2}
              y2={74 + i * laneH + laneH - 2}
              stroke="#262626"
            />
          ))}
          {visible.map(({ person, lane, start, end }) => {
            const x = scale(Math.max(start, MIN)),
              right = scale(Math.min(end + 1, MAX)),
              w = Math.max(3, right - x),
              y = 75 + lane * laneH
            const isSelected = person.staff_code === selected?.staff_code
            const faded =
              selected &&
              !isSelected &&
              !(start <= year(selected.end_date)! && end >= year(selected.start_date)!)
            return (
              <g key={person.staff_code} className="timeline-entity">
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={laneH - 6}
                  rx="2"
                  fill={palette[category(person.job_title_label)]}
                  opacity={faded ? 0.18 : isSelected ? 1 : 0.83}
                  stroke={isSelected ? 'white' : 'none'}
                  strokeWidth="2"
                  className="interactive-band"
                  onPointerEnter={(e) => {
                    const rect = root.current?.getBoundingClientRect()
                    if (rect)
                      setHover({
                        person,
                        x: Math.min(rect.width - 245, e.clientX - rect.left + 15),
                        y: Math.max(8, e.clientY - rect.top - 65),
                      })
                  }}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onSelect(isSelected ? null : person)}
                >
                  <title>
                    {person.agent_name} · {start}–{end}
                  </title>
                </rect>
                {w > 85 && (
                  <text
                    className="band-label"
                    x={x + 9}
                    y={y + (laneH - 6) / 2 + 4}
                    fontSize={Math.min(14, laneH * 0.38)}
                    fill="#fff"
                    pointerEvents="none"
                  >
                    {person.agent_name.length > Math.floor((w - 18) / 7)
                      ? person.agent_name.slice(
                          0,
                          Math.max(3, Math.floor((w - 25) / 7)),
                        ) + '…'
                      : person.agent_name}
                  </text>
                )}
              </g>
            )
          })}
          {cursor !== null && cursor >= MIN && cursor <= MAX && (
            <g pointerEvents="none">
              <line
                x1={scale(cursor)}
                x2={scale(cursor)}
                y1="44"
                y2={sceneH - 25}
                stroke="#f1c21b"
                strokeWidth="1"
              />
              <text
                x={Math.min(chartW - 50, Math.max(4, scale(cursor) + 8))}
                y={sceneH - 10}
                fill="#f1c21b"
                fontSize="12"
                fontFamily="IBM Plex Mono,monospace"
              >
                {cursor.toFixed(1)}
              </text>
            </g>
          )}
        </svg>
        {hover && (
          <div
            className="floating-tip"
            style={{ left: Math.max(5, hover.x), top: hover.y }}
          >
            <span>DOCUMENTED STAFF</span>
            <strong>{hover.person.agent_name}</strong>
            <p>{hover.person.job_title_label}</p>
            <small>
              {year(hover.person.start_date)}—{year(hover.person.end_date)}
            </small>
          </div>
        )}
      </div>
      <div className="under-canvas">
        <span>
          <Information size={16} /> Employment dates shown as recorded; overlapping
          tenures do not prove collaboration.
        </span>
        <span>
          ZOOM {fmt(Math.round(view.k * 100))}% · {lanes.length} DATED ENTRIES
        </span>
      </div>
      {selected && (
        <aside className="person-panel">
          <button
            type="button"
            className="panel-close"
            onClick={() => onSelect(null)}
            aria-label="Close staff details"
          >
            <Close />
          </button>
          <span className="eyebrow">SELECTED RECORD / {selected.staff_code}</span>
          <h3>{selected.agent_name}</h3>
          <p className="person-position">{selected.job_title_label}</p>
          <div className="panel-grid">
            <div>
              <small>DOCUMENTED PERIOD</small>
              <strong>
                {year(selected.start_date) ?? 'Unknown'} —{' '}
                {year(selected.end_date) ?? 'Unknown'}
              </strong>
            </div>
            <div>
              <small>ROLE CLASSIFICATION</small>
              <strong>{category(selected.job_title_label)}</strong>
            </div>
            <div>
              <small>CONTEMPORARIES</small>
              <strong>{near} overlapping tenures</strong>
            </div>
            <div>
              <small>RECORD IDENTIFIER</small>
              <strong>{selected.staff_code}</strong>
            </div>
          </div>
          <p className="panel-disclaimer">
            Co-presence is derived from date overlap only. Roles with “later” in the
            description have no separately established transition dates.
          </p>
        </aside>
      )}
    </div>
  )
}
export default function App() {
  const [people, setPeople] = useState<Staff[]>([])
  const [source, setSource] = useState('LOADING')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<string>('All roles')
  const [selected, setSelected] = useState<Staff | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const snapshot = async () => {
      const r = await fetch(`${import.meta.env.BASE_URL}data/agent_employment.json`)
      if (!r.ok) throw Error('Snapshot unavailable')
      return (await r.json()).agent_employment as Staff[]
    }
    ;(async () => {
      try {
        const r = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: QUERY }),
          signal: controller.signal,
        })
        if (!r.ok) throw Error('API unavailable')
        const j = await r.json()
        if (!Array.isArray(j.data?.agent_employment)) throw Error('API schema mismatch')
        setPeople(j.data.agent_employment)
        setSource('LIVE GRAPHQL')
      } catch {
        if (controller.signal.aborted) return
        try {
          setPeople(await snapshot())
          setSource('ARCHIVAL SNAPSHOT')
        } catch {
          setSource('DATA UNAVAILABLE')
        }
      }
    })()
    return () => controller.abort()
  }, [])
  const filtered = useMemo(
    () =>
      people.filter(
        (p) =>
          (role === 'All roles' || category(p.job_title_label) === role) &&
          `${p.agent_name} ${p.job_title_label}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [people, search, role],
  )
  return (
    <div className="redesign">
      <header className="compact-header">
        <div className="compact-heading">
          <span className="compact-kicker">RCA / DDR / 1965–1985</span>
          <h1>
            Department of Design Research <span>timeline</span>
          </h1>
        </div>
        <div className="compact-meta">
          <Tag type={source === 'LIVE GRAPHQL' ? 'green' : 'purple'}>{source}</Tag>
          <strong>{people.length}</strong>
          <span>STAFF ENTRIES</span>
        </div>
      </header>
      <div className="filter-stripe">
        <div className="find">
          <Search
            size="md"
            labelText="Find staff"
            placeholder="Find someone in the archive…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          id="role-select"
          labelText="Role family"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {categories.map((c) => (
            <SelectItem key={c} value={c} text={c} />
          ))}
        </Select>
        <div className="filter-counter">
          <Tag type={source === 'LIVE GRAPHQL' ? 'green' : 'purple'}>{source}</Tag>
          <span>{filtered.length} MATCHES</span>
        </div>
      </div>
      <InteractiveTimeline people={filtered} selected={selected} onSelect={setSelected} />
    </div>
  )
}
