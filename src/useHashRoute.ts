import { useEffect, useState } from 'react'
import type { HashRoute, RouteKey } from './types/content'

const routes: RouteKey[] = ['learn', 'interview', 'scale', 'projects']

function readRoute(): HashRoute {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const parts = raw.split('/').filter(Boolean)

  if (!routes.includes(parts[0] as RouteKey)) {
    return {
      key: 'learn',
      segments: [],
      path: '/learn',
    }
  }

  const key = parts[0] as RouteKey
  const segments = parts.slice(1)

  return {
    key,
    segments,
    path: `/${[key, ...segments].join('/')}`,
  }
}

export function navigate(path: RouteKey | string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  window.location.hash = normalized
}

export function useHashRoute(): HashRoute {
  const [route, setRoute] = useState<HashRoute>(() => readRoute())

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
