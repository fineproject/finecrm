import type { Database } from '../types'

export type Page = 'overview' | 'companies' | 'projects' | 'cari'

interface Props {
  active: Page
  onNavigate: (page: Page) => void
  db: Database
}

const ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'overview', label: 'Genel Bakış', icon: '📊' },
  { key: 'companies', label: 'Şirketler', icon: '🏢' },
  { key: 'projects', label: 'Projeler', icon: '📁' },
  { key: 'cari', label: 'Cariler', icon: '👤' },
]

export default function Nav({ active, onNavigate, db }: Props) {
  const counts: Record<Page, number | null> = {
    overview: null,
    companies: db.companies.length,
    projects: db.projects.length,
    cari: db.cariler.length,
  }

  return (
    <nav className="nav">
      <div className="brand">
        <span className="brand-logo">◆</span>
        <div>
          <div className="brand-name">FineCRM</div>
          <div className="brand-sub">Satış & Rehber Paneli</div>
        </div>
      </div>

      <ul className="nav-list">
        {ITEMS.map((item) => (
          <li key={item.key}>
            <button
              className={`nav-item ${active === item.key ? 'active' : ''}`}
              onClick={() => onNavigate(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {counts[item.key] !== null && (
                <span className="count-pill sm">{counts[item.key]}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-footer">
        <div className="nav-foot-stat">
          <b>{db.companies.length}</b> şirket
        </div>
        <div className="nav-foot-stat">
          <b>{db.projects.length}</b> proje
        </div>
        <div className="nav-foot-stat">
          <b>{db.cariler.length}</b> cari
        </div>
      </div>
    </nav>
  )
}
