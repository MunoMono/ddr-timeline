import { useEffect, useState } from 'react'

export type DDRPeriod = { slug: string; label: string; description: string | null; start: number; end: number }
type RawPeriod = { slug: string; label: string; description: string | null }
const API = import.meta.env.VITE_GRAPHQL_URL || 'https://api.ddrarchive.org/graphql'
const QUERY = 'query DDRCriticalPeriods { ref_ddr_period { slug label description } }'

export function parsePeriods(rows: RawPeriod[]): DDRPeriod[] {
  return rows.flatMap(row => {
    const match = /^(\d{4})-(\d{2}|\d{4})$/.exec(row.slug)
    if (!match || !row.label) return []
    const start = Number(match[1])
    const end = match[2].length === 2 ? Math.floor(start / 100) * 100 + Number(match[2]) : Number(match[2])
    if (start < 1965 || end > 1985 || start > end) return []
    return [{ ...row, start, end }]
  }).sort((a, b) => a.start - b.start || a.end - b.end)
}

export function useDDRPeriods() {
  const [periods, setPeriods] = useState<DDRPeriod[]>([])
  const [status, setStatus] = useState<'loading'|'live'|'unavailable'>('loading')
  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const response = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({query:QUERY}), signal:controller.signal })
        if (!response.ok) throw new Error('Period API unavailable')
        const payload = await response.json()
        if (payload.errors || !Array.isArray(payload.data?.ref_ddr_period)) throw new Error('Period schema mismatch')
        const valid = parsePeriods(payload.data.ref_ddr_period)
        if (!valid.length) throw new Error('No valid critical periods')
        if (!controller.signal.aborted) { setPeriods(valid); setStatus('live') }
      } catch {
        if (!controller.signal.aborted) setStatus('unavailable')
      }
    })()
    return () => controller.abort()
  }, [])
  return {periods, status}
}
