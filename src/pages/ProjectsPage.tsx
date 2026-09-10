import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

const projectTopics: Record<string, string> = {
  'north-america': '相关主题：湖仓 · 数据治理 · 语义层 · Data Agent',
  ahu: '相关主题：指标体系 · 语义层 · Serving',
  caishi: '相关主题：Kafka · Flink · 实时计算',
}

export function ProjectsPage() {
  return (
    <>
      <TopBar title="Projects" />
      <div className="page">
        <p className="eyebrow">Projects</p>
        <h1>项目案例</h1>
        <p className="page-lead">
          从项目场景中理解架构选择、数据链路与问题处理。
        </p>

        <section className="project-list" aria-label="项目案例">
          {appRegistry.projects.map((project) => (
            <article className="project-row" key={project.id}>
              <div>
                <strong>{project.name}</strong>
                <span>{projectTopics[project.id] ?? '项目案例'}</span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
