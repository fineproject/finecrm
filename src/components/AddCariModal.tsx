import { useEffect, useState } from 'react'
import type { Stage } from '../types'
import { STAGES } from '../types'
import type { Store } from '../useStore'

interface Props {
  projectId: string
  store: Store
  onClose: () => void
}

export default function AddCariModal({ projectId, store, onClose }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [infoStatus, setInfoStatus] = useState('')
  const [stage, setStage] = useState<Stage>('eklendi')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    store.addCari(projectId, { firstName, lastName, phone, infoStatus, stage })
    onClose()
  }

  return (
    <div className="drawer-overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Yeni Cari Ekle</h2>
          <button className="icon-btn" onClick={onClose} title="Kapat">
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <div className="grid-2">
            <label>
              Ad *
              <input
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Örn. Mehmet"
                required
              />
            </label>
            <label>
              Soyad *
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Örn. Kaya"
                required
              />
            </label>
            <label>
              Telefon
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Örn. 0532 000 00 00"
              />
            </label>
            <label>
              Verilen Bilgi Durumu
              <input
                value={infoStatus}
                onChange={(e) => setInfoStatus(e.target.value)}
                placeholder="Örn. Broşür verildi"
              />
            </label>
          </div>

          <label>
            Başlangıç Aşaması
            <select value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="btn primary">
              Cariyi Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
