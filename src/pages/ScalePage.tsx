import { useMemo, useState } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { FilterIcon } from '../components/FilterIcon'
import { TopBar } from '../components/TopBar'
import { appRegistry } from '../content/registry'
import type { ScaleScenario } from '../types/content'

interface DomainMeta {
  label: string
  labelEn: string
  order: number
}

const domainMeta: Record<string, DomainMeta> = {
  lakehouse: {
    label: '湖仓',
    labelEn: 'Lakehouse',
    order: 10,
  },
  streaming: {
    label: '流式计算',
    labelEn: 'Streaming',
    order: 20,
  },
  batch: {
    label: '批处理与 Spark',
    labelEn: 'Batch / Spark',
    order: 30,
  },
  spark: {
    label: '批处理与 Spark',
    labelEn: 'Batch / Spark',
    order: 30,
  },
  semantic: {
    label: '语义与服务',
    labelEn: 'Semantic / Serving',
    order: 40,
  },
  serving: {
    label: '语义与服务',
    labelEn: 'Semantic / Serving',
    order: 40,
  },
  governance: {
    label: '数据治理',
    labelEn: 'Governance',
    order: 50,
  },
  agent: {
    label: 'Data Agent',
    labelEn: 'Agent',
    order: 60,
  },
}

function resolveDomain(domain?: string) {
  const key = domain?.toLowerCase() || 'other'
  return {
    key,
    ...(domainMeta[key] ?? {
      label: domain ?? '其他场景',
      labelEn: domain ?? 'Other',
      order: 999,
    }),
  }
}

interface ScenarioGroup {
  key: string
  label: string
  labelEn: string
  order: number
  scenarios: ScaleScenario[]
}

function groupScenarios(
  scenarios: ScaleScenario[],
): ScenarioGroup[] {
  const grouped = new Map<string, ScenarioGroup>()

  for (const scenario of scenarios) {
    const domain = resolveDomain(scenario.domain)
    const existing = grouped.get(domain.key)

    if (existing) {
      existing.scenarios.push(scenario)
    } else {
      grouped.set(domain.key, {
        ...domain,
        scenarios: [scenario],
      })
    }
  }

  return Array.from(grouped.values()).sort(
    (left, right) => left.order - right.order,
  )
}

export function ScalePage() {
  const { scaleScenarios } = appRegistry
  const groups = useMemo(
    () => groupScenarios(scaleScenarios),
    [scaleScenarios],
  )
  const [domainFilter, setDomainFilter] =
    useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const visibleGroups = domainFilter
    ? groups.filter((group) => group.key === domainFilter)
    : groups

  const activeGroup = domainFilter
    ? groups.find((group) => group.key === domainFilter)
    : null

  return (
    <>
      <TopBar title="Scale" />

      <div className="page scale-library">
        <h1>生产场景</h1>
        <p className="page-lead">
          按领域组织真实生产约束，沿着“瓶颈 → 设计 → 权衡 → 恢复”训练系统思维。
        </p>

        <div className="scale-library__toolbar">
          <div>
            <strong>
              {activeGroup?.label ?? '全部场景'}
            </strong>
            <span>
              {domainFilter
                ? `${activeGroup?.scenarios.length ?? 0} 个场景`
                : `${scaleScenarios.length} 个场景 · ${groups.length} 个领域`}
            </span>
          </div>

          {groups.length > 1 && (
            <button
              type="button"
              className="filter-control"
              data-active={Boolean(domainFilter)}
              onClick={() => setFilterOpen(true)}
            >
              <FilterIcon />
              <span>领域</span>
              {domainFilter && <strong>1</strong>}
            </button>
          )}
        </div>

        <div className="scale-domain-stack">
          {visibleGroups.map((group) => (
            <section
              className="scale-domain-group"
              id={`scale-domain-${group.key}`}
              key={group.key}
              aria-labelledby={`scale-domain-title-${group.key}`}
            >
              <header className="scale-domain-group__header">
                <div>
                  <h2 id={`scale-domain-title-${group.key}`}>
                    {group.label}
                  </h2>
                  <span>{group.labelEn}</span>
                </div>
                <strong>{group.scenarios.length} 个场景</strong>
              </header>

              <div className="scenario-list">
                {group.scenarios.map((scenario) => (
                  <a
                    className="scenario-row scenario-row--link"
                    href={`#/scale/${scenario.id}`}
                    key={scenario.id}
                  >
                    <h3>
                      {scenario.title_cn ?? scenario.title}
                    </h3>

                    {scenario.summary && (
                      <p>{scenario.summary}</p>
                    )}

                    {scenario.display_tags?.length ? (
                      <p
                        className="scenario-row__tags"
                        aria-label="训练重点"
                      >
                        {scenario.display_tags.join(' · ')}
                      </p>
                    ) : null}
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {groups.length > 1 && (
        <BottomSheet
          open={filterOpen}
          title="选择领域"
          onClose={() => setFilterOpen(false)}
        >
          <div className="filter-choice-list">
            <button
              type="button"
              data-selected={domainFilter === null}
              onClick={() => {
                setDomainFilter(null)
                setFilterOpen(false)
              }}
            >
              <span>全部领域</span>
              <span>{scaleScenarios.length}</span>
            </button>

            {groups.map((group) => (
              <button
                type="button"
                key={group.key}
                data-selected={domainFilter === group.key}
                onClick={() => {
                  setDomainFilter(group.key)
                  setFilterOpen(false)
                }}
              >
                <span>
                  {group.label} · {group.labelEn}
                </span>
                <span>{group.scenarios.length}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </>
  )
}
