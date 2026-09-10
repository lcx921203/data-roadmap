import { useEffect, useState } from 'react'
import type { RouteKey } from './types/content'

const routes: RouteKey[] = ['learn', 'interview', 'scale', 'projects']

function readRoute(): RouteKey {
  const value = window.location.hash.replace(/^#\/?/, '').split('/')[0]
  return routes.includes(value as RouteKey) ? (value as RouteKey) : 'learn'
}

export function navigate(route: RouteKey) {
  window.location.hash = `/${route}`
}

export function useHashRoute(): RouteKey {
  const [route, setRoute] = useState<RouteKey>(() => readRoute())

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)

    if (!window.location.hash) {
      window.location.hash = '/learn'
    }

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
