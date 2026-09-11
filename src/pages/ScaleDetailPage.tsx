import { RelatedInterviewSection } from '../components/RelatedInterviewSection'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'
import type {
  ScaleScenarioDetailItem,
  ScaleScenarioParameter,
} from '../types/content'

function DetailSection({ title, items }: { title: string; items?: ScaleScenarioDetailItem[] }) {
  if (!items?.length) return null
  return (
    <section className="scale-detail__section">
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

function ParameterSection({ items }: { items?: ScaleScenarioParameter[] }) {
  if (!items?.length) return null
  return (
    <section className="scale-detail__section">
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

export function ScaleDetailPage({ id }: { id: string }) {
  const scenario = appRegistry.scaleScenarios.find((item) => item.id === id) ?? null

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
        {scenario.quick_answer && (
          <section className="scale-detail__quick">
            <h2>先抓住主线</h2>
            <p>{scenario.quick_answer}</p>
          </section>
        )}
        <ParameterSection items={scenario.parameters} />
        <DetailSection title="约束" items={scenario.constraints} />
        <DetailSection title="瓶颈与故障" items={scenario.failure_bottlenecks} />
        <DetailSection title="设计" items={scenario.design} />
        <DetailSection title="权衡" items={scenario.tradeoffs} />
        <DetailSection title="可观测性" items={scenario.observability} />
        <DetailSection title="成本" items={scenario.cost} />
        <DetailSection title="恢复" items={scenario.recovery} />
        <RelatedInterviewSection ids={scenario.interviews} />
      </article>
    </>
  )
}
