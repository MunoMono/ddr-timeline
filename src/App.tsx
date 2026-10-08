import { ArrowRight } from '@carbon/icons-react'
import { Button, Content, Dropdown, Header, HeaderName, Search, Tag } from '@carbon/react'
import './App.css'

const recordTypes = [{ id: 'all', text: 'All record types' }]
const scopeYears = [1965, 1970, 1975, 1980, 1985]

function App() {
  return (
    <>
      <Header aria-label="DDR Timeline">
        <HeaderName href={import.meta.env.BASE_URL} prefix="DDR">
          Timeline
        </HeaderName>
        <div className="header-status">
          <span className="status-dot" aria-hidden="true" />
          <span>Data source not queried</span>
        </div>
      </Header>

      <Content className="timeline-app">
        <div className="intro">
          <div>
            <p className="eyebrow">Department of Design Research</p>
            <h1>DDR timeline</h1>
            <p className="intro-copy">
              Explore documented people, projects, and institutional periods.
            </p>
          </div>
          <Tag type="blue">1965-1985 scope</Tag>
        </div>

        <section className="filter-bar" aria-label="Timeline filters">
          <Search
            labelText="Search records"
            placeholder="Available after API discovery"
            disabled
          />
          <Dropdown
            id="record-type"
            aria-label="Record type"
            titleText="Record type"
            label="All record types"
            items={recordTypes}
            itemToString={(item) => item?.text ?? ''}
            selectedItem={recordTypes[0]}
            disabled
          />
          <p className="filter-note">Filters unlock when the API contract is verified.</p>
        </section>

        <main className="workspace" id="main-content">
          <section className="timeline-region" aria-labelledby="timeline-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Temporal overview</p>
                <h2 id="timeline-heading">Timeline</h2>
              </div>
              <span className="precision-note">Scope only - no records loaded</span>
            </div>

            <div className="timeline-canvas">
              <ol className="timeline-axis" aria-label="Years in project scope">
                {scopeYears.map((year) => (
                  <li key={year}>
                    <span>{year}</span>
                  </li>
                ))}
              </ol>
              <div className="empty-state" role="status">
                <span className="empty-rule" aria-hidden="true" />
                <h3>No timeline records yet</h3>
                <p>
                  The live data contract has not been verified. This view will not
                  substitute sample records for archival data.
                </p>
                <Button kind="tertiary" size="sm" disabled renderIcon={ArrowRight}>
                  Record exploration unavailable
                </Button>
              </div>
            </div>
          </section>

          <aside className="details-region" aria-labelledby="details-heading">
            <p className="eyebrow">Selected record</p>
            <h2 id="details-heading">Details</h2>
            <div className="details-empty">
              <p className="details-placeholder">Choose a record to inspect it.</p>
              <p className="details-policy">
                Dates, relationships, and provenance will be shown only when supported by
                the source record.
              </p>
            </div>
          </aside>
        </main>

        <footer className="app-footer">
          <span>DDR archive timeline</span>
          <span>Read-only public data - API connection not yet configured</span>
        </footer>
      </Content>
    </>
  )
}

export default App
