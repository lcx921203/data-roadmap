import { useMemo } from 'react'
import { InlineRelationLinks } from '../components/InlineRelationLinks'
import { ReadingDirectoryController } from '../components/ReadingDirectoryController'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'
import { getSectionRelationTargets } from '../content/sectionRelations'
import { useActiveReadingSection } from '../hooks/useActiveReadingSection'
import type {
  ScaleScenarioDetailItem,
  ScaleScenarioParameter,
} from '../types/content'
import {
  makeDetailItemId,
  type ReadingDirectoryItem,
} from '../utils/readingDirectory'

function DetailSection({
  id,
  title,
  items,
  sourceAssetId,
}: {
  id: string
  title: string
  items?: ScaleScenarioDetailItem[]
  sourceAssetId: string
}) {
  if (!items?.length) return null

  return (
    <section className="scale-detail__section" id={id}>
      <h2>{title}</h2>
      <div className="scale-detail__list">
        {items.map((item, index) => {
          const relationTargets = getSectionRelationTargets(
            'scale',
            sourceAssetId,
            item.title,
          )

          return (
            <article
              className="scale-detail__item"
              id={makeDetailItemId(id, index)}
              key={item.title}
            >
              <h3>{item.title}</h3>

              <InlineRelationLinks
                targets={relationTargets}
                placement="section"
              />

              <p>{item.body}</p>
            </article>
          )
        })}
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
          <div
            className="scale-parameters__row"
            key={item.label}
          >
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function appendDetailItems(
  target: ReadingDirectoryItem[],
  sectionId: string,
  title: string,
  items?: ScaleScenarioDetailItem[],
) {
  if (!items?.length) return

  target.push({
    id: sectionId,
    label: title,
    level: 2,
  })

  items.forEach((item, index) => {
    target.push({
      id: makeDetailItemId(sectionId, index),
      label: item.title,
      level: 3,
    })
  })
}

export function ScaleDetailPage({ id }: { id: string }) {
  const scenario =
    appRegistry.scaleScenarios.find((item) => item.id === id) ??
    null

  const directoryItems = useMemo<ReadingDirectoryItem[]>(() => {
    if (!scenario) return []

    const items: ReadingDirectoryItem[] = []

    if (scenario.quick_answer) {
      items.push({
        id: 'scale-section-quick',
        label: '先抓住主线',
        level: 2,
      })
    }

    if (scenario.parameters?.length) {
      items.push({
        id: 'scale-section-parameters',
        label: '场景参数',
        level: 2,
      })
    }

    appendDetailItems(
      items,
      'scale-section-constraints',
      '约束',
      scenario.constraints,
    )
    appendDetailItems(
      items,
      'scale-section-failures',
      '瓶颈与故障',
      scenario.failure_bottlenecks,
    )
    appendDetailItems(
      items,
      'scale-section-design',
      '设计',
      scenario.design,
    )
    appendDetailItems(
      items,
      'scale-section-tradeoffs',
      '权衡',
      scenario.tradeoffs,
    )
    appendDetailItems(
      items,
      'scale-section-observability',
      '可观测性',
      scenario.observability,
    )
    appendDetailItems(
      items,
      'scale-section-cost',
      '成本',
      scenario.cost,
    )
    appendDetailItems(
      items,
      'scale-section-recovery',
      '恢复',
      scenario.recovery,
    )

    return items
  }, [scenario])

  const activeSectionId = useActiveReadingSection(
    directoryItems.map((item) => item.id),
  )

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
          {scenario.domain === 'lakehouse'
            ? '湖仓'
            : '生产场景'}{' '}
          · 规模化训练
        </p>

        <h1>{scenario.title_cn ?? scenario.title}</h1>

        {scenario.summary && (
          <p className="page-lead">{scenario.summary}</p>
        )}

        {scenario.display_tags?.length ? (
          <p className="detail-metadata-line">
            {scenario.display_tags.join(' · ')}
          </p>
        ) : null}

        {scenario.hypothetical && (
          <p className="scale-detail__truth">
            这是一个假设生产场景，用于系统设计和排障训练，不代表任何真实项目经历。
          </p>
        )}

        {scenario.quick_answer && (
          <section
            className="scale-detail__quick"
            id="scale-section-quick"
          >
            <h2>先抓住主线</h2>
            <p>{scenario.quick_answer}</p>
          </section>
        )}

        <ParameterSection items={scenario.parameters} />

        <DetailSection
          id="scale-section-constraints"
          title="约束"
          items={scenario.constraints}
          sourceAssetId={scenario.id}
        />
        <DetailSection
          id="scale-section-failures"
          title="瓶颈与故障"
          items={scenario.failure_bottlenecks}
          sourceAssetId={scenario.id}
        />
        <DetailSection
          id="scale-section-design"
          title="设计"
          items={scenario.design}
          sourceAssetId={scenario.id}
        />
        <DetailSection
          id="scale-section-tradeoffs"
          title="权衡"
          items={scenario.tradeoffs}
          sourceAssetId={scenario.id}
        />
        <DetailSection
          id="scale-section-observability"
          title="可观测性"
          items={scenario.observability}
          sourceAssetId={scenario.id}
        />
        <DetailSection
          id="scale-section-cost"
          title="成本"
          items={scenario.cost}
          sourceAssetId={scenario.id}
        />
        <DetailSection
          id="scale-section-recovery"
          title="恢复"
          items={scenario.recovery}
          sourceAssetId={scenario.id}
        />
      </article>

      <ReadingDirectoryController
        items={directoryItems}
        activeId={activeSectionId}
      />
    </>
  )
}
