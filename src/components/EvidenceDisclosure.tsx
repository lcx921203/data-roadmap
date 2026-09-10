import { useMemo, useState } from 'react'
import type {
  InterviewQuestionSummary,
  QuestionEvidenceView,
} from '../types/content'
import { formatFrequencyBand, formatMapping } from '../utils/format'
import { BottomSheet } from './BottomSheet'

interface EvidenceDisclosureProps {
  question: InterviewQuestionSummary
  items: QuestionEvidenceView[]
}

export function EvidenceDisclosure({
  question,
  items,
}: EvidenceDisclosureProps) {
  const [open, setOpen] = useState(false)

  const companies = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.evidence.interview_context?.company)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [items],
  )

  return (
    <>
      <button
        className="evidence-summary"
        type="button"
        onClick={() => setOpen(true)}
      >
        <span>
          {question.direct_count} direct · {question.company_count} companies
        </span>
        <strong>{formatFrequencyBand(question.frequency_band)}</strong>
        <span className="evidence-summary__action">查看 Evidence ›</span>
      </button>

      <BottomSheet
        open={open}
        title="Interview Evidence"
        onClose={() => setOpen(false)}
      >
        <div className="evidence-sheet__summary">
          <strong>
            {question.direct_count} direct · {question.company_count} companies
          </strong>
          <p>
            当前 DataRoadmap 已校准语料范围。下方展示可追溯 Evidence 记录。
          </p>
          {companies.length > 0 && (
            <p className="meta">Companies: {companies.join(' · ')}</p>
          )}
        </div>

        <div className="evidence-list">
          {items.length === 0 && (
            <p className="empty-note">
              当前 Bundle 中没有找到该题的 final-review Evidence 记录。
            </p>
          )}

          {items.map(({ evidence, mapping }) => {
            const source = evidence.source
            const context = evidence.interview_context

            return (
              <article className="evidence-row" key={evidence.id}>
                <div className="evidence-row__top">
                  <strong>{context?.company ?? 'Company unavailable'}</strong>
                  <span className="badge">{source?.reliability ?? '—'}</span>
                </div>

                <p>
                  {[context?.role, context?.round]
                    .filter(Boolean)
                    .join(' · ') || 'Interview context unavailable'}
                </p>

                <div className="evidence-row__meta">
                  <span>{source?.publisher ?? 'Source'}</span>
                  <span>{source?.published_at ?? 'Date unavailable'}</span>
                  <span>{formatMapping(mapping.mapping)}</span>
                </div>

                {mapping.summary && (
                  <p className="evidence-row__summary">{mapping.summary}</p>
                )}

                {source?.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    打开原始来源 ↗
                  </a>
                )}
              </article>
            )
          })}
        </div>

        <p className="evidence-note">
          Evidence 可追溯不等于“绝对行业概率”。Frequency 仅代表当前已验证语料中的重复程度。
        </p>
      </BottomSheet>
    </>
  )
}
