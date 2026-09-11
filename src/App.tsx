import { useEffect } from 'react'
import { AppShell } from './components/AppShell'
import { InterviewDetailPage } from './pages/InterviewDetailPage'
import { InterviewPage } from './pages/InterviewPage'
import { KnowledgeDetailPage } from './pages/KnowledgeDetailPage'
import { LearnPage } from './pages/LearnPage'
import { ScalePage } from './pages/ScalePage'
import { StagePage } from './pages/StagePage'
import type { HashRoute } from './types/content'
import { useHashRoute } from './useHashRoute'

function RouteContent({ route }: { route: HashRoute }) {
  if (route.key === 'learn') {
    if (route.segments[0] === 'stage' && route.segments[1]) {
      return <StagePage stageId={route.segments[1]} />
    }

    if (route.segments[0]?.startsWith('kb-')) {
      return <KnowledgeDetailPage id={route.segments[0]} />
    }

    return <LearnPage />
  }

  if (route.key === 'interview') {
    if (route.segments[0]) {
      return <InterviewDetailPage id={route.segments[0]} />
    }

    return <InterviewPage />
  }

  return <ScalePage />
}

export default function App() {
  const route = useHashRoute()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [route.path])

  return (
    <AppShell route={route.key}>
      <RouteContent route={route} />
    </AppShell>
  )
}
