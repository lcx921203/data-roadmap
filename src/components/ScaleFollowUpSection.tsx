import type { ReactNode } from 'react'
import { MarkdownBlocks } from './MarkdownBlocks'

interface ScaleFollowUpSectionProps {
  markdown: string
}

interface Segment {
  kind: 'markdown' | 'text-panel'
  value: string
}

function splitScaleMarkdown(markdown: string): Segment[] {
  const segments: Segment[] = []
  const pattern = /```text\s*\n([\s\S]*?)```/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(markdown))) {
    const before = markdown.slice(cursor, match.index).trim()
    if (before) segments.push({ kind: 'markdown', value: before })

    const panel = match[1].trim()
    if (panel) segments.push({ kind: 'text-panel', value: panel })

    cursor = pattern.lastIndex
  }

  const after = markdown.slice(cursor).trim()
  if (after) segments.push({ kind: 'markdown', value: after })

  return segments
}

function TextPanel({ value }: { value: string }) {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className="scale-followup-panel">
      {lines.map((line, index) => (
        <div
          className={
            line === '↓'
              ? 'scale-followup-panel__arrow'
              : 'scale-followup-panel__line'
          }
          key={`${line}-${index}`}
        >
          {line}
        </div>
      ))}
    </div>
  )
}

export function ScaleFollowUpSection({
  markdown,
}: ScaleFollowUpSectionProps) {
  const segments = splitScaleMarkdown(markdown)

  return (
    <section className="article-section interview-scale-followup">
      <div className="section-kicker">INTERVIEW FOLLOW-UP</div>
      <h2>规模追问</h2>
      <div className="scale-followup-content">
        {segments.map((segment, index): ReactNode =>
          segment.kind === 'text-panel' ? (
            <TextPanel key={index} value={segment.value} />
          ) : (
            <MarkdownBlocks key={index} markdown={segment.value} />
          ),
        )}
      </div>
    </section>
  )
}
