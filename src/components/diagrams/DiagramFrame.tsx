import type { ReactNode } from 'react'

interface DiagramFrameProps {
  title: string
  caption: string
  children: ReactNode
  className?: string
}

export function DiagramFrame({
  title,
  caption,
  children,
  className = '',
}: DiagramFrameProps) {
  return (
    <figure className={`technical-diagram ${className}`.trim()}>
      <div className="technical-diagram__header">
        <strong>{title}</strong>
        <span>结构图</span>
      </div>

      <div className="technical-diagram__canvas">
        {children}
      </div>

      <figcaption>{caption}</figcaption>
    </figure>
  )
}

interface DiagramNodeProps {
  tone: 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan'
  title: string
  subtitle?: string
  compact?: boolean
}

export function DiagramNode({
  tone,
  title,
  subtitle,
  compact = false,
}: DiagramNodeProps) {
  return (
    <div
      className={`diagram-node diagram-node--${tone}${
        compact ? ' diagram-node--compact' : ''
      }`}
    >
      <strong>{title}</strong>
      {subtitle && <span>{subtitle}</span>}
    </div>
  )
}

export function DiagramArrow({ label }: { label?: string }) {
  return (
    <div className="diagram-arrow" aria-hidden={label ? undefined : true}>
      {label && <span>{label}</span>}
      <i />
    </div>
  )
}
