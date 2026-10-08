import { Tag } from '@carbon/react'
export default function TimelineHeader({source,count}:{source:string;count:number}) {
  return <header className="compact-header">
    <div className="compact-heading">
      <span className="compact-kicker">RCA / DDR / 1965–1985</span>
      <h1>Department of Design Research <span>timeline</span></h1>
    </div>
    <div className="compact-meta">
      <Tag type={source === 'LIVE GRAPHQL' ? 'green' : 'purple'}>{source}</Tag>
      <strong>{count}</strong><span>STAFF ENTRIES</span>
    </div>
  </header>
}
