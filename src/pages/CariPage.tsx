import { useMemo } from 'react'
import type { Store } from '../useStore'
import Board from '../components/Board'

interface Props {
  store: Store
  companyId: string | null
  projectId: string | null
  onChangeCompany: (companyId: string | null) => void
  onChangeProject: (projectId: string | null) => void
  onOpenCari: (cariId: string) => void
  onAddCari: () => void
}

export default function CariPage({
  store,
  companyId,
  projectId,
  onChangeCompany,
  onChangeProject,
  onOpenCari,
  onAddCari,
}: Props) {
  const { db } = store

  const projects = useMemo(
    () => db.projects.filter((p) => (companyId ? p.companyId === companyId : true)),
    [db.projects, companyId],
  )
  const project = db.projects.find((p) => p.id === projectId) ?? null

  const noCompanies = db.companies.length === 0

  return (
    <div className="page fill">
      <div className="page-head">
        <div>
          <h1>Cariler</h1>
          <p className="page-sub">
            Şirket ve proje seçin; carileri 4 aşamalı timeline üzerinde takip edin.
          </p>
        </div>
      </div>

      {noCompanies ? (
        <div className="empty-state">
          <div className="empty-emoji">🏢</div>
          <h2>Önce şirket ve proje ekleyin</h2>
          <p>Cariler projelere bağlıdır. "Şirketler" ve "Projeler" menülerinden başlayın.</p>
        </div>
      ) : (
        <>
          <div className="selector-bar">
            <label className="selector">
              Şirket
              <select
                value={companyId ?? ''}
                onChange={(e) => onChangeCompany(e.target.value || null)}
              >
                <option value="">— Şirket seçin —</option>
                {db.companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <span className="selector-arrow">→</span>
            <label className="selector">
              Proje
              <select
                value={projectId ?? ''}
                onChange={(e) => onChangeProject(e.target.value || null)}
                disabled={!companyId}
              >
                <option value="">
                  {companyId ? '— Proje seçin —' : 'Önce şirket seçin'}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {project ? (
            <Board
              project={project}
              store={store}
              onOpenCari={onOpenCari}
              onAddCari={onAddCari}
            />
          ) : (
            <div className="empty-state small">
              <div className="empty-emoji">👤</div>
              <h2>Proje seçilmedi</h2>
              <p>Cari eklemek ve timeline'ı görmek için yukarıdan bir proje seçin.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
