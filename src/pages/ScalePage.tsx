import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

export function ScalePage() {
  return (
    <>
      <TopBar title="Scale Lab" />
      <div className="page">
        <p className="eyebrow">HYPOTHETICAL PRODUCTION TRAINING</p>
        <h1>Scale Lab</h1>
        <p className="page-lead">
          训练规模、吞吐、并发、可靠性、成本与恢复能力。这里的场景不是个人项目经历。
        </p>

        <section className="mode-intro">
          <strong>Training model</strong>
          <div className="flow-stack" aria-label="Scale Lab 训练流程">
            <span>Constraints</span>
            <i>↓</i>
            <span>Bottleneck / Failure</span>
            <i>↓</i>
            <span>Design & Trade-offs</span>
            <i>↓</i>
            <span>Observability / Cost / Recovery</span>
          </div>
        </section>

        <div className="section-heading">
          <h2>Scenario families</h2>
          <span>{appRegistry.scaleFamilies.length}</span>
        </div>

        <div className="row-list">
          {appRegistry.scaleFamilies.map((family, index) => (
            <div className="simple-row" key={family}>
              <span className="simple-row__number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{family}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
