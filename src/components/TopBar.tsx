import type { ReactNode } from 'react'
import { BackIcon, SearchIcon } from './Icons'

interface TopBarProps {
  title?: string
  backHref?: string
  showSearch?: boolean
  onSearch?: () => void
  action?: ReactNode
}

export function TopBar({
  title = 'DataRoadmap',
  backHref,
  showSearch = false,
  onSearch,
  action,
}: TopBarProps) {
  const detail = Boolean(backHref)

  return (
    <header
      className="top-bar"
      data-detail={detail}
      data-has-action={Boolean(action) || showSearch}
    >
      {backHref ? (
        <div className="top-bar__side">
          <a
            className="icon-button"
            href={`#${backHref}`}
            aria-label="返回"
          >
            <BackIcon />
          </a>
        </div>
      ) : (
        <div className="top-bar__brand">
          <strong className="top-bar__title">{title}</strong>
        </div>
      )}

      {backHref && (
        <strong className="top-bar__context">{title}</strong>
      )}

      <div className="top-bar__side top-bar__side--end">
        {action}
        {showSearch && (
          <button
            className="icon-button"
            type="button"
            aria-label="搜索"
            onClick={onSearch}
          >
            <SearchIcon />
          </button>
        )}
      </div>
    </header>
  )
}
