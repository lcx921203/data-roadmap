import { useMemo, useState } from 'react'
import type { CuratedFollowUpItem } from '../content/followups'
import { MarkdownBlocks } from './MarkdownBlocks'

interface FollowUpDisclosureProps {
  markdown: string
  curated: CuratedFollowUpItem[]
}

function normalizeQuestion(value: string): string {
  return value
    .trim()
    .replace(/^`|`$/g, '')
    .replace(/\s+/g, ' ')
}

function parseQuestions(markdown: string): string[] {
  return markdown
    .split('\n')
    .map((line) => line.match(/^\s*\d+\.\s+(.+?)\s*$/)?.[1] ?? null)
    .filter((value): value is string => Boolean(value))
}

export function FollowUpDisclosure({
  markdown,
  curated,
}: FollowUpDisclosureProps) {
  const questions = useMemo(() => parseQuestions(markdown), [markdown])
  const [open, setOpen] = useState<string | null>(null)

  const answers = useMemo(
    () =>
      new Map(
        curated.map((item) => [
          normalizeQuestion(item.question),
          item,
        ]),
      ),
    [curated],
  )

  if (questions.length === 0) return null

  return (
    <section className="article-section followup-section">
      <h2>关联追问</h2>
      <div className="followup-list">
        {questions.map((question, index) => {
          const key = normalizeQuestion(question)
          const item = answers.get(key)
          const expanded = open === key
          const hasAnswer = Boolean(item?.answer)

          if (!hasAnswer) {
            return (
              <div className="followup-row followup-row--pending" key={key}>
                <span>{question}</span>
                <small>答案整理中</small>
              </div>
            )
          }

          return (
            <div className="followup-item" key={key}>
              <button
                type="button"
                className="followup-row"
                aria-expanded={expanded}
                aria-controls={`followup-answer-${index}`}
                onClick={() => setOpen(expanded ? null : key)}
              >
                <span>{question}</span>
                <span
                  className="followup-row__indicator"
                  aria-hidden="true"
                >
                  {expanded ? '−' : '+'}
                </span>
              </button>

              {expanded && (
                <div
                  className="followup-answer"
                  id={`followup-answer-${index}`}
                >
                  <MarkdownBlocks markdown={item!.answer} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
