import { MAX, MIN, year, type Staff } from '../models/employment'

export type TimelineLane = { person: Staff; lane: number; start: number; end: number }

/** Pure deterministic lane-packing for dated archival employment ranges.
 * Source dates remain unmodified; display clipping is delegated to the canvas.
 */
export function packEmploymentLanes(records: Staff[], min=MIN, max=MAX): TimelineLane[] {
  const dated = records.flatMap(person => {
    const start = year(person.start_date)
    const end = year(person.end_date)
    if (start===null || end===null || end<start || start>=max || end<min) return []
    return [{person,start,end}]
  }).sort((a,b)=>a.start-b.start||a.person.agent_name.localeCompare(b.person.agent_name))
  const laneEnds: number[] = []
  return dated.map(entry=>{
    let lane=laneEnds.findIndex(end=>end<entry.start)
    if (lane<0){lane=laneEnds.length;laneEnds.push(entry.end)}else laneEnds[lane]=entry.end
    return {...entry,lane}
  })
}
