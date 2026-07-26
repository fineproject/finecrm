import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import CariDetail from './components/CariDetail'
import AddCariModal from './components/AddCariModal'
import { useStore } from './useStore'

export default function App() {
  const store = useStore()
  const { db } = store

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [openCariId, setOpenCariId] = useState<string | null>(null)
  const [addingCari, setAddingCari] = useState(false)

  // İlk açılışta ilk şirket/projeyi otomatik seç
  useEffect(() => {
    if (!selectedCompanyId && db.companies.length > 0) {
      setSelectedCompanyId(db.companies[0].id)
    }
  }, [db.companies, selectedCompanyId])

  useEffect(() => {
    if (!selectedCompanyId) {
      setSelectedProjectId(null)
      return
    }
    const projects = db.projects.filter((p) => p.companyId === selectedCompanyId)
    const stillValid = projects.some((p) => p.id === selectedProjectId)
    if (!stillValid) {
      setSelectedProjectId(projects[0]?.id ?? null)
    }
  }, [selectedCompanyId, db.projects, selectedProjectId])

  const selectedCompany = useMemo(
    () => db.companies.find((c) => c.id === selectedCompanyId) ?? null,
    [db.companies, selectedCompanyId],
  )
  const selectedProject = useMemo(
    () => db.projects.find((p) => p.id === selectedProjectId) ?? null,
    [db.projects, selectedProjectId],
  )
  const openCari = useMemo(
    () => db.cariler.find((k) => k.id === openCariId) ?? null,
    [db.cariler, openCariId],
  )

  function selectCompany(id: string) {
    setSelectedCompanyId(id)
    setSelectedProjectId(null)
  }

  return (
    <div className="app">
      <Sidebar
        store={store}
        selectedCompanyId={selectedCompanyId}
        selectedProjectId={selectedProjectId}
        onSelectCompany={selectCompany}
        onSelectProject={setSelectedProjectId}
      />

      <main className="main">
        <header className="topbar">
          <div className="crumbs">
            {selectedCompany ? (
              <>
                <span className="crumb">{selectedCompany.name}</span>
                {selectedProject && (
                  <>
                    <span className="crumb-sep">/</span>
                    <span className="crumb strong">{selectedProject.name}</span>
                  </>
                )}
              </>
            ) : (
              <span className="crumb muted">Başlamak için bir şirket seçin veya ekleyin</span>
            )}
          </div>
          <div className="topbar-stats">
            <span className="stat">
              <b>{db.companies.length}</b> şirket
            </span>
            <span className="stat">
              <b>{db.projects.length}</b> proje
            </span>
            <span className="stat">
              <b>{db.cariler.length}</b> cari
            </span>
          </div>
        </header>

        <div className="content">
          {!selectedCompany && (
            <EmptyState
              title="Henüz şirket seçilmedi"
              text="Soldaki panelden bir şirket ekleyin, ardından o şirkete projeler ve cariler tanımlayın."
            />
          )}

          {selectedCompany && !selectedProject && (
            <EmptyState
              title="Proje seçilmedi"
              text={`"${selectedCompany.name}" için soldaki panelden bir proje ekleyin veya seçin. Cariler projelere bağlıdır.`}
            />
          )}

          {selectedProject && (
            <Board
              project={selectedProject}
              store={store}
              onOpenCari={setOpenCariId}
              onAddCari={() => setAddingCari(true)}
            />
          )}
        </div>
      </main>

      {openCari && (
        <CariDetail cari={openCari} store={store} onClose={() => setOpenCariId(null)} />
      )}

      {addingCari && selectedProject && (
        <AddCariModal
          projectId={selectedProject.id}
          store={store}
          onClose={() => setAddingCari(false)}
        />
      )}
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <div className="empty-emoji">🗂️</div>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}
