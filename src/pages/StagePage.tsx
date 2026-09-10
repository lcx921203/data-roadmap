import { TopBar } from '../components/TopBar'
import { appRegistry, getKnowledgeForStage } from '../content/registry'

interface StagePageProps {
  stageId: string
}

export function StagePage({ stageId }: StagePageProps) {
  const stage = appRegistry.taxonomy.stages.find((item) => item.id === stageId)

  if (!stage) {
    return (
      <>
        <TopBar title="Learn" backHref="/learn" />
        <div className="page">
          <p className="eyebrow">NOT FOUND</p>
          <h1>Stage not found</h1>
          <p>这个 Stage ID 不存在。</p>
        </div>
      </>
    )
  }

  const knowledge = getKnowledgeForStage(stage.id)

  return (
    <>
      <TopBar title={`Stage ${stage.id}`} backHref="/learn" />
      <div className="page">
        <p className="eyebrow">{stage.title_en}</p>
        <h1>{stage.title_cn}</h1>
        <p className="page-lead">
          Knowledge Detail 直接由 content/ 下的 Markdown + Front Matter 驱动。
        </p>

        <div className="section-heading">
          <h2>Knowledge</h2>
          <span>{knowledge.length}</span>
        </div>

        {knowledge.length === 0 ? (
          <div className="empty-state">
            <strong>Content backlog</strong>
            <p>
              这个 Stage 的知识节点还没有进入正式 Markdown 内容库。路线存在，但不会用占位文章冒充完成内容。
            </p>
          </div>
        ) : (
          <div className="knowledge-list">
            {knowledge.map((article) => (
              <a
                className="knowledge-row"
                href={`#/learn/${article.meta.id}`}
                key={article.meta.id}
              >
                <div>
                  <strong>{article.meta.title}</strong>
                  <span>{article.meta.summary ?? article.meta.domain}</span>
                </div>
                <span className="badge badge--signal">
                  {article.meta.learning_depth ?? 'Knowledge'}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
