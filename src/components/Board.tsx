import { useMemo, useState } from 'react'
import type { Cari, Project, Stage } from '../types'
import { STAGES, stageIndex, stageMeta } from '../types'
import type { Store } from '../useStore'
import { formatDate, initials } from '../util'

interface Props {
  project: Project
  store: Store
  onOpenCari: (id: string) => void
  onAddCari: () => void
}

type StageFilter = Stage | 'all'

export default function Board({ project, store, onOpenCari, onAddCari }: Props) {
  const [filter, setFilter] = useState<StageFilter>('all')
  const [query, setQuery] = useState('')

  const cariler = useMemo(
    () => store.db.cariler.filter((k) => k.projectId === project.id),
    [store.db.cariler, project.id],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return cariler.filter((k) => {
      if (!q) return true
      return (
        `${k.firstName} ${k.lastName}`.toLocaleLowerCase('tr').includes(q) ||
        k.phone.toLocaleLowerCase('tr').includes(q) ||
        k.infoStatus.toLocaleLowerCase('tr').includes(q)
      )
    })
  }, [cariler, query])

  const countByStage = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of STAGES) map[s.key] = 0
    for (const k of cariler) map[k.stage] = (map[k.stage] ?? 0) + 1
    return map
  }, [cariler])

  const visibleStages = filter === 'all' ? STAGES : STAGES.filter((s) => s.key === filter)

  return (
    <div className="board-wrap">
      <div className="board-toolbar">
        <div className="filter-chips">
          <button
            className={`chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tümü <span className="chip-count">{cariler.length}</span>
          </button>
          {STAGES.map((s) => (
            <button
              key={s.key}
              className={`chip ${filter === s.key ? 'active' : ''}`}
              onClick={() => setFilter(s.key)}
              style={filter === s.key ? { background: s.color, borderColor: s.color } : undefined}
            >
              <span className="chip-dot" style={{ background: s.color }} />
              {s.label} <span className="chip-count">{countByStage[s.key]}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-right">
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ara (ad, telefon, bilgi)…"
          />
          <button className="btn primary" onClick={onAddCari}>
            + Yeni Cari
          </button>
        </div>
      </div>

      <div className={`board ${filter !== 'all' ? 'single' : ''}`}>
        {visibleStages.map((s) => {
          const items = filtered.filter((k) => k.stage === s.key)
          return (
            <div key={s.key} className="column">
              <div className="column-head" style={{ borderTopColor: s.color }}>
                <span className="column-title">
                  <span className="column-dot" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="count-pill">{items.length}</span>
              </div>
              <div className="column-body">
                {items.length === 0 && <div className="column-empty">Bu aşamada cari yok</div>}
                {items.map((k) => (
                  <CariCard key={k.id} cari={k} store={store} onOpen={() => onOpenCari(k.id)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CariCard({
  cari,
  store,
  onOpen,
}: {
  cari: Cari
  store: Store
  onOpen: () => void
}) {
  const meta = stageMeta(cari.stage)
  const idx = stageIndex(cari.stage)
  const canForward = idx < STAGES.length - 1
  const canBack = idx > 0

  function move(dir: 1 | -1) {
    const next = STAGES[idx + dir]
    if (next) store.setCariStage(cari.id, next.key)
  }

  return (
    <div className="card" onClick={onOpen}>
      <div className="card-top">
        <span className="avatar sm" style={{ background: meta.color }}>
          {initials(cari.firstName, cari.lastName)}
        </span>
        <div className="card-name">
          <strong>
            {cari.firstName} {cari.lastName}
          </strong>
          {cari.phone && <span className="card-phone">{cari.phone}</span>}
        </div>
      </div>

      {cari.infoStatus && (
        <div className="card-info" title="Verilen bilgi durumu">
          ℹ️ {cari.infoStatus}
        </div>
      )}

      {/* Mini timeline göstergesi */}
      <div className="card-progress">
        {STAGES.map((s, i) => (
          <span
            key={s.key}
            className="prog-seg"
            style={{ background: i <= idx ? s.color : 'var(--track)' }}
          />
        ))}
      </div>

      <div className="card-footer">
        <span className="card-date">{formatDate(cari.createdAt)}</span>
        <div className="card-move" onClick={(e) => e.stopPropagation()}>
          <button
            className="mini-btn"
            disabled={!canBack}
            onClick={() => move(-1)}
            title="Önceki aşama"
          >
            ‹
          </button>
          <button
            className="mini-btn"
            disabled={!canForward}
            onClick={() => move(1)}
            title="Sonraki aşama"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
