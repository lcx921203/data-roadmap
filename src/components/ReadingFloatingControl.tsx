import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { DirectoryIcon } from './Icons'

interface ReadingFloatingControlProps {
  open: boolean
  onToggle: () => void
}

const storageKey = 'dataroadmap-reading-directory-y'
const defaultRatio = 0.62

function clampTop(value: number): number {
  const min = 104
  const max = Math.max(min, window.innerHeight - 178)
  return Math.min(max, Math.max(min, value))
}

export function ReadingFloatingControl({
  open,
  onToggle,
}: ReadingFloatingControlProps) {
  const [top, setTop] = useState(() =>
    typeof window === 'undefined'
      ? 420
      : clampTop(window.innerHeight * defaultRatio),
  )
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startY: 0,
    startTop: 0,
    moved: false,
  })

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(storageKey))
    const initial = Number.isFinite(stored) && stored > 0
      ? stored
      : window.innerHeight * defaultRatio

    setTop(clampTop(initial))

    const onResize = () => {
      setTop((current) => clampTop(current))
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId)

    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startY: event.clientY,
      startTop: top,
      moved: false,
    }
  }

  const onPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    const delta = event.clientY - drag.startY
    if (Math.abs(delta) > 5) drag.moved = true

    setTop(clampTop(drag.startTop + delta))
  }

  const finishPointer = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    drag.active = false

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (drag.moved) {
      const finalTop = clampTop(
        drag.startTop + event.clientY - drag.startY,
      )
      setTop(finalTop)
      window.localStorage.setItem(storageKey, String(finalTop))
    } else {
      onToggle()
    }
  }

  const cancelPointer = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    const drag = dragRef.current
    if (!drag.active || drag.pointerId !== event.pointerId) return

    drag.active = false

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <button
      className="reading-floating-control"
      data-open={open}
      type="button"
      aria-label={open ? '收起目录' : '打开目录'}
      aria-expanded={open}
      style={{ top }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={cancelPointer}
    >
      <DirectoryIcon />
      <span>目录</span>
    </button>
  )
}
