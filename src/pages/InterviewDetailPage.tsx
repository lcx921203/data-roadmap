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
  const allowed =
    mode === 'interview' ? interviewSectionNames : learnSectionNames
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
          <h1>页面暂时不可用</h1>
          <p>请返回面试题列表重新选择。</p>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar
        title={`面试题 #${String(question.rank).padStart(2, '0')}`}
        backHref="/interview"
      />

      <article className="page reading-page">
        <h1 className="interview-question-title">{question.question}</h1>

        <EvidenceDisclosure question={question} items={evidence} />

        {quick ? (
          <section className="quick-answer">
            <span className="quick-answer__label">30 秒回答</span>
            <MarkdownBlocks markdown={quick.body} />
          </section>
        ) : (
          <section className="answer-pending">
            <h2>答案整理中</h2>
            <p>可以先查看这道题的真实面经来源。</p>
          </section>
        )}

        {answer && (
          <>
            <ReadingSegment value={mode} onChange={setMode} />

            {bodySections.length > 0 ? (
              <MarkdownSections sections={bodySections} />
            ) : (
              <p className="empty-note">这个阅读模式下暂时没有更多内容。</p>
            )}
          </>
        )}
      </article>
    </>
  )
}
