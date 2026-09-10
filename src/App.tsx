import { AppShell } from './components/AppShell'
import { InterviewPage } from './pages/InterviewPage'
import { LearnPage } from './pages/LearnPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ScalePage } from './pages/ScalePage'
import { useHashRoute } from './useHashRoute'

export default function App() {
  const route = useHashRoute()

  return (
    <AppShell route={route}>
      {route === 'learn' && <LearnPage />}
      {route === 'interview' && <InterviewPage />}
      {route === 'scale' && <ScalePage />}
      {route === 'projects' && <ProjectsPage />}
    </AppShell>
  )
}
