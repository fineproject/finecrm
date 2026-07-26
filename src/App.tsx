import { useMemo, useState } from 'react'
import Nav, { type Page } from './components/Nav'
import CariDetail from './components/CariDetail'
import AddCariModal from './components/AddCariModal'
import OverviewPage from './pages/OverviewPage'
import CompaniesPage from './pages/CompaniesPage'
import ProjectsPage from './pages/ProjectsPage'
import CariPage from './pages/CariPage'
import { useStore } from './useStore'

export default function App() {
  const store = useStore()
  const { db } = store

  const [page, setPage] = useState<Page>('overview')
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)
  const [cariCompanyId, setCariCompanyId] = useState<string | null>(null)
  const [cariProjectId, setCariProjectId] = useState<string | null>(null)
  const [openCariId, setOpenCariId] = useState<string | null>(null)
  const [addingCari, setAddingCari] = useState(false)

  const openCari = useMemo(
    () => db.cariler.find((k) => k.id === openCariId) ?? null,
    [db.cariler, openCariId],
  )

  // Şirketler → o şirketin projelerine geç
  function openProjectsForCompany(companyId: string) {
    setCompanyFilter(companyId)
    setPage('projects')
  }

  // Projeler → o projenin carilerine geç
  function openCariForProject(projectId: string) {
    const project = db.projects.find((p) => p.id === projectId)
    if (project) {
      setCariCompanyId(project.companyId)
      setCariProjectId(project.id)
    }
    setPage('cari')
  }

  function changeCariCompany(companyId: string | null) {
    setCariCompanyId(companyId)
    setCariProjectId(null)
  }

  return (
    <div className="app">
      <Nav active={page} onNavigate={setPage} db={db} />

      <main className="main">
        {page === 'overview' && <OverviewPage store={store} onNavigate={setPage} />}

        {page === 'companies' && (
          <CompaniesPage store={store} onOpenProjects={openProjectsForCompany} />
        )}

        {page === 'projects' && (
          <ProjectsPage
            store={store}
            companyFilter={companyFilter}
            onChangeCompanyFilter={setCompanyFilter}
            onOpenCari={openCariForProject}
          />
        )}

        {page === 'cari' && (
          <CariPage
            store={store}
            companyId={cariCompanyId}
            projectId={cariProjectId}
            onChangeCompany={changeCariCompany}
            onChangeProject={setCariProjectId}
            onOpenCari={setOpenCariId}
            onAddCari={() => setAddingCari(true)}
          />
        )}
      </main>

      {openCari && (
        <CariDetail cari={openCari} store={store} onClose={() => setOpenCariId(null)} />
      )}

      {addingCari && cariProjectId && (
        <AddCariModal
          projectId={cariProjectId}
          store={store}
          onClose={() => setAddingCari(false)}
        />
      )}
    </div>
  )
}
