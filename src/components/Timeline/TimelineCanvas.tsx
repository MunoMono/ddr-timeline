import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3'
import { useTimelineZoom } from '../../hooks/useTimelineZoom'
import { Information, Download } from '@carbon/icons-react'
import { Button } from '@carbon/react'
import { downloadCSV, downloadSVGAsPNG } from '../../utils/export'
import TimelineControls from './TimelineControls'
import TimelineOverview from './TimelineOverview'
import StaffDetails from '../Staff/StaffDetails'
import { category, palette, MIN, MAX, year, type Staff } from '../../models/employment'
import { packEmploymentLanes } from '../../utils/timeline'

export default function InteractiveTimeline({
  people,
  selected,
  onSelect,
}: {
  people: Staff[]
  selected: Staff | null
  onSelect: (s: Staff | null) => void
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
  const sceneH = Math.max(400, laneCount * laneH + 116)
  const { svg, view, navigate: act } = useTimelineZoom(chartW, sceneH)
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
      <TimelineControls navigate={act}/>
      <TimelineOverview lanes={lanes} start={overviewStart} end={overviewEnd}/>
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
          {ticks.map((y) => (
            <g key={y}>
              <line
                x1={scale(y)}
                y1="48"
                x2={scale(y)}
                y2={sceneH - 35}
                stroke="var(--cds-border-subtle)"
                strokeDasharray={y % 10 === 0 ? 'none' : '3 9'}
              />
              <text
                x={scale(y) + 5}
                y="30"
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
              y1={74 + i * laneH + laneH - 2}
              y2={74 + i * laneH + laneH - 2}
              stroke="var(--cds-border-subtle)"
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
                  stroke={isSelected ? 'var(--cds-text-primary)' : 'none'}
                  strokeWidth="2"
                  className="interactive-band"
                  onPointerEnter={() => setHover(person)}
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
                    fill="var(--cds-text-on-color)"
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
        {hover && (
          <div className="floating-tip"
          >
            <span>DOCUMENTED STAFF</span>
            <strong>{hover.agent_name}</strong>
            <p>{hover.job_title_label}</p>
            <small>
              {year(hover.start_date)}—{year(hover.end_date)}
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
      {selected && <StaffDetails staff={selected} overlapCount={near} onClose={() => onSelect(null)}/>}
    </div>
  )
}
