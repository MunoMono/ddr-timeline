import { describe, expect, it } from 'vitest'
import { packEmploymentLanes } from '../src/utils/timeline'
import type { Staff } from '../src/models/employment'
const record=(name:string,start:string|null,end:string|null):Staff=>({
 staff_code:name,agent_name:name,job_title_code:'RF',job_title_label:'Research Fellow',start_date:start,end_date:end,is_primary:true
})
describe('timeline lane packing',()=>{
 it('keeps simultaneous tenures on different lanes and separates nonoverlap',()=>{
   const lanes=packEmploymentLanes([record('A','1965-01-01','1970-12-31'),record('B','1966-01-01','1968-12-31'),record('C','1971-01-01','1974-12-31')])
   expect(lanes.find(x=>x.person.agent_name==='A')?.lane).not.toBe(lanes.find(x=>x.person.agent_name==='B')?.lane)
   expect(lanes.find(x=>x.person.agent_name==='C')?.lane).toBe(0)
 })
 it('preserves original years while excluding undated and out-of-scope entries',()=>{
   const lanes=packEmploymentLanes([record('Early','1961-01-01','1967-12-31'),record('Unknown',null,null),record('Late','1990-01-01','1992-12-31')])
   expect(lanes).toHaveLength(1)
   expect(lanes[0].start).toBe(1961)
   expect(lanes[0].end).toBe(1967)
 })
})
