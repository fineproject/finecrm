import { useState } from 'react'
import type { Store } from '../useStore'
import { formatDate } from '../util'

interface Props {
  store: Store
  onOpenProjects: (companyId: string) => void
}

export default function CompaniesPage({ store, onOpenProjects }: Props) {
  const { db } = store
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    store.addCompany(name)
    setName('')
  }

  function projectCount(companyId: string) {
    return db.projects.filter((p) => p.companyId === companyId).length
  }
  function cariCount(companyId: string) {
    const pids = db.projects.filter((p) => p.companyId === companyId).map((p) => p.id)
    return db.cariler.filter((k) => pids.includes(k.projectId)).length
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Şirketler</h1>
          <p className="page-sub">Şirketlerinizi yönetin, her şirketin projelerine geçin.</p>
        </div>
      </div>

      <form className="add-bar" onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yeni şirket adı"
        />
        <button type="submit" className="btn primary">
          + Şirket Ekle
        </button>
      </form>

      {db.companies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🏢</div>
          <h2>Henüz şirket yok</h2>
          <p>Yukarıdaki alandan ilk şirketinizi ekleyerek başlayın.</p>
        </div>
      ) : (
        <div className="card-grid">
          {db.companies.map((c) => (
            <div key={c.id} className="entity-card">
              <div className="entity-card-head">
                <span className="entity-logo company">{c.name.charAt(0).toUpperCase()}</span>
                <button
                  className="trash static"
                  title="Şirketi sil"
                  onClick={() => {
                    if (
                      confirm(`"${c.name}" şirketi ve tüm projeleri/carileri silinsin mi?`)
                    ) {
                      store.deleteCompany(c.id)
                    }
                  }}
                >
                  🗑
                </button>
              </div>
              <h3 className="entity-name">{c.name}</h3>
              <div className="entity-meta">
                <span className="meta-chip">{projectCount(c.id)} proje</span>
                <span className="meta-chip">{cariCount(c.id)} cari</span>
              </div>
              <div className="entity-date">Eklendi: {formatDate(c.createdAt)}</div>
              <div className="entity-actions">
                <button className="btn small" onClick={() => onOpenProjects(c.id)}>
                  Projeleri Gör →
                </button>
                <button
                  className="btn small ghost"
                  onClick={() => {
                    const next = prompt('Yeni şirket adı', c.name)
                    if (next && next.trim()) store.renameCompany(c.id, next)
                  }}
                >
                  Yeniden Adlandır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
