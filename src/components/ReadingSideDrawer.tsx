import {
  useEffect,
  useId,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { ReadingDirectoryItem } from '../utils/readingDirectory'

interface ReadingSideDrawerProps {
  open: boolean
  items: ReadingDirectoryItem[]
  activeId: string | null
  onClose: () => void
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function ReadingSideDrawer({
  open,
  items,
  activeId,
  onClose,
}: ReadingSideDrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const gestureRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
  })

  const resolvedIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  )
  const progress =
    items.length > 0
      ? Math.round(((resolvedIndex + 1) / items.length) * 100)
      : 0
  const current = items[resolvedIndex] ?? null

  useEffect(() => {
    if (!open) return

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    window.requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          focusableSelector,
        ),
      )

      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

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

  const onGestureStart = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (event.pointerType !== 'touch') return

    gestureRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    }
  }

  const onGestureEnd = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const gesture = gestureRef.current
    if (
      !gesture.active ||
      gesture.pointerId !== event.pointerId
    ) {
      return
    }

    gesture.active = false
    const deltaX = event.clientX - gesture.startX
    const deltaY = event.clientY - gesture.startY

    if (
      deltaX > 64 &&
      Math.abs(deltaX) > Math.abs(deltaY) + 20
    ) {
      onClose()
    }
  }

  return (
    <div
      className="reading-drawer-backdrop"
      data-open={open}
      aria-hidden={!open}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <aside
        className="reading-side-drawer"
        data-open={open}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onPointerDown={onGestureStart}
        onPointerUp={onGestureEnd}
        onPointerCancel={onGestureEnd}
      >
        <header className="reading-side-drawer__header">
          <div>
            <h2 id={titleId}>目录</h2>
            <p>向右滑动或点击左侧空白区域可收起</p>
          </div>
        </header>

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

          {current && <p>当前：{current.label}</p>}
        </div>

        <nav
          className="reading-directory__list reading-side-drawer__list"
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

        <footer className="reading-side-drawer__footer">
          <button
            className="reading-side-drawer__close"
            type="button"
            onClick={onClose}
          >
            收起目录
          </button>
        </footer>
      </aside>
    </div>
  )
}
