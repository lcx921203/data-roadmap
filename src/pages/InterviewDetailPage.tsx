import { useMemo, useState } from 'react'
import { EvidenceDisclosure } from '../components/EvidenceDisclosure'
import { FollowUpDisclosure } from '../components/FollowUpDisclosure'
import { InlineRelationLinks } from '../components/InlineRelationLinks'
import { MarkdownBlocks } from '../components/MarkdownBlocks'
import { MarkdownSections } from '../components/MarkdownSections'
import { ReadingSegment } from '../components/ReadingSegment'
import { ScaleFollowUpSection } from '../components/ScaleFollowUpSection'
import { TopBar } from '../components/TopBar'
import {
  parseFrontMatter,
  splitH2Sections,
  tryLoadMarkdownRaw,
} from '../content/loaders'
import { getCuratedFollowUps } from '../content/followups'
import {
  appRegistry,
  getKnowledgeForInterview,
  getQuestionEvidence,
  getScalesForInterview,
} from '../content/registry'
import type { RelationTarget } from '../content/sectionRelations'
import type {
  InterviewAnswerFrontMatter,
  MarkdownSection,
  ReadingMode,
} from '../types/content'

interface InterviewDetailPageProps {
  id: string
  focusFollowUp?: string | null
}

const scaleTitles = new Set(['Scale Lab', '规模追问'])
const followUpTitles = new Set(['真实关联追问', '关联追问'])

const interviewSectionTitles = new Set([
  '这道题在考什么',
  '故障排查',
  '故障排查路径',
  '故障恢复路径',
  '排查路径',
  'Checkpoint 变慢怎么排查',
  '指标突然不准：标准排查路径',
  '常见错误回答',
])

function isScale(section: MarkdownSection): boolean {
  return scaleTitles.has(section.title)
}

function isFollowUp(section: MarkdownSection): boolean {
  return followUpTitles.has(section.title)
}

function selectCoreSections(
  sections: MarkdownSection[],
  mode: ReadingMode,
): MarkdownSection[] {
  const candidates = sections.filter(
    (section) =>
      !isScale(section) &&
      !isFollowUp(section) &&
      section.title !== '项目怎么结合',
  )

  if (mode === 'interview') {
    return candidates.filter((section) =>
      interviewSectionTitles.has(section.title),
    )
  }

  return candidates.filter(
    (section) =>
      section.title !== '这道题在考什么' &&
      section.title !== '常见错误回答',
  )
}

export function InterviewDetailPage({
  id,
  focusFollowUp = null,
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

  const quick = sections.find(
    (section) => section.title === '30 秒回答',
  )
  const scaleSection = sections.find(isScale)
  const followUpSection = sections.find(isFollowUp)
  const coreSections = selectCoreSections(
    sections.filter(
      (section) => section.title !== '30 秒回答',
    ),
    mode,
  )
  const followUps = getCuratedFollowUps(id)
  const evidence = getQuestionEvidence(id)
  const relatedKnowledge = getKnowledgeForInterview(id)
  const relatedScales = getScalesForInterview(id)

  const relationTargets: RelationTarget[] = [
    ...relatedKnowledge.map((article) => ({
      type: 'knowledge' as const,
      id: article.meta.id,
    })),
    ...relatedScales.map((scenario) => ({
      type: 'scale' as const,
      id: scenario.id,
    })),
  ]

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
        <h1 className="interview-question-title">
          {question.question}
        </h1>

        <EvidenceDisclosure
          question={question}
          items={evidence}
        />

        <InlineRelationLinks
          targets={relationTargets}
          placement="header"
        />

        {quick ? (
          <section className="quick-answer">
            <span className="quick-answer__label">30 秒回答</span>
            <MarkdownBlocks markdown={quick.body} />
          </section>
        ) : (
          <section className="answer-pending">
            <h2>答案整理中</h2>
            <p>可以先查看这道题的面经依据和关联学习内容。</p>
          </section>
        )}

        {answer && (
          <>
            <ReadingSegment
              value={mode}
              onChange={setMode}
            />

            {coreSections.length > 0 && (
              <MarkdownSections sections={coreSections} />
            )}

            {mode === 'interview' && scaleSection && (
              <ScaleFollowUpSection
                markdown={scaleSection.body}
              />
            )}

            {mode === 'interview' &&
              (followUpSection || followUps.length > 0) && (
                <FollowUpDisclosure
                  markdown={followUpSection?.body ?? ''}
                  curated={followUps}
                  initialOpen={focusFollowUp}
                />
              )}

            {coreSections.length === 0 && mode === 'learn' && (
              <p className="empty-note">
                这个阅读模式下暂时没有更多内容。
              </p>
            )}
          </>
        )}
      </article>
    </>
  )
}
