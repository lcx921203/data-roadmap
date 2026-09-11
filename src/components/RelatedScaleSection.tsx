import { appRegistry } from '../content/registry'

interface RelatedScaleSectionProps {
  ids?: string[]
}

export function RelatedScaleSection({ ids }: RelatedScaleSectionProps) {
  if (!ids?.length) return null

  const scenarios = ids.flatMap((id) => {
    const scenario = appRegistry.scaleScenarios.find((item) => item.id === id)
    return scenario ? [scenario] : []
  })

  if (!scenarios.length) return null

  return (
    <section className="related-content" aria-label="相关生产场景">
      <div className="related-content__heading">
        <h2>相关生产场景</h2>
        <p>把当前知识或面试题放进明确的规模、并发与稳定性约束中继续训练。</p>
      </div>

      <div className="related-content__list">
        {scenarios.map((scenario) => (
          <a
            className="related-content__row"
            href={`#/scale/${scenario.id}`}
            key={scenario.id}
          >
            <div>
              <strong>{scenario.title_cn ?? scenario.title}</strong>
              <span>
                {scenario.display_tags?.join(' · ') ??
                  scenario.summary ??
                  '规模化训练'}
              </span>
            </div>
            <span className="related-content__action">训练</span>
          </a>
        ))}
      </div>
    </section>
  )
}
