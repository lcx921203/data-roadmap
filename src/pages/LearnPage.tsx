import { StageRow } from '../components/StageRow'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

export function LearnPage() {
  const { taxonomy, product } = appRegistry

  return (
    <>
      <TopBar />
      <div className="page">
        <p className="eyebrow">Learn</p>
        <h1 className="display-title">{product.subtitle}</h1>
        <p className="page-lead">按系统能力学习，而不是按工具列表刷课程。</p>

        <section className="continue-card" aria-label="继续学习">
          <span className="meta">CONTINUE · 04 LAKEHOUSE</span>
          <strong>Apache Iceberg</strong>
          <p>Snapshot · Manifest · Write Ordering · Schema Evolution</p>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: '42%' }} />
          </div>
        </section>

        <div className="section-heading">
          <h2>Roadmap</h2>
          <span>{taxonomy.stages.length} stages</span>
        </div>

        <section className="row-list" aria-label="学习路线">
          {taxonomy.stages.map((stage) => (
            <StageRow key={stage.id} stage={stage} />
          ))}
        </section>
      </div>
    </>
  )
}
