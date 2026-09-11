import type { KeyboardEvent } from 'react'
import type { ReadingMode } from '../types/content'

interface ReadingSegmentProps {
  value: ReadingMode
  onChange: (value: ReadingMode) => void
}

const options: Array<{ value: ReadingMode; label: string }> = [
  { value: 'interview', label: '面试回答' },
  { value: 'learn', label: '深入理解' },
]

export function ReadingSegment({
  value,
  onChange,
}: ReadingSegmentProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    onChange(value === 'interview' ? 'learn' : 'interview')
  }

  return (
    <div
      className="reading-segment"
      role="tablist"
      aria-label="阅读模式"
      onKeyDown={onKeyDown}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          data-selected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
