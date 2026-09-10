import { MarkdownBlocks } from '../components/MarkdownBlocks'
import { MarkdownSections } from '../components/MarkdownSections'
import { TopBar } from '../components/TopBar'
import {
  getKnowledgeById,
  getKnowledgeNeighbors,
} from '../content/registry'
import { splitH2Sections } from '../content/loaders'

interface KnowledgeDetailPageProps {
  id: string
}

export function KnowledgeDetailPage({ id }: KnowledgeDetailPageProps) {
  const article = getKnowledgeById(id)

  if (!article) {
    return (
      <>
        <TopBar title="Knowledge" backHref="/learn" />
        <div className="page">
          <p className="eyebrow">NOT FOUND</p>
          <h1>Knowledge not found</h1>
          <p>这个 Knowledge ID 还没有对应的 Markdown 内容。</p>
        </div>
      </>
    )
  }

  const sections = splitH2Sections(article.body)
  const quick = sections.find((section) => section.title === '30 秒理解')
  const rest = sections.filter((section) => section.title !== '30 秒理解')
  const neighbors = getKnowledgeNeighbors(id)

  return (
    <>
      <TopBar
        title="Knowledge"
        backHref={`/learn/stage/${article.meta.stage_id}`}
      />
      <article className="page reading-page">
        <p className="eyebrow">
          {article.meta.stage_id} · {article.meta.domain ?? 'Knowledge'}
        </p>
        <h1>{article.meta.title}</h1>
        <p className="page-lead">{article.meta.summary}</p>

        <div className="badge-row">
          {article.meta.learning_depth && (
            <span className="badge badge--signal">
              {article.meta.learning_depth}
            </span>
          )}
          {article.meta.stack_role && (
            <span className="badge">{article.meta.stack_role}</span>
          )}
          {article.meta.content_status && (
            <span className="badge">{article.meta.content_status}</span>
          )}
        </div>

        {rest.length > 0 && (
          <nav className="quick-navigation" aria-label="本页快速导航">
            {rest.slice(0, 8).map((section) => (
              <a
                key={section.title}
                href={`#section-${encodeURIComponent(section.title)}`}
                onClick={(event) => {
                  event.preventDefault()
                  document
                    .getElementById(
                      `section-${encodeURIComponent(section.title)}`,
                    )
                    ?.scrollIntoView({
                      block: 'start',
                      behavior: window.matchMedia(
                        '(prefers-reduced-motion: reduce)',
                      ).matches
                        ? 'auto'
                        : 'smooth',
                    })
                }}
              >
                {section.title}
              </a>
            ))}
          </nav>
        )}

        {quick && (
          <section className="quick-answer">
            <span className="quick-answer__label">30 秒理解</span>
            <MarkdownBlocks markdown={quick.body} />
          </section>
        )}

        <div className="article-sections">
          {rest.map((section) => (
            <section
              className="article-section"
              key={section.title}
              id={`section-${encodeURIComponent(section.title)}`}
            >
              <h2>{section.title}</h2>
              <MarkdownBlocks markdown={section.body} />
            </section>
          ))}
        </div>

        <nav className="knowledge-sequence" aria-label="Iceberg 学习顺序">
          {neighbors.previous ? (
            <a href={`#/learn/${neighbors.previous.meta.id}`}>
              <span>上一节</span>
              <strong>{neighbors.previous.meta.title}</strong>
            </a>
          ) : (
            <span />
          )}

          {neighbors.next ? (
            <a
              className="knowledge-sequence__next"
              href={`#/learn/${neighbors.next.meta.id}`}
            >
              <span>下一节</span>
              <strong>{neighbors.next.meta.title}</strong>
            </a>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </>
  )
}
