import type { TaxonomyStage } from '../types/content'

interface StageRowProps {
  stage: TaxonomyStage
  active?: boolean
  count?: number
}

const stageHints: Record<string, string> = {
  '00': 'SQL · Python · Linux · Distributed Systems',
  '01': 'CDC · Kafka · Schema Management',
  '02': 'Spark · Flink · Batch vs Streaming',
  '03': 'Dimensional Modeling · Grain · Metrics',
  '04': 'Iceberg · Trino · Hudi / Delta / Paimon',
  '05': 'dbt Core · Tests · Macros · Docs',
  '06': 'MetricFlow · Semantic Model · Metrics',
  '07': 'Dagster · Data Quality · Airflow',
  '08': 'DataHub · Metadata · Lineage',
  '09': 'Serving · OLAP · Doris · Cache',
  '10': 'Agent · MCP · Skill · RAG',
  '11': 'SLO · Capacity · Multi-tenancy · Incidents',
}

export function StageRow({
  stage,
  active = false,
  count = 0,
}: StageRowProps) {
  const status = active
    ? '当前阶段'
    : count > 0
      ? `${count} 节`
      : '内容准备中'

  return (
    <a
      className="stage-row"
      data-active={active}
      href={`#/learn/stage/${stage.id}`}
      aria-current={active ? 'step' : undefined}
    >
      <span className="stage-row__number">{stage.id}</span>

      <span className="stage-row__body">
        <span className="stage-row__title-line">
          <strong>{stage.title_cn}</strong>
          <small>{status}</small>
        </span>

        <span>{stageHints[stage.id] ?? stage.title_en}</span>
      </span>
    </a>
  )
}
