import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { scaleLinear } from 'd3'
import { useTimelineZoom } from '../../hooks/useTimelineZoom'
import { Information, Download } from '@carbon/icons-react'
import { Button } from '@carbon/react'
import { downloadCSV, downloadSVGAsPNG } from '../../utils/export'
import TimelineControls from './TimelineControls'
import TimelineOverview from './TimelineOverview'
import { category, palette, MIN, MAX, year, type Staff } from '../../models/employment'
import { packEmploymentLanes } from '../../utils/timeline'
import type { DDRPeriod } from '../../hooks/useDDRPeriods'

export default function InteractiveTimeline({
  people,
  selected,
  onSelect,
  periods,
  selectedPeriod,
  toolbar,
}: {
  people: Staff[]
  selected: Staff | null
  onSelect: (s: Staff | null) => void
  periods: DDRPeriod[]
  selectedPeriod: DDRPeriod | null
  toolbar: ReactNode
}) {
  const root = useRef<HTMLDivElement>(null)
  const [exportError, setExportError] = useState('')
  const [dimensions, setDimensions] = useState({ w: 1050, h: 610 })
  const [hover, setHover] = useState<Staff | null>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const chartW = dimensions.w
  const lanes = useMemo(() => packEmploymentLanes(people), [people])
  const laneCount = Math.max(1, ...lanes.map((d) => d.lane + 1))
  const laneH = Math.max(27, Math.min(48, 450 / laneCount))
  const sceneH = Math.max(440, laneCount * laneH + 156)
  const { svg, view, navigate: act, scrubTo } = useTimelineZoom(chartW, sceneH, selectedPeriod?.start, selectedPeriod?.end)
  const left = 26
  const base = scaleLinear()
    .domain([MIN, MAX])
    .range([left, chartW - 22])
  const scale = base
    .copy()
    .range([left + view.x, left + view.x + (chartW - 22 - left) * view.k])
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
  const overviewStart = Math.max(MIN, scale.invert(left))
  const overviewEnd = Math.min(MAX, scale.invert(chartW - 22))
  const moveTooltip = (clientX: number, clientY: number) => {
    const x = Math.max(205, Math.min(window.innerWidth - 205, clientX))
    const y = clientY + 315 < window.innerHeight ? clientY + 12 : Math.max(12, clientY - 315)
    document.documentElement.style.setProperty('--staff-tooltip-x', x + 'px')
    document.documentElement.style.setProperty('--staff-tooltip-y', y + 'px')
  }
  const overlappingTenures = (staff: Staff) => people.filter(
    person => person.staff_code !== staff.staff_code &&
      year(person.start_date) !== null && year(person.end_date) !== null &&
      year(staff.start_date) !== null && year(staff.end_date) !== null &&
      year(person.start_date)! <= year(staff.end_date)! &&
      year(person.end_date)! >= year(staff.start_date)!
  ).length
  return (
    <div className="explorer">
      <div className="timeline-toolbar">
        <div className="toolbar-filters">{toolbar}</div>
        <div className="toolbar-navigation"><TimelineControls navigate={act}/></div>
      </div>
      <TimelineOverview lanes={lanes} start={overviewStart} end={overviewEnd} periods={periods} selectedPeriod={selectedPeriod} onScrub={scrubTo}/>
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
          <rect width={chartW} height={sceneH} fill="var(--cds-background)" />
          {selectedPeriod && <rect x={scale(selectedPeriod.start)} y={86} width={Math.max(0,scale(selectedPeriod.end+1)-scale(selectedPeriod.start))} height={sceneH-110} fill="var(--cds-highlight)" opacity={0.32} pointerEvents="none" />}
          {periods.filter(p => p.slug !== '1965-1985').map(p => {
            const x = scale(p.start)
            const w = Math.max(0, scale(p.end + 1) - x)
            const label = w >= 140 ? p.label : w >= 90 ? p.label.slice(0, 12) + '…' : p.start + '–' + p.end
            return <g key={'stage-' + p.slug} pointerEvents="none">
              <title>{p.label} ({p.start}–{p.end}) — {p.description || 'No description recorded.'} Researcher's interpretation, not an official RCA phase.</title>
              <line x1={x} x2={x} y1={12} y2={sceneH - 26}
                stroke="var(--cds-text-secondary)" strokeWidth={1} strokeDasharray="1 7"
                opacity={selectedPeriod?.slug === p.slug ? 0.85 : 0.38} />
              <text x={x + 5} y={27} fontSize={11} className="stage-label"
                fill="var(--cds-text-secondary)">{label}</text>
            </g>
          })}
          <line x1={0} x2={chartW} y1={45} y2={45} stroke="var(--cds-border-subtle)" />
          {ticks.map((y) => (
            <g key={y}>
              <line
                x1={scale(y)}
                y1="88"
                x2={scale(y)}
                y2={sceneH - 35}
                stroke="var(--cds-border-subtle)"
                strokeDasharray={y % 10 === 0 ? 'none' : '3 9'}
              />
              <text
                x={scale(y) + 5}
                y="72"
                fill={y % 10 === 0 ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)'}
                fontSize={y % 10 === 0 ? 17 : 11}
                
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
              y1={114 + i * laneH + laneH - 2}
              y2={114 + i * laneH + laneH - 2}
              stroke="var(--cds-border-subtle)"
            />
          ))}
          <g key={selectedPeriod?.slug || "all"} className="period-transition">
          {visible.map(({ person, lane, start, end }) => {
            const x = scale(Math.max(start, MIN)),
              right = scale(Math.min(end + 1, MAX)),
              w = Math.max(3, right - x),
              y = 115 + lane * laneH
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
                  stroke={isSelected ? 'var(--cds-text-primary)' : 'none'}
                  strokeWidth="2"
                  className="interactive-band"
                  onPointerEnter={(event) => { setHover(person); moveTooltip(event.clientX, event.clientY) }}
                  onPointerMove={(event) => moveTooltip(event.clientX, event.clientY)}
                  onPointerLeave={() => setHover(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${person.agent_name}, ${start} to ${end}, ${person.job_title_label}`}
                  onFocus={(event) => { setHover(person); const bounds = event.currentTarget.getBoundingClientRect(); moveTooltip(bounds.left + bounds.width / 2, bounds.top) }}
                  onBlur={() => setHover(null)}
                  onClick={() => onSelect(isSelected ? null : person)}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(isSelected ? null : person) } }}
                >
                  <title>
                    {person.agent_name} · {start}–{end}
                  </title>
                </rect>

              </g>
            )
          })}
          </g>
          {/* Labels are drawn ABOVE every band, in viewport coordinates.
              This remains correct when an employment interval starts years
              before the currently visible critical period. */}
          <g className="staff-label-overlay" pointerEvents="none" aria-hidden="true">
            {visible.map(({ person, lane, start, end }) => {
              const visibleStart = Math.max(start, overviewStart)
              const visibleEnd = Math.min(end + 1, overviewEnd)
              if (visibleEnd <= visibleStart) return null
              const first = Math.max(left, scale(visibleStart))
              const last = Math.min(chartW - 22, scale(visibleEnd))
              const usable = last - first - 18
              if (usable < 38) return null
              const maxCharacters = Math.floor(usable / 6.8)
              const name = person.agent_name
              const label = name.length > maxCharacters
                ? name.slice(0, Math.max(3, maxCharacters - 1)) + '…'
                : name
              return (
                <text
                  key={person.staff_code}
                  className="band-label"
                  x={first + 9}
                  y={115 + lane * laneH + (laneH - 6) / 2 + 4}
                  fontSize={Math.min(14, laneH * 0.38)}
                  fill="var(--cds-text-on-color)"
                >{label}</text>
              )
            })}
          </g>
          {cursor !== null && cursor >= MIN && cursor <= MAX && (
            <g pointerEvents="none">
              <line
                x1={scale(cursor)}
                x2={scale(cursor)}
                y1="86"
                y2={sceneH - 25}
                stroke="var(--cds-support-warning)"
                strokeWidth="1"
              />
              <text
                x={Math.min(chartW - 50, Math.max(4, scale(cursor) + 8))}
                y={sceneH - 10}
                fill="var(--cds-support-warning)"
                fontSize="12"
                fontFamily="IBM Plex Mono,monospace"
              >
                {cursor.toFixed(1)}
              </text>
            </g>
          )}
        </svg>
        {hover && createPortal(
          <div className="floating-tip staff-record-tooltip" role="tooltip" aria-label={`Documented staff details for ${hover.agent_name}`}>
            <span>DOCUMENTED STAFF / {hover.staff_code}</span>
            <strong>{hover.agent_name}</strong>
            <p>{hover.job_title_label}</p>
            <dl>
              <div><dt>Documented period</dt><dd>{year(hover.start_date) ?? 'Unknown'}–{year(hover.end_date) ?? 'Unknown'}</dd></div>
              <div><dt>Role classification</dt><dd>{category(hover.job_title_label)}</dd></div>
              <div><dt>Contemporaries</dt><dd>{overlappingTenures(hover)} overlapping tenures</dd></div>
              <div><dt>Record identifier</dt><dd>{hover.staff_code}</dd></div>
            </dl>
            <p className="tooltip-caveat">Date overlap indicates co-presence, not collaboration. Descriptions containing “later” do not establish a transition date.</p>
          </div>,
          document.querySelector('.redesign') ?? document.body,
        )}
      </div>
      {selectedPeriod && <p className="timeline-period-note">Slice: {selectedPeriod.label} ({selectedPeriod.start}–{selectedPeriod.end}). Showing staff whose documented tenure overlaps this interpretative period; overlap does not establish participation in any particular activity.</p>}
      <div className="under-canvas">
        <span>
          <Information size={16} /> Employment dates shown as recorded; overlapping
          tenures do not prove collaboration.
        </span>
        <span>
          ZOOM {String(Math.round(view.k * 100))}% · {lanes.length} DATED ENTRIES
        </span>
      </div>
      <div className="timeline-export-actions" aria-label="Download timeline">
        <Button kind="tertiary" size="lg" renderIcon={Download} onClick={() => {
          setExportError('')
          try { downloadCSV(people) } catch { setExportError('CSV export failed. Please try again.') }
        }}>Download CSV</Button>
        <Button kind="tertiary" size="lg" renderIcon={Download} onClick={async () => {
          setExportError('')
          try {
            if (!svg.current) throw new Error('Timeline unavailable')
            await downloadSVGAsPNG(svg.current, 'ddr-timeline.png')
          } catch { setExportError('PNG export failed. Please try again.') }
        }}>Download PNG</Button>
        {exportError && <span role="alert" className="timeline-export-error">{exportError}</span>}
      </div>

    </div>
  )
}
