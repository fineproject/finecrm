import { useMemo, useState } from 'react'
import type { Store } from '../useStore'
import { STAGES } from '../types'
import { formatDate } from '../util'

interface Props {
  store: Store
  companyFilter: string | null
  onChangeCompanyFilter: (companyId: string | null) => void
  onOpenCari: (projectId: string) => void
}

export default function ProjectsPage({
  store,
  companyFilter,
  onChangeCompanyFilter,
  onOpenCari,
}: Props) {
  const { db } = store
  const [name, setName] = useState('')
  const [formCompanyId, setFormCompanyId] = useState<string>(
    companyFilter ?? db.companies[0]?.id ?? '',
  )

  const projects = useMemo(
    () =>
      db.projects.filter((p) => (companyFilter ? p.companyId === companyFilter : true)),
    [db.projects, companyFilter],
  )

  function companyName(id: string) {
    return db.companies.find((c) => c.id === id)?.name ?? '—'
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const cid = formCompanyId || companyFilter || db.companies[0]?.id
    if (!name.trim() || !cid) return
    store.addProject(cid, name)
    setName('')
  }

  function stageBreakdown(projectId: string) {
    const items = db.cariler.filter((k) => k.projectId === projectId)
    return STAGES.map((s) => ({
      ...s,
      count: items.filter((k) => k.stage === s.key).length,
    }))
  }

  const noCompanies = db.companies.length === 0

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Projeler</h1>
          <p className="page-sub">Projeleri şirketlere göre yönetin, carilere geçin.</p>
        </div>
      </div>

      {!noCompanies && (
        <form className="add-bar" onSubmit={submit}>
          <select
            value={formCompanyId}
            onChange={(e) => setFormCompanyId(e.target.value)}
            aria-label="Şirket seç"
          >
            {db.companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Yeni proje adı"
          />
          <button type="submit" className="btn primary">
            + Proje Ekle
          </button>
        </form>
      )}

      {!noCompanies && (
        <div className="filter-bar">
          <span className="filter-bar-label">Şirkete göre filtrele:</span>
          <button
            className={`chip ${!companyFilter ? 'active' : ''}`}
            onClick={() => onChangeCompanyFilter(null)}
          >
            Tümü
          </button>
          {db.companies.map((c) => (
            <button
              key={c.id}
              className={`chip ${companyFilter === c.id ? 'active' : ''}`}
              onClick={() => onChangeCompanyFilter(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {noCompanies ? (
        <div className="empty-state">
          <div className="empty-emoji">🏢</div>
          <h2>Önce bir şirket ekleyin</h2>
          <p>Projeler şirketlere bağlıdır. "Şirketler" menüsünden bir şirket oluşturun.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">📁</div>
          <h2>Proje bulunamadı</h2>
          <p>Yukarıdaki alandan bu şirkete bir proje ekleyin.</p>
        </div>
      ) : (
        <div className="card-grid">
          {projects.map((p) => {
            const breakdown = stageBreakdown(p.id)
            const total = breakdown.reduce((a, b) => a + b.count, 0)
            return (
              <div key={p.id} className="entity-card">
                <div className="entity-card-head">
                  <span className="entity-logo project">📁</span>
                  <button
                    className="trash static"
                    title="Projeyi sil"
                    onClick={() => {
                      if (confirm(`"${p.name}" projesi ve carileri silinsin mi?`)) {
                        store.deleteProject(p.id)
                      }
                    }}
                  >
                    🗑
                  </button>
                </div>
                <h3 className="entity-name">{p.name}</h3>
                <div className="entity-company">🏢 {companyName(p.companyId)}</div>

                <div className="proj-stages">
                  {breakdown.map((s) => (
                    <div key={s.key} className="proj-stage" title={s.label}>
                      <span className="proj-stage-dot" style={{ background: s.color }} />
                      <span className="proj-stage-count">{s.count}</span>
                    </div>
                  ))}
                </div>

                <div className="entity-date">
                  {total} cari · Eklendi: {formatDate(p.createdAt)}
                </div>
                <div className="entity-actions">
                  <button className="btn small" onClick={() => onOpenCari(p.id)}>
                    Carileri Gör →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
