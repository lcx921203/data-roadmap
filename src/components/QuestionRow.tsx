import type { InterviewQuestionSummary } from '../types/content'
import { formatFrequencyBand } from '../utils/format'

interface QuestionRowProps {
  item: InterviewQuestionSummary
}

export function QuestionRow({ item }: QuestionRowProps) {
  return (
    <article className="question-row">
      <div className="question-row__meta">
        <span className="question-row__rank">
          #{String(item.rank).padStart(2, '0')} · {formatFrequencyBand(item.frequency_band)}
        </span>
        <span>
          {item.direct_count} direct · {item.company_count} companies
        </span>
      </div>
      <h2>{item.question}</h2>
      <div className="question-row__footer">
        <span>{item.answer_curated ? 'Curated' : 'To curate'}</span>
        <span>{item.publishable ? 'Publishable' : 'Evidence scope'}</span>
      </div>
    </article>
  )
}
