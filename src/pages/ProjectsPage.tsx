import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'

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
          {appRegistry.projects.map((project) => (
            <article className="project-row" key={project.id}>
              <div>
                <strong>{project.display_name_cn ?? project.display_name}</strong>
                <span>
                  {project.display_topics ??
                    project.primary_topics.join(' · ')}
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
