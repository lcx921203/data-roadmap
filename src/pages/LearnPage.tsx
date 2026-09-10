import { useMemo } from 'react'
import { StageRow } from '../components/StageRow'
import { TopBar } from '../components/TopBar'
import {
  appRegistry,
  getKnowledgeById,
  getKnowledgeForStage,
} from '../content/registry'
import { readLearningPosition } from '../utils/learningProgress'

export function LearnPage() {
  const { taxonomy, product } = appRegistry

  const position = useMemo(() => readLearningPosition(), [])
  const fallback =
    getKnowledgeForStage('04')[0] ?? appRegistry.knowledgeArticles[0] ?? null
  const remembered = position.lastKnowledgeId
    ? getKnowledgeById(position.lastKnowledgeId)
    : null
  const current = remembered ?? fallback

  const stageArticles = current
    ? getKnowledgeForStage(current.meta.stage_id)
    : []
  const currentIndex = current
    ? stageArticles.findIndex((item) => item.meta.id === current.meta.id)
    : -1
  const hasRememberedPosition = Boolean(remembered)
  const step = currentIndex >= 0 ? currentIndex + 1 : 0
  const total = stageArticles.length
  const progress =
    hasRememberedPosition && total > 0 ? Math.round((step / total) * 100) : 0

  return (
    <>
      <TopBar />
      <div className="page">
        <p className="eyebrow">Learn</p>
        <h1 className="display-title">{product.subtitle}</h1>

        {current && (
          <section className="continue-section" aria-label="继续学习">
            <div className="section-heading section-heading--compact">
              <h2>{hasRememberedPosition ? '继续学习' : '开始学习'}</h2>
              <span>
                {hasRememberedPosition && total > 0
                  ? `第 ${step} / ${total} 节`
                  : total > 0
                    ? `${total} 节`
                    : ''}
              </span>
            </div>

            <a
              className="continue-row"
              href={`#/learn/${current.meta.id}`}
              aria-label={`${hasRememberedPosition ? '继续' : '开始'}学习 ${current.meta.title}`}
            >
              <span className="continue-row__body">
                <small>
                  {current.meta.stage_id} · {current.meta.topic ?? 'Knowledge'}
                </small>
                <strong>{current.meta.title_cn ?? current.meta.title}</strong>
                <span>{current.meta.summary}</span>
              </span>
              <span className="continue-row__action">
                {hasRememberedPosition ? '继续' : '开始'}
              </span>
            </a>

            <div
              className="continue-progress"
              role="progressbar"
              aria-label="当前学习位置"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
          </section>
        )}

        <div className="section-heading">
          <h2>学习路线</h2>
          <span>{taxonomy.stages.length} 个阶段</span>
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
