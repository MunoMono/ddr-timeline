import { Button } from '@carbon/react'
import { Add, Subtract, Reset, ArrowLeft, ArrowRight } from '@carbon/icons-react'
import type { TimelineNavAction } from '../../hooks/useTimelineZoom'

export default function TimelineControls({ navigate }: { navigate: (action: TimelineNavAction) => void }) {
  return <nav className="explorer-top" aria-label="Timeline navigation">
    <div className="navigation">
      <span className="nav-hint">DRAG ← → TO TRAVEL · PINCH TO ZOOM</span>
      <div className="nav-actions">
        <Button kind="ghost" size="md" hasIconOnly iconDescription="Earlier years" renderIcon={ArrowLeft} onClick={() => navigate('left')} />
        <Button kind="ghost" size="md" hasIconOnly iconDescription="Later years" renderIcon={ArrowRight} onClick={() => navigate('right')} />
        <Button kind="ghost" size="md" hasIconOnly iconDescription="Zoom out" renderIcon={Subtract} onClick={() => navigate('out')} />
        <Button kind="ghost" size="md" hasIconOnly iconDescription="Zoom in" renderIcon={Add} onClick={() => navigate('in')} />
        <Button kind="ghost" size="md" hasIconOnly iconDescription="Reset view" renderIcon={Reset} onClick={() => navigate('reset')} />
      </div>
    </div>
  </nav>
}
