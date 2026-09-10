import { useMemo, useState } from 'react'
import type {
  InterviewQuestionSummary,
  QuestionEvidenceView,
} from '../types/content'
import {
  formatFrequencyBand,
  formatMapping,
  formatSourceReliability,
} from '../utils/format'
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
      <div className="evidence-summary">
        <div className="evidence-summary__stats">
          <strong>{formatFrequencyBand(question.frequency_band)}</strong>
          <span>
            {question.direct_count} 条独立面经 · {question.company_count} 家公司
          </span>
        </div>

        <button
          className="evidence-summary__action"
          type="button"
          onClick={() => setOpen(true)}
        >
          查看面经来源
        </button>
      </div>

      <BottomSheet open={open} title="面经来源" onClose={() => setOpen(false)}>
        <div className="evidence-sheet__summary">
          <strong>
            {question.direct_count} 条独立面经 · {question.company_count} 家公司
          </strong>
          {companies.length > 0 && (
            <p className="meta">涉及公司：{companies.join(' · ')}</p>
          )}
        </div>

        <div className="evidence-list">
          {items.length === 0 && (
            <p className="empty-note">暂时没有可展示的来源记录。</p>
          )}

          {items.map(({ evidence, mapping }) => {
            const source = evidence.source
            const context = evidence.interview_context
            const reliability = formatSourceReliability(source?.reliability)

            return (
              <article className="evidence-row" key={evidence.id}>
                <div className="evidence-row__top">
                  <strong>{context?.company ?? '公司信息未公开'}</strong>
                  {reliability && <span className="badge">{reliability}</span>}
                </div>

                <p>
                  {[context?.role, context?.round]
                    .filter(Boolean)
                    .join(' · ') || '岗位 / 轮次信息未公开'}
                </p>

                <div className="evidence-row__meta">
                  <span>{source?.publisher ?? '公开来源'}</span>
                  {source?.published_at && <span>{source.published_at}</span>}
                  <span>{formatMapping(mapping.mapping)}</span>
                </div>

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
          出现次数仅基于当前已收录并核验的面经来源，不代表绝对行业概率。
        </p>
      </BottomSheet>
    </>
  )
}
