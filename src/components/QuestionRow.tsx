import type { InterviewQuestionSummary } from '../types/content'
import { formatFrequencyBand } from '../utils/format'

interface QuestionRowProps {
  item: InterviewQuestionSummary
}

export function QuestionRow({ item }: QuestionRowProps) {
  return (
    <a className="question-row" href={`#/interview/${item.id}`}>
      <div className="question-row__meta">
        <span className="question-row__rank">
          #{String(item.rank).padStart(2, '0')} ·{' '}
          {formatFrequencyBand(item.frequency_band)}
        </span>
        <span>
          {item.direct_count} 条独立面经 · {item.company_count} 家公司
        </span>
      </div>
      <h2>{item.question}</h2>
      {item.answer_curated && (
        <div className="question-row__footer">
          <span>答案已整理</span>
        </div>
      )}
    </a>
  )
}
