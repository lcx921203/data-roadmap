import { getKnowledgeById } from '../content/registry'

interface RelatedKnowledgeSectionProps {
  ids?: string[]
}

export function RelatedKnowledgeSection({
  ids,
}: RelatedKnowledgeSectionProps) {
  if (!ids?.length) return null

  const knowledge = ids.flatMap((id) => {
    const article = getKnowledgeById(id)
    return article ? [article] : []
  })

  if (!knowledge.length) return null

  return (
    <section className="related-content" aria-label="相关学习">
      <div className="related-content__heading">
        <h2>相关学习</h2>
        <p>回到 Learn 查看这个场景或问题依赖的核心机制。</p>
      </div>

      <div className="related-content__list">
        {knowledge.map((article) => (
          <a
            className="related-content__row"
            href={`#/learn/${article.meta.id}`}
            key={article.meta.id}
          >
            <div>
              <strong>{article.meta.title_cn ?? article.meta.title}</strong>
              <span>
                {article.meta.learning_depth
                  ? `${article.meta.learning_depth} · `
                  : ''}
                {article.meta.summary ?? 'Iceberg 知识'}
              </span>
            </div>
            <span className="related-content__action">学习</span>
          </a>
        ))}
      </div>
    </section>
  )
}
