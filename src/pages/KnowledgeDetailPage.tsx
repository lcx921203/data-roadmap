import { MarkdownBlocks } from '../components/MarkdownBlocks'
import { MarkdownSections } from '../components/MarkdownSections'
import { TopBar } from '../components/TopBar'
import { getKnowledgeById } from '../content/registry'
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

        {quick && (
          <section className="quick-answer">
            <span className="quick-answer__label">30 秒理解</span>
            <MarkdownBlocks markdown={quick.body} />
          </section>
        )}

        <MarkdownSections sections={rest} />
      </article>
    </>
  )
}
