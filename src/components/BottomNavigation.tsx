import type { RouteKey } from '../types/content'
import { navigate } from '../useHashRoute'
import {
  InterviewIcon,
  LearnIcon,
  ProjectsIcon,
  ScaleIcon,
} from './Icons'

interface BottomNavigationProps {
  active: RouteKey
}

const items = [
  { key: 'learn', label: 'Learn', Icon: LearnIcon },
  { key: 'interview', label: 'Interview', Icon: InterviewIcon },
  { key: 'scale', label: 'Scale', Icon: ScaleIcon },
  { key: 'projects', label: 'Projects', Icon: ProjectsIcon },
] satisfies Array<{ key: RouteKey; label: string; Icon: typeof LearnIcon }>

export function BottomNavigation({ active }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map(({ key, label, Icon }) => {
        const selected = active === key
        return (
          <button
            key={key}
            className="bottom-nav__item"
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
  )
}
