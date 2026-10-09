import { describe, expect, it } from 'vitest'
import { parsePeriods } from '../src/hooks/useDDRPeriods'

describe('Researcher-authored DDR critical periods', () => {
  it('parses abbreviated end years without treating the overview as a phase', () => {
    const periods = parsePeriods([
      {slug:'1973-79',label:'Peak productivity',description:'Interpretative label'},
      {slug:'1965-1985',label:'DDR Phase',description:null},
      {slug:'1979-80',label:'Transition to college funding',description:null},
    ])
    expect(periods).toHaveLength(3)
    expect(periods.find(p => p.slug === '1973-79')).toMatchObject({start:1973,end:1979})
    expect(periods.find(p => p.slug === '1979-80')).toMatchObject({start:1979,end:1980})
  })
  it('rejects years beyond the scope instead of inventing intervals', () => {
    expect(parsePeriods([{slug:'1990-91',label:'Unknown',description:null}])).toHaveLength(0)
  })
})
