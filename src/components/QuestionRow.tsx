import type { InterviewQuestionSummary } from '../types/content'
import { getQuestionEvidenceStats } from '../content/registry'
import { formatFrequencyBand } from '../utils/format'

interface QuestionRowProps {
  item: InterviewQuestionSummary
  matchedFollowUp?: string | null
}

export function QuestionRow({
  item,
  matchedFollowUp = null,
}: QuestionRowProps) {
  const stats = getQuestionEvidenceStats(item)
  const href = matchedFollowUp
    ? `#/interview/${item.id}/followup/${encodeURIComponent(matchedFollowUp)}`
    : `#/interview/${item.id}`

  return (
    <a className="question-row" href={href}>
      <div className="question-row__meta">
        <span className="question-row__rank">
          #{String(item.rank).padStart(2, '0')} ·{' '}
          {formatFrequencyBand(stats.frequencyBand)}
        </span>
        <span>
          {stats.evidenceCount} 份面经 · {stats.companyCount} 家公司
        </span>
      </div>
      <h2>{item.question}</h2>
      {matchedFollowUp ? (
        <div className="question-row__footer">
          <span>命中追问 · {matchedFollowUp}</span>
        </div>
      ) : (
        item.answer_curated && (
          <div className="question-row__footer">
            <span>答案已整理</span>
          </div>
        )
      )}
    </a>
  )
}
