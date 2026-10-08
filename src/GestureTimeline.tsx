import { useEffect, useRef, useState } from 'react'
import { select, pointer, scaleLinear, axisTop, zoom, zoomIdentity, type ZoomTransform } from 'd3'
import { Add, Subtract, Reset, PanHorizontal, Information } from '@carbon/icons-react'

export type TimelinePerson = {
  staff_code: string
  agent_name: string
  job_title_label: string
  start_date: string | null
  end_date: string | null
}
type Props = {
  records: TimelinePerson[]
  selected: string | null
  onSelect: (id: string) => void
  roleColor: (label: string) => string
}
const START = 1960
const END = 1989
const LABEL_WIDTH = 210
const ROW = 37
const TOP = 47
const BOTTOM = 26
const year = (s: string | null) => s ? Number(s.slice(0, 4)) : null

export default function GestureTimeline({ records, selected, onSelect, roleColor }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const viewport = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ReturnType<typeof zoom<SVGSVGElement, unknown>> | null>(null)
  const [width, setWidth] = useState(800)
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity)
  const [hover, setHover] = useState<{ person: TimelinePerson; x: number; y: number } | null>(null)
  const height = Math.max(170, TOP + records.length * ROW + BOTTOM)
  const rightWidth = Math.max(200, width - LABEL_WIDTH - 18)
  const base = scaleLinear().domain([START, END + 1]).range([0, rightWidth])
  const x = transform.rescaleX(base)
  const visibleYears = x.ticks(transform.k > 3 ? 18 : transform.k > 1.8 ? 10 : 6)
    .filter(v => v >= START && v <= END + 1)
  useEffect(() => {
    if (!container.current) return
    const obs = new ResizeObserver(entries => setWidth(Math.max(330, entries[0].contentRect.width)))
    obs.observe(container.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!viewport.current) return
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 16])
      .translateExtent([[0, 0], [rightWidth, 1]])
      .extent([[0, 0], [rightWidth, 1]])
      .filter(event => {
        if (event.type === 'wheel') return event.ctrlKey || event.metaKey
        return !event.button
      })
      .on('zoom', event => setTransform(event.transform))
    zoomRef.current = behavior
    select(viewport.current).call(behavior)
    return () => { if (viewport.current) select(viewport.current).on('.zoom', null) }
  }, [rightWidth])
  const changeZoom = (factor: number) => {
    if (!viewport.current || !zoomRef.current) return
    select(viewport.current).transition().duration(240).call(zoomRef.current.scaleBy, factor)
  }
  const pan = (delta: number) => {
    if (!viewport.current || !zoomRef.current) return
    select(viewport.current).transition().duration(220).call(zoomRef.current.translateBy, delta, 0)
  }
  const reset = () => {
    if (!viewport.current || !zoomRef.current) return
    select(viewport.current).transition().duration(300).call(zoomRef.current.transform, zoomIdentity)
  }
  // Retain D3's precise tick formatting; the gesture viewport and SVG share one rescaled coordinate system.
  const axis = axisTop(x).tickValues(visibleYears).tickFormat(d => String(d))
  void axis
  const showTooltip = (event: React.PointerEvent<SVGRectElement>, person: TimelinePerson) => {
    const root = container.current?.getBoundingClientRect()
    if (!root) return
    const [px, py] = pointer(event.nativeEvent, container.current)
    setHover({ person, x: Math.min(px + 16, root.width - 245), y: Math.max(0, py - 12) })
  }
  return <div className="gesture-atlas" ref={container}>
    <div className="gesture-toolbar">
      <span className="gesture-label"><PanHorizontal size={16}/> DRAG TO TRAVEL THROUGH TIME <span className="gesture-sep">/</span> PINCH OR CTRL + SCROLL TO ZOOM</span>
      <div className="gesture-buttons" role="group" aria-label="Timeline navigation">
        <button type="button" onClick={() => pan(90)} aria-label="Pan towards earlier years">←</button>
        <button type="button" onClick={() => pan(-90)} aria-label="Pan towards later years">→</button>
        <button type="button" onClick={() => changeZoom(1.7)} aria-label="Zoom in"><Add size={18}/></button>
        <button type="button" onClick={() => changeZoom(1/1.7)} aria-label="Zoom out"><Subtract size={18}/></button>
        <button type="button" onClick={reset} aria-label="Reset timeline zoom"><Reset size={18}/></button>
      </div>
    </div>
    <div className="gesture-viewport">
      <div className="gesture-names" style={{ paddingTop: TOP }}>
        {records.map(person => <button key={person.staff_code} className={selected === person.staff_code ? 'gesture-name active' : 'gesture-name'} onClick={() => onSelect(person.staff_code)} type="button" title={person.job_title_label}>
          <span>{person.agent_name}</span><span className="name-role">{person.job_title_label}</span>
        </button>)}
      </div>
      <svg ref={viewport} className="gesture-svg" style={{ height }} width="100%" viewBox={`0 0 ${rightWidth} ${height}`} preserveAspectRatio="none" role="img" aria-label="Interactive staff employment timeline; use navigation buttons or drag, pinch and control-wheel zoom">
        <defs><clipPath id="ddr-time-clip"><rect width={rightWidth} height={height}/></clipPath></defs>
        <rect width={rightWidth} height={height} fill="#f4f5ee" />
        <g clipPath="url(#ddr-time-clip)">
          {visibleYears.map(v => <g key={v} transform={`translate(${x(v)},0)`}><line y1={TOP-10} y2={height-BOTTOM} stroke={v % 5 === 0 ? '#aebdb1' : '#dce3d9'} strokeWidth={v % 5 === 0 ? 1.2 : .6}/><text y={TOP-20} fill="#3a4b43" fontFamily="IBM Plex Mono, monospace" fontSize={11} textAnchor="middle">{v}</text></g>)}
          {records.map((person, i) => {
            const first = year(person.start_date), last = year(person.end_date)
            const valid = first !== null && last !== null && last >= first
            const y = TOP + i * ROW
            return <g key={person.staff_code}>
              <line x1="0" x2={rightWidth} y1={y+ROW-1} y2={y+ROW-1} stroke="#e0e5dc" />
              {valid ? <rect x={x(first)} y={y+10} width={Math.max(2,x(last+1)-x(first))} height={15} rx={1.5} fill={roleColor(person.job_title_label)} opacity={selected && selected !== person.staff_code ? .45 : .95} stroke={selected === person.staff_code ? '#182c2c' : 'none'} strokeWidth={2} onPointerEnter={event => showTooltip(event, person)} onPointerMove={event => showTooltip(event, person)} onPointerLeave={() => setHover(null)} onClick={() => { setHover(null); onSelect(person.staff_code) }} className="gesture-band"><title>{person.agent_name}: {first}–{last}; {person.job_title_label}</title></rect> :
                <g><line x1={8} x2={rightWidth-8} y1={y+18} y2={y+18} stroke="#afb4a9" strokeDasharray="2 5"/><text x={10} y={y+14} fill="#838d82" fontSize={10}>NO DATED TENURE</text></g>}
            </g>
          })}
        </g>
      </svg>
      <div className="gesture-overlay" aria-label="Gesture capture area for timeline" >
        <svg className="gesture-capture" viewBox={`0 0 ${rightWidth} ${height}`} preserveAspectRatio="none">
          <rect width={rightWidth} height={TOP} fill="transparent" pointerEvents="all"/>
        </svg>
      </div>
    </div>
    <svg className="gesture-wheel-target" ref={undefined} aria-hidden="true" />
    {hover && <div className="gesture-tip" role="tooltip" style={{ left: Math.max(0,hover.x), top: hover.y }}>
      <strong>{hover.person.agent_name}</strong><span>{hover.person.job_title_label}</span>
      <b>{year(hover.person.start_date) ?? '?'} — {year(hover.person.end_date) ?? '?'}</b>
    </div>}
    <div className="gesture-note"><Information size={16}/><span>Horizontal position represents recorded calendar years; unknown dates cannot be placed on the time axis. Zoom and pan are visual navigation, not a change to the archival record.</span><span className="gesture-zoom">{transform.k.toFixed(1)}×</span></div>
  </div>
}
