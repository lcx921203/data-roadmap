import { BackIcon, SearchIcon } from './Icons'

interface TopBarProps {
  title?: string
  backHref?: string
  showSearch?: boolean
}

export function TopBar({
  title = 'DataRoadmap',
  backHref,
  showSearch = true,
}: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__side">
        {backHref ? (
          <a className="icon-button" href={`#${backHref}`} aria-label="返回">
            <BackIcon />
          </a>
        ) : (
          <strong className="top-bar__title">{title}</strong>
        )}
      </div>

      {backHref && <strong className="top-bar__context">{title}</strong>}

      <div className="top-bar__side top-bar__side--end">
        {showSearch && (
          <button className="icon-button" type="button" aria-label="搜索">
            <SearchIcon />
          </button>
        )}
      </div>
    </header>
  )
}
