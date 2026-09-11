import { useMemo } from 'react'
import { TopBar } from '../components/TopBar'
import {
  appRegistry,
  getKnowledgeForStage,
} from '../content/registry'
import { readLearningPosition } from '../utils/learningProgress'

interface StagePageProps {
  stageId: string
}

export function StagePage({ stageId }: StagePageProps) {
  const stage = appRegistry.taxonomy.stages.find(
    (item) => item.id === stageId,
  )
  const position = useMemo(() => readLearningPosition(), [])

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
      <TopBar title="Learn" backHref="/learn" />

      <div className="page stage-page">
        <p className="eyebrow">
          Stage {stage.id} · {stage.title_en}
        </p>
        <h1>{stage.title_cn}</h1>

        <p className="page-lead stage-page__lead">
          按顺序学习：上一节建立前提，下一节继续推导。
        </p>

        <div className="section-heading stage-path-heading">
          <div>
            <h2>知识主线</h2>
            <p>每一节都应该回答：为什么现在学它，以及学完以后自然进入哪里。</p>
          </div>
          <span>{knowledge.length} 节</span>
        </div>

        {knowledge.length === 0 ? (
          <div className="empty-state">
            <strong>内容准备中</strong>
            <p>这个阶段的学习内容正在整理。</p>
          </div>
        ) : (
          <section
            className="knowledge-path"
            aria-label={`${stage.title_cn} 知识主线`}
          >
            {knowledge.map((article, index) => {
              const current =
                position.lastKnowledgeId === article.meta.id
              const topic =
                article.meta.topic === 'iceberg'
                  ? 'Iceberg'
                  : article.meta.domain ?? 'Knowledge'

              return (
                <a
                  className="knowledge-path-row"
                  data-current={current}
                  data-last={index === knowledge.length - 1}
                  href={`#/learn/${article.meta.id}`}
                  key={article.meta.id}
                  aria-current={current ? 'step' : undefined}
                >
                  <span
                    className="knowledge-path-row__rail"
                    aria-hidden="true"
                  >
                    <strong>
                      {String(index + 1).padStart(2, '0')}
                    </strong>
                    <span />
                  </span>

                  <span className="knowledge-path-row__body">
                    <span className="knowledge-path-row__meta">
                      第 {index + 1} 节 · {topic}
                      {article.meta.learning_depth
                        ? ` · ${article.meta.learning_depth}`
                        : ''}
                      {current ? ' · 当前' : ''}
                    </span>

                    <strong className="knowledge-path-row__title">
                      {article.meta.title_cn ?? article.meta.title}
                    </strong>

                    <span className="knowledge-path-row__summary">
                      {article.meta.summary ?? article.meta.domain}
                    </span>
                  </span>
                </a>
              )
            })}
          </section>
        )}
      </div>
    </>
  )
}
