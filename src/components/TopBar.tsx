import { SearchIcon } from './Icons'

interface TopBarProps {
  title?: string
}

export function TopBar({ title = 'DataRoadmap' }: TopBarProps) {
  return (
    <header className="top-bar">
      <strong className="top-bar__title">{title}</strong>
      <button className="icon-button" type="button" aria-label="搜索">
        <SearchIcon />
      </button>
    </header>
  )
}
