import { useMemo, useState } from 'react'
import { CopyIcon } from './Icons'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const lineCount = useMemo(() => code.split('\n').length, [code])
  const collapsible = lineCount > 12
  const [expanded, setExpanded] = useState(!collapsible)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-block">
      <header className="code-block__header">
        <span>{language || 'text'}</span>
        <div>
          {collapsible && (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? 'Collapse' : `Show ${lineCount} lines`}
            </button>
          )}
          <button type="button" aria-label="复制代码" onClick={copy}>
            <CopyIcon />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </header>

      {expanded && (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
