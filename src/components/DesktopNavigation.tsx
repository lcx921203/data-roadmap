import type { RouteKey } from '../types/content'
import { navigate } from '../useHashRoute'
import { InterviewIcon, LearnIcon, ScaleIcon } from './Icons'

interface DesktopNavigationProps {
  active: RouteKey
}

const items = [
  { key: 'learn', label: 'Learn', Icon: LearnIcon },
  { key: 'interview', label: 'Interview', Icon: InterviewIcon },
  { key: 'scale', label: 'Scale Lab', Icon: ScaleIcon },
] satisfies Array<{ key: RouteKey; label: string; Icon: typeof LearnIcon }>

export function DesktopNavigation({ active }: DesktopNavigationProps) {
  return (
    <aside className="desktop-nav">
      <div className="desktop-nav__brand">
        <strong>DataRoadmap</strong>
        <span>From Data Engineering to AI</span>
      </div>

      <nav aria-label="主导航">
        {items.map(({ key, label, Icon }) => {
          const selected = active === key
          return (
            <button
              key={key}
              className="desktop-nav__item"
              data-active={selected}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => navigate(key)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
