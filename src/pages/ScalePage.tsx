import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

export function ScalePage() {
  return (
    <>
      <TopBar title="Scale" />
      <div className="page">
        <p className="eyebrow">Scale Lab</p>
        <h1>生产场景</h1>
        <p className="page-lead">
          在规模、并发和故障约束下练习架构设计与排障。
        </p>

        <section className="scenario-list" aria-label="生产场景">
          {appRegistry.scaleScenarios.map((scenario) => (
            <article className="scenario-row" key={scenario.id}>
              <div className="scenario-row__meta">
                <span>
                  {scenario.domain === 'lakehouse'
                    ? '湖仓'
                    : scenario.domain ?? '生产场景'}
                </span>
              </div>

              <h2>{scenario.title_cn ?? scenario.title}</h2>

              {scenario.summary && <p>{scenario.summary}</p>}

              {scenario.display_tags && (
                <div className="scenario-row__tags">
                  {scenario.display_tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
