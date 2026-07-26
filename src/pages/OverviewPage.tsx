import { useMemo } from 'react'
import type { Store } from '../useStore'
import type { Page } from '../components/Nav'
import { STAGES, stageMeta } from '../types'
import { formatDateTime } from '../util'

interface Props {
  store: Store
  onNavigate: (page: Page) => void
}

export default function OverviewPage({ store, onNavigate }: Props) {
  const { db } = store

  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of STAGES) map[s.key] = 0
    for (const k of db.cariler) map[k.stage] = (map[k.stage] ?? 0) + 1
    return map
  }, [db.cariler])

  const total = db.cariler.length

  // Son işlemler (tüm cariler genelinde)
  const recent = useMemo(() => {
    const rows = db.cariler.flatMap((k) =>
      k.history.map((h) => ({
        cari: `${k.firstName} ${k.lastName}`,
        message: h.message,
        createdAt: h.createdAt,
      })),
    )
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8)
  }, [db.cariler])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Genel Bakış</h1>
          <p className="page-sub">Şirket, proje ve cari durumunuzun özeti.</p>
        </div>
      </div>

      <div className="stat-grid">
        <button className="stat-card" onClick={() => onNavigate('companies')}>
          <span className="stat-icon">🏢</span>
          <span className="stat-value">{db.companies.length}</span>
          <span className="stat-label">Şirket</span>
        </button>
        <button className="stat-card" onClick={() => onNavigate('projects')}>
          <span className="stat-icon">📁</span>
          <span className="stat-value">{db.projects.length}</span>
          <span className="stat-label">Proje</span>
        </button>
        <button className="stat-card" onClick={() => onNavigate('cari')}>
          <span className="stat-icon">👤</span>
          <span className="stat-value">{total}</span>
          <span className="stat-label">Cari</span>
        </button>
      </div>

      <div className="panel">
        <h3 className="panel-title">Aşama Dağılımı</h3>
        <div className="dist">
          {STAGES.map((s) => {
            const count = stageCounts[s.key]
            const pct = total ? Math.round((count / total) * 100) : 0
            return (
              <div key={s.key} className="dist-row">
                <span className="dist-name">
                  <span className="chip-dot" style={{ background: s.color }} />
                  {s.label}
                </span>
                <div className="dist-bar">
                  <div
                    className="dist-fill"
                    style={{ width: `${pct}%`, background: s.color }}
                  />
                </div>
                <span className="dist-count">
                  {count} <span className="dist-pct">({pct}%)</span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">Son İşlemler</h3>
        {recent.length === 0 ? (
          <p className="hint">Henüz işlem yok.</p>
        ) : (
          <ul className="recent">
            {recent.map((r, i) => (
              <li key={i} className="recent-item">
                <span
                  className="recent-dot"
                  style={{ background: stageMeta(STAGES[0].key).color }}
                />
                <div>
                  <div className="recent-msg">
                    <strong>{r.cari}</strong> — {r.message}
                  </div>
                  <div className="recent-time">{formatDateTime(r.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
