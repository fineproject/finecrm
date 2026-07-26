// FineCRM veri modelleri

// Timeline aşamaları — cari eklendikten sonra tamamlanması beklenen 4 adım
export type Stage = 'eklendi' | 'bilgi_verildi' | 'tekrar_arandi' | 'davet_edildi'

export interface StageMeta {
  key: Stage
  label: string
  description: string
  color: string
}

// Bir carinin geçebileceği aşamalar (sıralı timeline)
export const STAGES: StageMeta[] = [
  {
    key: 'eklendi',
    label: 'Eklendi',
    description: 'Yeni kayıt, henüz iletişime geçilmedi',
    color: '#64748b',
  },
  {
    key: 'bilgi_verildi',
    label: 'Bilgi Verildi',
    description: 'Cari bilgilendirildi',
    color: '#0ea5e9',
  },
  {
    key: 'tekrar_arandi',
    label: 'Tekrar Arandı',
    description: 'İkinci kez iletişime geçildi',
    color: '#f59e0b',
  },
  {
    key: 'davet_edildi',
    label: 'Davet Edildi',
    description: 'Sürecin son adımı — davet tamamlandı',
    color: '#10b981',
  },
]

export function stageMeta(stage: Stage): StageMeta {
  return STAGES.find((s) => s.key === stage) ?? STAGES[0]
}

export function stageIndex(stage: Stage): number {
  return STAGES.findIndex((s) => s.key === stage)
}

export interface Company {
  id: string
  name: string
  createdAt: string
}

export interface Project {
  id: string
  companyId: string
  name: string
  createdAt: string
}

export type HistoryType = 'created' | 'stage_change' | 'info_update' | 'note' | 'edit'

// Her cari için işlem geçmişi kaydı
export interface HistoryEntry {
  id: string
  type: HistoryType
  message: string
  fromStage?: Stage
  toStage?: Stage
  createdAt: string
}

export interface Cari {
  id: string
  projectId: string
  firstName: string
  lastName: string
  phone: string
  infoStatus: string // verilen bilgi durumu
  stage: Stage
  createdAt: string
  updatedAt: string
  history: HistoryEntry[]
}

export interface Database {
  companies: Company[]
  projects: Project[]
  cariler: Cari[]
}
