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

interface DiagramBranchProps {
  label?: string
  children: ReactNode
  className?: string
}

export function DiagramBranch({
  label,
  children,
  className = '',
}: DiagramBranchProps) {
  return (
    <div className={`diagram-branch ${className}`.trim()}>
      <div className="diagram-branch__connector" aria-hidden="true">
        {label && <span className="diagram-branch__label">{label}</span>}
        <i className="diagram-branch__trunk" />
        <i className="diagram-branch__bar" />
        <i className="diagram-branch__leg diagram-branch__leg--left" />
        <i className="diagram-branch__leg diagram-branch__leg--right" />
        <i className="diagram-branch__tip diagram-branch__tip--left" />
        <i className="diagram-branch__tip diagram-branch__tip--right" />
      </div>

      <div className="diagram-branch__children">
        {children}
      </div>
    </div>
  )
}
