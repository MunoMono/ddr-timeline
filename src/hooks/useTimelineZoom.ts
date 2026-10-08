import { useEffect, useRef, useState } from 'react'
import { select, zoom, zoomIdentity, type ZoomBehavior } from 'd3'

export type TimelineNavAction = 'in' | 'out' | 'reset' | 'left' | 'right'

export function useTimelineZoom(width: number, height: number) {
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

  function navigate(action: TimelineNavAction) {
    if (!svg.current || !zoomRef.current) return
    const target = select(svg.current).transition().duration(320)
    const behavior = zoomRef.current
    if (action === 'reset') target.call(behavior.transform, zoomIdentity)
    else if (action === 'in' || action === 'out')
      target.call(behavior.scaleBy, action === 'in' ? 1.7 : 1 / 1.7, [width / 2, height / 2])
    else target.call(behavior.translateBy, action === 'left' ? 110 : -110, 0)
  }

  return { svg, view, navigate }
}
