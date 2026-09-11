import { useEffect, useMemo, useState } from 'react'
import { DirectoryIcon } from '../components/Icons'
import { MarkdownBlocks } from '../components/MarkdownBlocks'
import { ReadingDirectorySheet } from '../components/ReadingDirectorySheet'
import { RelatedInterviewSection } from '../components/RelatedInterviewSection'
import { RelatedScaleSection } from '../components/RelatedScaleSection'
import { TopBar } from '../components/TopBar'
import {
  getInterviewIdsForKnowledge,
  getKnowledgeById,
  getKnowledgeNeighbors,
  getScalesForKnowledge,
} from '../content/registry'
import { splitH2Sections } from '../content/loaders'
import { useActiveReadingSection } from '../hooks/useActiveReadingSection'
import {
  extractMarkdownSubheadings,
  type ReadingDirectoryItem,
} from '../utils/readingDirectory'
import { recordKnowledgeVisit } from '../utils/learningProgress'

interface KnowledgeDetailPageProps {
  id: string
}

export function KnowledgeDetailPage({
  id,
}: KnowledgeDetailPageProps) {
  const article = getKnowledgeById(id)
  const [directoryOpen, setDirectoryOpen] = useState(false)

  useEffect(() => {
    if (article) recordKnowledgeVisit(article.meta.id)
  }, [article])

  const sections = useMemo(
    () => (article ? splitH2Sections(article.body) : []),
    [article],
  )

  const quick = sections.find(
    (section) => section.title === '30 秒理解',
  )
  const rest = sections.filter(
    (section) => section.title !== '30 秒理解',
  )

  const directoryItems = useMemo<ReadingDirectoryItem[]>(() => {
    const items: ReadingDirectoryItem[] = []

    if (quick) {
      items.push({
        id: 'reading-quick',
        label: '30 秒理解',
        level: 2,
      })
    }

    for (const section of rest) {
      const sectionId = `section-${encodeURIComponent(section.title)}`
      items.push({
        id: sectionId,
        label: section.title,
        level: 2,
      })
      items.push(
        ...extractMarkdownSubheadings(section.body, sectionId),
      )
    }

    return items
  }, [quick, rest])

  const activeSectionId = useActiveReadingSection(
    directoryItems.map((item) => item.id),
  )

  if (!article) {
    return (
      <>
        <TopBar title="Knowledge" backHref="/learn" />
        <div className="page">
          <h1>页面暂时不可用</h1>
          <p>请返回学习路线重新选择。</p>
        </div>
      </>
    )
  }

  const neighbors = getKnowledgeNeighbors(id)
  const relatedScales = getScalesForKnowledge(id)
  const interviewIds = getInterviewIdsForKnowledge(id)
  const topicLabel =
    article.meta.topic === 'iceberg'
      ? 'Iceberg'
      : article.meta.domain === 'lakehouse'
        ? 'Lakehouse'
        : null

  const metadata = [
    topicLabel,
    article.meta.learning_depth
      ? `${article.meta.learning_depth} · 深度掌握`
      : null,
  ].filter(Boolean)

  return (
    <>
      <TopBar
        title="Knowledge"
        backHref={`/learn/stage/${article.meta.stage_id}`}
        action={
          directoryItems.length > 0 ? (
            <button
              className="top-bar__directory-action"
              type="button"
              onClick={() => setDirectoryOpen(true)}
            >
              <DirectoryIcon />
              <span>目录</span>
            </button>
          ) : null
        }
      />

      <article className="page reading-page">
        <p className="eyebrow">
          {article.meta.stage_id} ·{' '}
          {article.meta.domain ?? 'Knowledge'}
        </p>

        <h1>{article.meta.title_cn ?? article.meta.title}</h1>
        <p className="page-lead">{article.meta.summary}</p>

        {metadata.length > 0 && (
          <p className="detail-metadata-line">
            {metadata.join(' · ')}
          </p>
        )}

        {quick && (
          <section className="quick-answer" id="reading-quick">
            <span className="quick-answer__label">30 秒理解</span>
            <MarkdownBlocks markdown={quick.body} />
          </section>
        )}

        <div className="article-sections">
          {rest.map((section) => {
            const sectionId = `section-${encodeURIComponent(
              section.title,
            )}`

            return (
              <section
                className="article-section"
                key={section.title}
                id={sectionId}
              >
                <h2>{section.title}</h2>
                <MarkdownBlocks
                  markdown={section.body}
                  headingPrefix={sectionId}
                />
              </section>
            )
          })}
        </div>

        <nav
          className="knowledge-sequence"
          aria-label="学习顺序"
        >
          {neighbors.previous ? (
            <a href={`#/learn/${neighbors.previous.meta.id}`}>
              <span>上一节</span>
              <strong>
                {neighbors.previous.meta.title_cn ??
                  neighbors.previous.meta.title}
              </strong>
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
              <strong>
                {neighbors.next.meta.title_cn ??
                  neighbors.next.meta.title}
              </strong>
            </a>
          ) : (
            <span />
          )}
        </nav>

        <RelatedScaleSection
          ids={relatedScales.map((scenario) => scenario.id)}
        />
        <RelatedInterviewSection ids={interviewIds} />
      </article>

      <ReadingDirectorySheet
        open={directoryOpen}
        items={directoryItems}
        activeId={activeSectionId}
        onClose={() => setDirectoryOpen(false)}
      />
    </>
  )
}
