import { useMemo, useState } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { FilterIcon } from '../components/FilterIcon'
import { TopBar } from '../components/TopBar'
import { loadYaml } from '../content/loaders'
import { appRegistry } from '../content/registry'
import type { ScaleScenario } from '../types/content'

interface ScaleThemeNavigation {
  id: string
  title_cn: string
  title_en?: string
  order?: number
  scenarios: string[]
}

interface ScaleDomainNavigation {
  id: string
  title_cn: string
  title_en?: string
  order?: number
  themes: ScaleThemeNavigation[]
}

interface ScaleNavigationFile {
  version: string
  domains: ScaleDomainNavigation[]
}

interface ThemeGroup {
  id: string
  title: string
  titleEn?: string
  order: number
  scenarios: ScaleScenario[]
}

interface DomainGroup {
  id: string
  title: string
  titleEn?: string
  order: number
  themes: ThemeGroup[]
  scenarioCount: number
}

const navigation = loadYaml<ScaleNavigationFile>(
  'content/scale-navigation-v1.yaml',
)

function buildGroups(
  scenarios: ScaleScenario[],
): DomainGroup[] {
  const scenarioById = new Map(
    scenarios.map((scenario) => [scenario.id, scenario]),
  )
  const mappedIds = new Set<string>()

  const groups = navigation.domains
    .map((domain) => {
      const themes = domain.themes
        .map((theme) => {
          const resolved = theme.scenarios.flatMap((id) => {
            const scenario = scenarioById.get(id)
            if (!scenario) return []

            mappedIds.add(id)
            return [scenario]
          })

          return {
            id: theme.id,
            title: theme.title_cn,
            titleEn: theme.title_en,
            order: theme.order ?? 999,
            scenarios: resolved.sort(
              (left, right) =>
                (left.order ?? 999) - (right.order ?? 999),
            ),
          }
        })
        .filter((theme) => theme.scenarios.length > 0)
        .sort((left, right) => left.order - right.order)

      return {
        id: domain.id,
        title: domain.title_cn,
        titleEn: domain.title_en,
        order: domain.order ?? 999,
        themes,
        scenarioCount: themes.reduce(
          (total, theme) => total + theme.scenarios.length,
          0,
        ),
      }
    })
    .filter((domain) => domain.scenarioCount > 0)
    .sort((left, right) => left.order - right.order)

  const unmapped = scenarios.filter(
    (scenario) => !mappedIds.has(scenario.id),
  )

  if (unmapped.length > 0) {
    groups.push({
      id: 'uncategorized',
      title: '其他场景',
      titleEn: 'Other',
      order: 999,
      scenarioCount: unmapped.length,
      themes: [
        {
          id: 'uncategorized',
          title: '待归类',
          titleEn: 'Uncategorized',
          order: 999,
          scenarios: unmapped,
        },
      ],
    })
  }

  return groups
}

export function ScalePage() {
  const { scaleScenarios } = appRegistry
  const groups = useMemo(
    () => buildGroups(scaleScenarios),
    [scaleScenarios],
  )
  const [domainFilter, setDomainFilter] =
    useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const visibleGroups = domainFilter
    ? groups.filter((group) => group.id === domainFilter)
    : groups

  const selectedDomain = domainFilter
    ? groups.find((group) => group.id === domainFilter)
    : null

  return (
    <>
      <TopBar title="Scale" />

      <div
        className="page scale-library"
        data-multi-domain={groups.length > 1}
      >
        <h1>生产场景</h1>
        <p className="page-lead">
          按领域和训练主题快速定位，再进入具体生产场景。
        </p>

        {groups.length > 1 && (
          <div className="scale-domain-filter">
            <div>
              <strong>
                {selectedDomain?.title ?? '全部领域'}
              </strong>
              <span>
                {selectedDomain
                  ? `${selectedDomain.scenarioCount} 个场景`
                  : `${groups.length} 个领域 · ${scaleScenarios.length} 个场景`}
              </span>
            </div>

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
          </div>
        )}

        <div className="scale-domain-stack">
          {visibleGroups.map((domain) => (
            <section
              className="scale-domain-group"
              key={domain.id}
              aria-labelledby={`scale-domain-${domain.id}`}
            >
              <header className="scale-domain-group__header">
                <h2 id={`scale-domain-${domain.id}`}>
                  {domain.title}
                </h2>
                <p>
                  {domain.titleEn
                    ? `${domain.titleEn} · `
                    : ''}
                  {domain.themes.length} 个训练主题 ·{' '}
                  {domain.scenarioCount} 个场景
                </p>
              </header>

              <div className="scale-theme-list">
                {domain.themes.map((theme) => (
                  <section
                    className="scale-theme-group"
                    key={theme.id}
                    aria-labelledby={`scale-theme-${domain.id}-${theme.id}`}
                  >
                    <header className="scale-theme-group__header">
                      <h3
                        id={`scale-theme-${domain.id}-${theme.id}`}
                      >
                        {theme.title}
                      </h3>
                      {theme.titleEn && (
                        <span>{theme.titleEn}</span>
                      )}
                    </header>

                    <div className="scenario-list">
                      {theme.scenarios.map((scenario) => (
                        <a
                          className="scenario-row scenario-row--link"
                          href={`#/scale/${scenario.id}`}
                          key={scenario.id}
                        >
                          <h4>
                            {scenario.title_cn ??
                              scenario.title}
                          </h4>

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

            {groups.map((domain) => (
              <button
                type="button"
                key={domain.id}
                data-selected={domainFilter === domain.id}
                onClick={() => {
                  setDomainFilter(domain.id)
                  setFilterOpen(false)
                }}
              >
                <span>
                  {domain.title}
                  {domain.titleEn
                    ? ` · ${domain.titleEn}`
                    : ''}
                </span>
                <span>{domain.scenarioCount}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </>
  )
}
