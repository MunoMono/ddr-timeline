import { useEffect, useRef, useState } from 'react'
import { easeCubicInOut, select, zoom, zoomIdentity, type ZoomBehavior } from 'd3'

export type TimelineNavAction = 'in' | 'out' | 'reset' | 'left' | 'right'

export function useTimelineZoom(width: number, height: number, periodStart?: number, periodEnd?: number) {
  const svg = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [view, setView] = useState({ k: 1, x: 0 })

  useEffect(() => {
    const element = svg.current
    if (!element) return
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .filter(event => event.type !== 'wheel' || event.ctrlKey || event.metaKey)
      .on('zoom', event => setView({ k: event.transform.k, x: event.transform.x }))
    zoomRef.current = behavior
    select(element).call(behavior)
    return () => { select(element).on('.zoom', null) }
  }, [width, height])

  useEffect(() => {
    if (!svg.current || !zoomRef.current) return
    const endExclusive = periodEnd === undefined ? undefined : periodEnd + 1
    const start = periodStart ?? 1965
    const finish = endExclusive ?? 1986
    if (finish <= start) return
    const k = Math.max(1, Math.min(12, 21 / (finish - start)))
    const plotWidth = width - 48
    const x = -((start - 1965) / 21) * plotWidth * k
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const target = select(svg.current).interrupt()
    const transform = zoomIdentity.translate(x, 0).scale(k)
    if (reduceMotion) target.call(zoomRef.current.transform, transform)
    else target.transition().duration(700).ease(easeCubicInOut).call(zoomRef.current.transform, transform)
  }, [periodStart, periodEnd, width])

  // Seek the main chart using the overview as a Premiere-style scrubber.
  // Preserve zoom while centering the selected year; D3 clamps the bounds.
  function scrubTo(year: number) {
    if (!svg.current || !zoomRef.current) return
    const k = Math.max(2.5, view.k)
    const span = width - 48
    const fraction = Math.max(0, Math.min(1, (year - 1965) / 21))
    const x = span * (0.5 - fraction * k)
    const transform = zoomIdentity.translate(x, 0).scale(k)
    select(svg.current).interrupt().call(zoomRef.current.transform, transform)
  }

  function navigate(action: TimelineNavAction) {
    if (!svg.current || !zoomRef.current) return
    const target = select(svg.current).transition().duration(320)
    const behavior = zoomRef.current
    if (action === 'reset') target.call(behavior.transform, zoomIdentity)
    else if (action === 'in' || action === 'out')
      target.call(behavior.scaleBy, action === 'in' ? 1.7 : 1 / 1.7, [width / 2, height / 2])
    else target.call(behavior.translateBy, action === 'left' ? 110 : -110, 0)
  }

  return { svg, view, navigate, scrubTo }
}
