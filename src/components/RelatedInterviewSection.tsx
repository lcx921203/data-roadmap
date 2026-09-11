import {
  appRegistry,
  getQuestionEvidenceStats,
} from '../content/registry'

interface RelatedInterviewSectionProps {
  ids?: string[]
}

export function RelatedInterviewSection({
  ids,
}: RelatedInterviewSectionProps) {
  if (!ids?.length) return null

  const questions = ids.flatMap((id) => {
    const question = appRegistry.interviewBank.questions.find(
      (item) => item.id === id,
    )
    return question ? [question] : []
  })

  if (!questions.length) return null

  return (
    <section className="related-interviews" aria-label="真实面试关联">
      <div className="related-interviews__heading">
        <h2>真实面试关联</h2>
        <p>
          来自已有面试证据。这里表示内容相关，不代表 Iceberg 专项频率。
        </p>
      </div>

      <div className="related-interviews__list">
        {questions.map((question) => {
          const stats = getQuestionEvidenceStats(question)

          return (
            <a
              className="related-interviews__row"
              href={`#/interview/${question.id}`}
              key={question.id}
            >
              <div>
                <strong>{question.question}</strong>
                <span>
                  {stats.evidenceCount} 份面经
                  {stats.companyCount > 0
                    ? ` · ${stats.companyCount} 家公司`
                    : ''}
                  {' · '}
                  {question.answer_curated ? '已有题解' : '答案整理中'}
                </span>
              </div>
              <span className="related-interviews__action">查看</span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
