import { TopBar } from '../components/TopBar'
import { appRegistry, getKnowledgeForStage } from '../content/registry'
import { getKnowledgeTopicLabel } from '../utils/knowledgeLabels'

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
          <h1>页面暂时不可用</h1>
          <p>请返回学习路线重新选择。</p>
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

        <div className="section-heading">
          <h2>学习内容</h2>
          <span>{knowledge.length} 节</span>
        </div>

        {knowledge.length === 0 ? (
          <div className="empty-state">
            <strong>内容准备中</strong>
            <p>这个阶段的学习内容正在整理。</p>
          </div>
        ) : (
          <div className="knowledge-list">
            {knowledge.map((article) => {
              const topicLabel = getKnowledgeTopicLabel(
                article.meta.topic,
              )

              return (
                <a
                  className="knowledge-row"
                  href={`#/learn/${article.meta.id}`}
                  key={article.meta.id}
                >
                  <div>
                    <strong>
                      {article.meta.title_cn ?? article.meta.title}
                    </strong>
                    <span>
                      {article.meta.summary ?? article.meta.domain}
                    </span>
                  </div>

                  {(topicLabel || article.meta.learning_depth) && (
                    <span className="badge badge--signal">
                      {topicLabel ?? article.meta.learning_depth}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
