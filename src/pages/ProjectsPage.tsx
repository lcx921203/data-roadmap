import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

const projectDisplay: Record<
  string,
  { name: string; topics: string }
> = {
  'north-america': {
    name: '北美项目',
    topics: '湖仓 · 数据治理 · 语义层 · Data Agent',
  },
  ahu: {
    name: '阿虎医考',
    topics: '指标体系 · 语义层 · Serving',
  },
  caishi: {
    name: '彩视直播',
    topics: 'Kafka · Flink · 实时计算',
  },
}

export function ProjectsPage() {
  return (
    <>
      <TopBar title="Projects" />
      <div className="page">
        <h1>项目案例</h1>
        <p className="page-lead">
          从项目场景中理解架构选择、数据链路与问题处理。
        </p>

        <section className="project-list" aria-label="项目案例">
          {appRegistry.projects.map((project) => {
            const display = projectDisplay[project.id] ?? {
              name: project.name,
              topics: '项目案例',
            }

            return (
              <article className="project-row" key={project.id}>
                <div>
                  <strong>{display.name}</strong>
                  <span>{display.topics}</span>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </>
  )
}
