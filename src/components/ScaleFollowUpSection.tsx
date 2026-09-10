import type { ReactNode } from 'react'
import { MarkdownBlocks } from './MarkdownBlocks'

interface ScaleFollowUpSectionProps {
  markdown: string
}

interface Segment {
  kind: 'markdown' | 'text-panel'
  value: string
}

type FlowLine =
  | { kind: 'node'; text: string }
  | { kind: 'arrow' }
  | { kind: 'branch'; text: string; last: boolean }

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

function parseFlowLines(value: string): FlowLine[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): FlowLine => {
      if (line === '↓') return { kind: 'arrow' }

      const branch = line.match(/^([├└])(?:──|─+)\s*(.+)$/)
      if (branch) {
        return {
          kind: 'branch',
          text: branch[2].trim(),
          last: branch[1] === '└',
        }
      }

      return { kind: 'node', text: line }
    })
}

function TextPanel({ value }: { value: string }) {
  const lines = parseFlowLines(value)

  return (
    <div className="scale-followup-panel" aria-label="规模追问结构">
      {lines.map((line, index) => {
        if (line.kind === 'arrow') {
          return (
            <div
              className="scale-followup-panel__arrow"
              aria-hidden="true"
              key={`arrow-${index}`}
            >
              ↓
            </div>
          )
        }

        if (line.kind === 'branch') {
          return (
            <div
              className={`scale-followup-panel__branch${
                line.last ? ' scale-followup-panel__branch--last' : ''
              }`}
              key={`${line.text}-${index}`}
            >
              <span>{line.text}</span>
            </div>
          )
        }

        return (
          <div
            className="scale-followup-panel__node"
            key={`${line.text}-${index}`}
          >
            {line.text}
          </div>
        )
      })}
    </div>
  )
}

export function ScaleFollowUpSection({
  markdown,
}: ScaleFollowUpSectionProps) {
  const segments = splitScaleMarkdown(markdown)

  return (
    <section className="article-section interview-scale-followup">
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
