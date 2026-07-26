import { useState } from 'react'
import type { Store } from '../useStore'

interface Props {
  store: Store
  selectedCompanyId: string | null
  selectedProjectId: string | null
  onSelectCompany: (id: string) => void
  onSelectProject: (id: string) => void
}

export default function Sidebar({
  store,
  selectedCompanyId,
  selectedProjectId,
  onSelectCompany,
  onSelectProject,
}: Props) {
  const { db } = store
  const [companyName, setCompanyName] = useState('')
  const [projectName, setProjectName] = useState('')

  const projects = selectedCompanyId
    ? db.projects.filter((p) => p.companyId === selectedCompanyId)
    : []

  function submitCompany(e: React.FormEvent) {
    e.preventDefault()
    const name = companyName.trim()
    if (!name) return
    const c = store.addCompany(name)
    setCompanyName('')
    onSelectCompany(c.id)
  }

  function submitProject(e: React.FormEvent) {
    e.preventDefault()
    const name = projectName.trim()
    if (!name || !selectedCompanyId) return
    const p = store.addProject(selectedCompanyId, name)
    setProjectName('')
    onSelectProject(p.id)
  }

  function cariCount(projectId: string) {
    return db.cariler.filter((k) => k.projectId === projectId).length
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo">◆</span>
        <div>
          <div className="brand-name">FineCRM</div>
          <div className="brand-sub">Cari & Proje Paneli</div>
        </div>
      </div>

      <section className="side-section">
        <div className="side-head">
          <h2>Şirketler</h2>
          <span className="count-pill">{db.companies.length}</span>
        </div>

        <form className="inline-form" onSubmit={submitCompany}>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Yeni şirket adı"
            aria-label="Yeni şirket adı"
          />
          <button type="submit" title="Şirket ekle">
            +
          </button>
        </form>

        <ul className="side-list">
          {db.companies.length === 0 && (
            <li className="empty-hint">Henüz şirket yok. Yukarıdan ekleyin.</li>
          )}
          {db.companies.map((c) => (
            <li key={c.id}>
              <button
                className={`side-item ${c.id === selectedCompanyId ? 'active' : ''}`}
                onClick={() => onSelectCompany(c.id)}
              >
                <span className="side-item-name">{c.name}</span>
                <span
                  className="trash"
                  role="button"
                  tabIndex={0}
                  title="Şirketi sil"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`"${c.name}" şirketi ve tüm projeleri/carileri silinsin mi?`)) {
                      store.deleteCompany(c.id)
                    }
                  }}
                >
                  🗑
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedCompanyId && (
        <section className="side-section">
          <div className="side-head">
            <h2>Projeler</h2>
            <span className="count-pill">{projects.length}</span>
          </div>

          <form className="inline-form" onSubmit={submitProject}>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Yeni proje adı"
              aria-label="Yeni proje adı"
            />
            <button type="submit" title="Proje ekle">
              +
            </button>
          </form>

          <ul className="side-list">
            {projects.length === 0 && (
              <li className="empty-hint">Bu şirkette henüz proje yok.</li>
            )}
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  className={`side-item ${p.id === selectedProjectId ? 'active' : ''}`}
                  onClick={() => onSelectProject(p.id)}
                >
                  <span className="side-item-name">{p.name}</span>
                  <span className="side-item-meta">
                    <span className="count-pill sm">{cariCount(p.id)}</span>
                    <span
                      className="trash"
                      role="button"
                      tabIndex={0}
                      title="Projeyi sil"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`"${p.name}" projesi ve carileri silinsin mi?`)) {
                          store.deleteProject(p.id)
                        }
                      }}
                    >
                      🗑
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}
