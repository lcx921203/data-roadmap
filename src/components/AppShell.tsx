import type { PropsWithChildren } from 'react'
import type { RouteKey } from '../types/content'
import { BottomNavigation } from './BottomNavigation'
import { DesktopNavigation } from './DesktopNavigation'

interface AppShellProps extends PropsWithChildren {
  route: RouteKey
}

export function AppShell({ route, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <DesktopNavigation active={route} />
      <main className="app-shell__main">{children}</main>
      <BottomNavigation active={route} />
    </div>
  )
}
