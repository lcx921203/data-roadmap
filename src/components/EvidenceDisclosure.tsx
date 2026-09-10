import { useMemo, useState } from 'react'
import type {
  InterviewQuestionSummary,
  QuestionEvidenceView,
} from '../types/content'
import { getQuestionEvidenceStats } from '../content/registry'
import { formatFrequencyBand } from '../utils/format'
import { BottomSheet } from './BottomSheet'

interface EvidenceDisclosureProps {
  question: InterviewQuestionSummary
  items: QuestionEvidenceView[]
}

interface CompanyGroup {
  company: string
  items: QuestionEvidenceView[]
}

export function EvidenceDisclosure({
  question,
  items,
}: EvidenceDisclosureProps) {
  const [open, setOpen] = useState(false)
  const stats = getQuestionEvidenceStats(question)

  const groups = useMemo<CompanyGroup[]>(() => {
    const map = new Map<string, QuestionEvidenceView[]>()

    for (const item of items) {
      const company =
        item.evidence.interview_context?.company ?? '公司信息未公开'
      const current = map.get(company) ?? []
      current.push(item)
      map.set(company, current)
    }

    return Array.from(map.entries())
      .map(([company, groupedItems]) => ({
        company,
        items: [...groupedItems].sort((left, right) => {
          const leftDate = left.evidence.source?.published_at ?? ''
          const rightDate = right.evidence.source?.published_at ?? ''
          return rightDate.localeCompare(leftDate)
        }),
      }))
      .sort((left, right) => {
        const countCompare = right.items.length - left.items.length
        return countCompare !== 0
          ? countCompare
          : left.company.localeCompare(right.company)
      })
  }, [items])

  return (
    <>
      <div className="evidence-summary">
        <div className="evidence-summary__stats">
          <strong>{formatFrequencyBand(stats.frequencyBand)}</strong>
          <span>
            {stats.evidenceCount} 份面经 · {stats.companyCount} 家公司
          </span>
        </div>

        <button
          className="evidence-summary__action"
          type="button"
          onClick={() => setOpen(true)}
        >
          面经依据 <span aria-hidden="true">›</span>
        </button>
      </div>

      <BottomSheet open={open} title="面经依据" onClose={() => setOpen(false)}>
        <section className="evidence-overview" aria-label="面经覆盖情况">
          <span>题目出现记录</span>
          <strong>
            {stats.evidenceCount} 份面经 · {stats.companyCount} 家公司
          </strong>
        </section>

        <div className="evidence-group-heading">
          <strong>按公司</strong>
        </div>

        <div className="evidence-company-list">
          {groups.length === 0 && (
            <p className="empty-note">暂时没有可展示的面经记录。</p>
          )}

          {groups.map((group) => (
            <section className="evidence-company" key={group.company}>
              <header className="evidence-company__header">
                <strong>{group.company}</strong>
                <span>{group.items.length} 份</span>
              </header>

              <div className="evidence-company__items">
                {group.items.map(({ evidence }) => {
                  const source = evidence.source
                  const context = evidence.interview_context
                  const roleRound = [context?.role, context?.round]
                    .filter(Boolean)
                    .join(' · ')

                  return (
                    <article className="evidence-record" key={evidence.id}>
                      <strong>
                        {roleRound || '岗位 / 轮次信息未公开'}
                      </strong>
                      <div className="evidence-record__meta">
                        {source?.publisher && <span>{source.publisher}</span>}
                        {source?.published_at && (
                          <span>{source.published_at}</span>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <p className="evidence-note">
          数据来自当前已核验的面经记录；后续补充证据并完成校准后，数量会随内容数据更新。
        </p>
      </BottomSheet>
    </>
  )
}
