import type { ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'

interface MarkdownBlocksProps {
  markdown: string
}

function inline(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={index}>{token.slice(1, -1)}</code>
    }

    return token
  })
}

function isBoundary(line: string): boolean {
  return (
    /^```/.test(line) ||
    /^###\s+/.test(line) ||
    /^####\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line)
  )
}

export function MarkdownBlocks({ markdown }: MarkdownBlocksProps) {
  const lines = markdown.split('\n')
  const blocks: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i += 1
      continue
    }

    const fence = line.match(/^```([\w+-]*)\s*$/)
    if (fence) {
      const language = fence[1] || 'text'
      const code: string[] = []
      i += 1
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i])
        i += 1
      }
      i += 1
      blocks.push(
        <CodeBlock
          key={`code-${blocks.length}`}
          code={code.join('\n')}
          language={language}
        />,
      )
      continue
    }

    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      blocks.push(<h3 key={`h3-${blocks.length}`}>{inline(h3[1])}</h3>)
      i += 1
      continue
    }

    const h4 = line.match(/^####\s+(.+)$/)
    if (h4) {
      blocks.push(<h4 key={`h4-${blocks.length}`}>{inline(h4[1])}</h4>)
      i += 1
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ''))
        i += 1
      }
      blocks.push(
        <blockquote key={`quote-${blocks.length}`}>
          {quote.map((value, index) => (
            <p key={index}>{inline(value)}</p>
          ))}
        </blockquote>,
      )
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i += 1
      }
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {items.map((value, index) => (
            <li key={index}>{inline(value)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i += 1
      }
      blocks.push(
        <ol key={`ol-${blocks.length}`}>
          {items.map((value, index) => (
            <li key={index}>{inline(value)}</li>
          ))}
        </ol>,
      )
      continue
    }

    if (/^#\s+/.test(line) || /^##\s+/.test(line)) {
      i += 1
      continue
    }

    const paragraph: string[] = [line.trim()]
    i += 1
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isBoundary(lines[i]) &&
      !/^#{1,2}\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i].trim())
      i += 1
    }

    blocks.push(
      <p key={`p-${blocks.length}`}>
        {inline(paragraph.join(' '))}
      </p>,
    )
  }

  return <>{blocks}</>
}
