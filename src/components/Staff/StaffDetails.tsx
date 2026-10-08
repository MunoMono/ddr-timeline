import { Close } from '@carbon/icons-react'
import { category, year, type Staff } from '../../models/employment'

export default function StaffDetails({staff, overlapCount, onClose}: {staff:Staff;overlapCount:number;onClose:()=>void}) {
  return <aside className="person-panel" aria-label={`Employment details for ${staff.agent_name}`}>
    <button type="button" className="panel-close" onClick={onClose} aria-label="Close staff details"><Close/></button>
    <span className="eyebrow">SELECTED RECORD / {staff.staff_code}</span>
    <h3>{staff.agent_name}</h3><p className="person-position">{staff.job_title_label}</p>
    <div className="panel-grid">
      <div><small>DOCUMENTED PERIOD</small><strong>{year(staff.start_date)??'Unknown'} — {year(staff.end_date)??'Unknown'}</strong></div>
      <div><small>ROLE CLASSIFICATION</small><strong>{category(staff.job_title_label)}</strong></div>
      <div><small>CONTEMPORARIES</small><strong>{overlapCount} overlapping tenures</strong></div>
      <div><small>RECORD IDENTIFIER</small><strong>{staff.staff_code}</strong></div>
    </div>
    <p className="panel-disclaimer">Co-presence is derived from date overlap only. Roles with “later” in the description have no separately established transition dates.</p>
  </aside>
}
