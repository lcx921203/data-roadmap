import { RelatedInterviewSection } from '../components/RelatedInterviewSection'
import { RelatedKnowledgeSection } from '../components/RelatedKnowledgeSection'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'
import type {
  ScaleScenarioDetailItem,
  ScaleScenarioParameter,
} from '../types/content'

function DetailSection({
  id,
  title,
  items,
}: {
  id: string
  title: string
  items?: ScaleScenarioDetailItem[]
}) {
  if (!items?.length) return null

  return (
    <section className="scale-detail__section" id={id}>
      <h2>{title}</h2>
      <div className="scale-detail__list">
        {items.map((item) => (
          <article className="scale-detail__item" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ParameterSection({
  items,
}: {
  items?: ScaleScenarioParameter[]
}) {
  if (!items?.length) return null

  return (
    <section
      className="scale-detail__section"
      id="scale-section-parameters"
    >
      <h2>场景参数</h2>
      <dl className="scale-parameters">
        {items.map((item) => (
          <div className="scale-parameters__row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

const sectionLinks = [
  ['scale-section-parameters', '场景参数'],
  ['scale-section-constraints', '约束'],
  ['scale-section-failures', '瓶颈与故障'],
  ['scale-section-design', '设计'],
  ['scale-section-tradeoffs', '权衡'],
  ['scale-section-observability', '可观测性'],
  ['scale-section-cost', '成本'],
  ['scale-section-recovery', '恢复'],
] as const

export function ScaleDetailPage({ id }: { id: string }) {
  const scenario =
    appRegistry.scaleScenarios.find((item) => item.id === id) ?? null

  if (!scenario) {
    return (
      <>
        <TopBar title="Scale" backHref="/scale" />
        <div className="page">
          <div className="empty-state">
            <strong>场景不存在</strong>
            <p>这个 Scale Scenario 可能尚未发布或 ID 已失效。</p>
          </div>
        </div>
      </>
    )
  }

  const visibleSections = sectionLinks.filter(([sectionId]) => {
    if (sectionId === 'scale-section-parameters') {
      return Boolean(scenario.parameters?.length)
    }
    if (sectionId === 'scale-section-constraints') {
      return Boolean(scenario.constraints?.length)
    }
    if (sectionId === 'scale-section-failures') {
      return Boolean(scenario.failure_bottlenecks?.length)
    }
    if (sectionId === 'scale-section-design') {
      return Boolean(scenario.design?.length)
    }
    if (sectionId === 'scale-section-tradeoffs') {
      return Boolean(scenario.tradeoffs?.length)
    }
    if (sectionId === 'scale-section-observability') {
      return Boolean(scenario.observability?.length)
    }
    if (sectionId === 'scale-section-cost') {
      return Boolean(scenario.cost?.length)
    }
    return Boolean(scenario.recovery?.length)
  })

  return (
    <>
      <TopBar title="Scale" backHref="/scale" />

      <article className="page reading-page scale-detail">
        <p className="eyebrow">
          {scenario.domain === 'lakehouse' ? '湖仓' : '生产场景'} · 规模化训练
        </p>

        <h1>{scenario.title_cn ?? scenario.title}</h1>

        {scenario.summary && <p className="page-lead">{scenario.summary}</p>}

        {scenario.hypothetical && (
          <p className="scale-detail__truth">
            这是一个假设生产场景，用于系统设计和排障训练，不代表任何真实项目经历。
          </p>
        )}

        {visibleSections.length > 0 && (
          <nav className="quick-navigation" aria-label="本页快速导航">
            {visibleSections.map(([sectionId, label]) => (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                onClick={(event) => {
                  event.preventDefault()
                  document.getElementById(sectionId)?.scrollIntoView({
                    block: 'start',
                    behavior: window.matchMedia(
                      '(prefers-reduced-motion: reduce)',
                    ).matches
                      ? 'auto'
                      : 'smooth',
                  })
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        {scenario.quick_answer && (
          <section className="scale-detail__quick">
            <h2>先抓住主线</h2>
            <p>{scenario.quick_answer}</p>
          </section>
        )}

        <ParameterSection items={scenario.parameters} />
        <DetailSection
          id="scale-section-constraints"
          title="约束"
          items={scenario.constraints}
        />
        <DetailSection
          id="scale-section-failures"
          title="瓶颈与故障"
          items={scenario.failure_bottlenecks}
        />
        <DetailSection
          id="scale-section-design"
          title="设计"
          items={scenario.design}
        />
        <DetailSection
          id="scale-section-tradeoffs"
          title="权衡"
          items={scenario.tradeoffs}
        />
        <DetailSection
          id="scale-section-observability"
          title="可观测性"
          items={scenario.observability}
        />
        <DetailSection
          id="scale-section-cost"
          title="成本"
          items={scenario.cost}
        />
        <DetailSection
          id="scale-section-recovery"
          title="恢复"
          items={scenario.recovery}
        />

        <RelatedKnowledgeSection ids={scenario.knowledge} />
        <RelatedInterviewSection ids={scenario.interviews} />
      </article>
    </>
  )
}
