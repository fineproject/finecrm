import { useEffect, useState } from 'react'
import type { Cari } from '../types'
import { STAGES, stageIndex, stageMeta } from '../types'
import type { Store } from '../useStore'
import { formatDateTime, initials } from '../util'

interface Props {
  cari: Cari
  store: Store
  onClose: () => void
}

export default function CariDetail({ cari, store, onClose }: Props) {
  const [firstName, setFirstName] = useState(cari.firstName)
  const [lastName, setLastName] = useState(cari.lastName)
  const [phone, setPhone] = useState(cari.phone)
  const [infoStatus, setInfoStatus] = useState(cari.infoStatus)
  const [note, setNote] = useState('')

  // Farklı bir cari seçilirse formu yenile
  useEffect(() => {
    setFirstName(cari.firstName)
    setLastName(cari.lastName)
    setPhone(cari.phone)
    setInfoStatus(cari.infoStatus)
    setNote('')
  }, [cari.id, cari.firstName, cari.lastName, cari.phone, cari.infoStatus])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const meta = stageMeta(cari.stage)
  const curIdx = stageIndex(cari.stage)

  function saveDetails(e: React.FormEvent) {
    e.preventDefault()
    store.updateCariDetails(cari.id, { firstName, lastName, phone, infoStatus })
  }

  function submitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    store.addNote(cari.id, note)
    setNote('')
  }

  const history = [...cari.history].reverse()

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div className="drawer-title">
            <span className="avatar" style={{ background: meta.color }}>
              {initials(cari.firstName, cari.lastName)}
            </span>
            <div>
              <h2>
                {cari.firstName} {cari.lastName}
              </h2>
              <span className="badge" style={{ background: meta.color }}>
                {meta.label}
              </span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {/* Aşama timeline */}
          <div className="detail-block">
            <h3>Timeline Aşaması</h3>
            <div className="timeline">
              {STAGES.map((s, i) => (
                <button
                  key={s.key}
                  className={`timeline-step ${i <= curIdx ? 'done' : ''} ${
                    s.key === cari.stage ? 'current' : ''
                  }`}
                  style={i <= curIdx ? { borderColor: s.color, color: s.color } : undefined}
                  onClick={() => store.setCariStage(cari.id, s.key)}
                  title={s.description}
                >
                  <span className="timeline-dot" style={{ background: i <= curIdx ? s.color : undefined }} />
                  <span className="timeline-label">{s.label}</span>
                </button>
              ))}
            </div>
            <p className="hint">Aşamayı değiştirmek için adımlara tıklayın; her değişiklik geçmişe kaydedilir.</p>
          </div>

          {/* Cari bilgileri düzenleme */}
          <form className="detail-block" onSubmit={saveDetails}>
            <h3>Cari Bilgileri</h3>
            <div className="grid-2">
              <label>
                Ad
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </label>
              <label>
                Soyad
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </label>
              <label>
                Telefon
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label>
                Verilen Bilgi Durumu
                <input value={infoStatus} onChange={(e) => setInfoStatus(e.target.value)} />
              </label>
            </div>
            <button type="submit" className="btn">
              Değişiklikleri Kaydet
            </button>
          </form>

          {/* Not ekle */}
          <form className="detail-block" onSubmit={submitNote}>
            <h3>Not / İşlem Ekle</h3>
            <div className="note-row">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Örn. Telefonla arandı, mesaj bırakıldı..."
              />
              <button type="submit" className="btn">
                Ekle
              </button>
            </div>
          </form>

          {/* İşlem geçmişi */}
          <div className="detail-block">
            <h3>İşlem Geçmişi ({cari.history.length})</h3>
            <ul className="history">
              {history.map((h) => (
                <li key={h.id} className={`history-item type-${h.type}`}>
                  <span className="history-dot" />
                  <div className="history-content">
                    <div className="history-msg">{h.message}</div>
                    <div className="history-time">{formatDateTime(h.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-footer">
            <button
              className="btn danger"
              onClick={() => {
                if (confirm(`"${cari.firstName} ${cari.lastName}" carisi silinsin mi?`)) {
                  store.deleteCari(cari.id)
                  onClose()
                }
              }}
            >
              Cariyi Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
