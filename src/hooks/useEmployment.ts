import { useEffect, useState } from 'react'
import type { Staff } from '../models/employment'

const API = import.meta.env.VITE_GRAPHQL_URL || 'https://api.ddrarchive.org/graphql'
const QUERY = 'query { agent_employment { staff_code agent_name job_title_code job_title_label start_date end_date is_primary } }'
export function useEmployment() {
  const [people, setPeople] = useState<Staff[]>([])
  const [source, setSource] = useState('LOADING')
  useEffect(() => {
    const controller = new AbortController()
    const snapshot = async () => {
      const result = await fetch(`${import.meta.env.BASE_URL}data/agent_employment.json`, { signal: controller.signal })
      if (!result.ok) throw Error('Snapshot unavailable')
      const json: { agent_employment?: Staff[] } = await result.json()
      if (!Array.isArray(json.agent_employment)) throw Error('Malformed archival snapshot')
      return json.agent_employment
    }
    ;(async () => {
      try {
        const response = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: QUERY }), signal: controller.signal })
        if (!response.ok) throw Error('API unavailable')
        const json = await response.json()
        if (!Array.isArray(json.data?.agent_employment)) throw Error('API schema mismatch')
        if (!controller.signal.aborted) { setPeople(json.data.agent_employment); setSource('LIVE GRAPHQL') }
      } catch {
        if (controller.signal.aborted) return
        try {
          const rows = await snapshot()
          if (!controller.signal.aborted) { setPeople(rows); setSource('ARCHIVAL SNAPSHOT') }
        } catch {
          if (!controller.signal.aborted) setSource('DATA UNAVAILABLE')
        }
      }
    })()
    return () => controller.abort()
  }, [])
  return { people, source }
}
