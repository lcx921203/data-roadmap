import { BottomSheet } from './BottomSheet'
import type { ReadingDirectoryItem } from '../utils/readingDirectory'

interface ReadingDirectorySheetProps {
  open: boolean
  items: ReadingDirectoryItem[]
  activeId: string | null
  onClose: () => void
}

export function ReadingDirectorySheet({
  open,
  items,
  activeId,
  onClose,
}: ReadingDirectorySheetProps) {
  const resolvedIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  )
  const progress =
    items.length > 0
      ? Math.round(((resolvedIndex + 1) / items.length) * 100)
      : 0
  const current = items[resolvedIndex] ?? null

  const jumpTo = (id: string) => {
    onClose()

    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
          ? 'auto'
          : 'smooth',
      })
    })
  }

  return (
    <BottomSheet open={open} title="目录" onClose={onClose}>
      <div className="reading-directory__progress">
        <div className="reading-directory__progress-line">
          <span>阅读进度</span>
          <strong>{progress}%</strong>
        </div>
        <div
          className="reading-directory__track"
          role="progressbar"
          aria-label="文章阅读进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        {current && (
          <p>
            当前：{current.label}
          </p>
        )}
      </div>

      <nav
        className="reading-directory__list"
        aria-label="文章目录"
      >
        {items.map((item) => {
          const active = item.id === activeId

          return (
            <button
              key={item.id}
              type="button"
              className="reading-directory__item"
              data-level={item.level}
              data-active={active}
              aria-current={active ? 'location' : undefined}
              onClick={() => jumpTo(item.id)}
            >
              <span>{item.label}</span>
              {active && <strong>当前</strong>}
            </button>
          )
        })}
      </nav>
    </BottomSheet>
  )
}
