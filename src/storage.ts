import type { Database } from './types'

const STORAGE_KEY = 'finecrm:v1'

const emptyDb: Database = {
  companies: [],
  projects: [],
  cariler: [],
}

// Basit benzersiz kimlik üreteci
export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function loadDb(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedIfEmpty()
    const parsed = JSON.parse(raw) as Partial<Database>
    return {
      companies: parsed.companies ?? [],
      projects: parsed.projects ?? [],
      cariler: parsed.cariler ?? [],
    }
  } catch {
    return { ...emptyDb }
  }
}

export function saveDb(db: Database): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (err) {
    console.error('Veri kaydedilemedi:', err)
  }
}

// İlk açılışta örnek veriyle başlat, böylece panel boş görünmez
function seedIfEmpty(): Database {
  const companyId = uid()
  const projectId = uid()
  const created = nowISO()
  const db: Database = {
    companies: [{ id: companyId, name: 'Örnek Şirket A.Ş.', createdAt: created }],
    projects: [
      { id: projectId, companyId, name: 'Bahçeşehir Konutları', createdAt: created },
    ],
    cariler: [
      {
        id: uid(),
        projectId,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        phone: '0532 000 00 01',
        infoStatus: 'Broşür gönderildi',
        stage: 'bilgi_verildi',
        createdAt: created,
        updatedAt: created,
        history: [
          {
            id: uid(),
            type: 'created',
            message: 'Cari oluşturuldu',
            toStage: 'eklendi',
            createdAt: created,
          },
          {
            id: uid(),
            type: 'stage_change',
            message: 'Aşama "Eklendi" → "Bilgi Verildi" olarak güncellendi',
            fromStage: 'eklendi',
            toStage: 'bilgi_verildi',
            createdAt: created,
          },
        ],
      },
      {
        id: uid(),
        projectId,
        firstName: 'Ayşe',
        lastName: 'Demir',
        phone: '0533 000 00 02',
        infoStatus: 'İlgileniyor',
        stage: 'eklendi',
        createdAt: created,
        updatedAt: created,
        history: [
          {
            id: uid(),
            type: 'created',
            message: 'Cari oluşturuldu',
            toStage: 'eklendi',
            createdAt: created,
          },
        ],
      },
    ],
  }
  saveDb(db)
  return db
}
