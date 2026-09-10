import { useMemo, useState } from 'react'
import { EvidenceDisclosure } from '../components/EvidenceDisclosure'
import { MarkdownBlocks } from '../components/MarkdownBlocks'
import { MarkdownSections } from '../components/MarkdownSections'
import { ReadingSegment } from '../components/ReadingSegment'
import { TopBar } from '../components/TopBar'
import {
  parseFrontMatter,
  splitH2Sections,
  tryLoadMarkdownRaw,
} from '../content/loaders'
import {
  appRegistry,
  getQuestionEvidence,
} from '../content/registry'
import type {
  InterviewAnswerFrontMatter,
  MarkdownSection,
  ReadingMode,
} from '../types/content'
import { formatFrequencyBand } from '../utils/format'

interface InterviewDetailPageProps {
  id: string
}

const interviewSectionNames = new Set([
  '这道题在考什么',
  '故障排查路径',
  '常见错误回答',
  '项目怎么结合',
  '真实关联追问',
])

const learnSectionNames = new Set([
  '完整原理',
  'Production 实现',
  '代码 / 配置示例',
  '项目怎么结合',
  'Scale Lab',
])

function selectSections(
  sections: MarkdownSection[],
  mode: ReadingMode,
): MarkdownSection[] {
  const allowed = mode === 'interview' ? interviewSectionNames : learnSectionNames
  return sections.filter((section) => allowed.has(section.title))
}

export function InterviewDetailPage({
  id,
}: InterviewDetailPageProps) {
  const question = appRegistry.interviewBank.questions.find(
    (item) => item.id === id,
  )
  const [mode, setMode] = useState<ReadingMode>('interview')

  const rawAnswer = question?.answer_curated
    ? tryLoadMarkdownRaw(`content/interviews/answers/${id}.md`)
    : null

  const answer = useMemo(
    () =>
      rawAnswer
        ? parseFrontMatter<InterviewAnswerFrontMatter>(
            `content/interviews/answers/${id}.md`,
            rawAnswer,
          )
        : null,
    [id, rawAnswer],
  )

  const sections = useMemo(
    () => (answer ? splitH2Sections(answer.body) : []),
    [answer],
  )

  const quick = sections.find((section) => section.title === '30 秒回答')
  const bodySections = selectSections(
    sections.filter((section) => section.title !== '30 秒回答'),
    mode,
  )
  const evidence = getQuestionEvidence(id)

  if (!question) {
    return (
      <>
        <TopBar title="Interview" backHref="/interview" />
        <div className="page">
          <p className="eyebrow">NOT FOUND</p>
          <h1>Question not found</h1>
          <p>这个 Interview Question ID 不在当前 First 30 Bank 中。</p>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title={`Interview #${String(question.rank).padStart(2, '0')}`}
        backHref="/interview"
        showSearch={false}
      />

      <article className="page reading-page">
        <p className="eyebrow">
          {formatFrequencyBand(question.frequency_band)}
        </p>
        <h1>{question.question}</h1>

        <EvidenceDisclosure question={question} items={evidence} />

        {quick ? (
          <section className="quick-answer">
            <span className="quick-answer__label">30 秒回答</span>
            <MarkdownBlocks markdown={quick.body} />
          </section>
        ) : (
          <section className="answer-pending">
            <span className="badge badge--warning">CURATION BACKLOG</span>
            <h2>Curated Answer 还没有完成</h2>
            <p>
              这道题已经有真实 Evidence，但 V1 不会用运行时 AI 临时生成答案。完成编辑审核后才会进入 Answer 页面。
            </p>
          </section>
        )}

        {answer && (
          <>
            <ReadingSegment value={mode} onChange={setMode} />

            {bodySections.length > 0 ? (
              <MarkdownSections sections={bodySections} />
            ) : (
              <p className="empty-note">
                当前 Answer 还没有这个 Reading Mode 对应的 Section。
              </p>
            )}

            <footer className="content-footnote">
              <span>
                Answer status: {answer.meta.status ?? 'curated'}
              </span>
              <span>
                Project mapping:{' '}
                {answer.meta.project_connection?.status ?? 'not linked'}
              </span>
            </footer>
          </>
        )}
      </article>
    </>
  )
}
