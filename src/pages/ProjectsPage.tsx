import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

export function ProjectsPage() {
  return (
    <>
      <TopBar title="Projects" />
      <div className="page">
        <p className="eyebrow">PROJECT CASES · FACT BOUNDARY</p>
        <h1>Project Cases</h1>
        <p className="page-lead">
          真实项目是知识锚点，不是生产标准答案。正式展示前需要逐项核验 Actual 与 Boundary。
        </p>

        <div className="truth-boundary">
          <div>
            <span className="truth-boundary__label truth-boundary__label--actual">ACTUAL</span>
            <p>真实架构、真实问题、真实实现。</p>
          </div>
          <div>
            <span className="truth-boundary__label">SCALE EXTENSION</span>
            <p>Hypothetical Scale Lab，永远不包装成项目经历。</p>
          </div>
        </div>

        <section className="project-list" aria-label="项目案例">
          {appRegistry.projects.map((project) => (
            <article className="project-row" key={project.id}>
              <div>
                <strong>{project.name}</strong>
                <span>Actual · Boundary · Mapping · Scale Extension</span>
              </div>
              <span className="badge badge--warning">Fact check</span>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
