// Prisma enum değerlerinin Türkçe etiketleri ve MUI renk eşlemeleri.
// UI'da chip/rozet renkleri ve seçim listeleri buradan beslenir.

import type {
  ProjectStatus,
  MilestoneStatus,
  CariStage,
  CariType,
  ActivityType,
  NotificationStatus,
  UserRole,
  TaskStatus,
  TaskPriority,
} from '@prisma/client'

// Etkileşim tipi ayrı bir DB kolonu değil; ActivityLog.metadata içinde saklanır.
export type InteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE'

type MuiColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

interface Meta {
  label: string
  color: MuiColor
  hex?: string
}

export const PROJECT_STATUS: Record<ProjectStatus, Meta> = {
  PENDING: { label: 'Bekliyor', color: 'default', hex: '#64748b' },
  IN_PROGRESS: { label: 'Devam Ediyor', color: 'info', hex: '#0ea5e9' },
  COMPLETED: { label: 'Tamamlandı', color: 'success', hex: '#10b981' },
  ON_HOLD: { label: 'Beklemede', color: 'warning', hex: '#f59e0b' },
  CANCELLED: { label: 'İptal Edildi', color: 'error', hex: '#ef4444' },
}

export const MILESTONE_STATUS: Record<MilestoneStatus, Meta> = {
  PENDING: { label: 'Bekliyor', color: 'default', hex: '#64748b' },
  IN_PROGRESS: { label: 'Devam Ediyor', color: 'info', hex: '#0ea5e9' },
  COMPLETED: { label: 'Tamamlandı', color: 'success', hex: '#10b981' },
  DELAYED: { label: 'Gecikti', color: 'error', hex: '#ef4444' },
}

export const CARI_STAGE: Record<CariStage, Meta> = {
  ADDED: { label: 'Eklendi', color: 'default', hex: '#64748b' },
  INFO_GIVEN: { label: 'Bilgi Verildi', color: 'info', hex: '#0ea5e9' },
  CALLED_AGAIN: { label: 'Tekrar Arandı', color: 'warning', hex: '#f59e0b' },
  INVITED: { label: 'Davet Edildi', color: 'success', hex: '#10b981' },
}

export const CARI_TYPE: Record<CariType, Meta> = {
  CUSTOMER: { label: 'Müşteri', color: 'primary' },
  STAKEHOLDER: { label: 'Paydaş', color: 'secondary' },
  SUPPLIER: { label: 'Tedarikçi', color: 'info' },
}

export const TASK_STATUS: Record<TaskStatus, Meta> = {
  PENDING: { label: 'Bekliyor', color: 'warning', hex: '#f59e0b' },
  DONE: { label: 'Tamamlandı', color: 'success', hex: '#10b981' },
  CANCELLED: { label: 'İptal', color: 'default', hex: '#64748b' },
}

export const TASK_PRIORITY: Record<TaskPriority, Meta> = {
  LOW: { label: 'Düşük', color: 'default' },
  MEDIUM: { label: 'Orta', color: 'info' },
  HIGH: { label: 'Yüksek', color: 'error' },
}

export const INTERACTION_TYPE: Record<InteractionType, Meta> = {
  CALL: { label: 'Arama', color: 'primary' },
  EMAIL: { label: 'E-posta', color: 'secondary' },
  MEETING: { label: 'Toplantı', color: 'info' },
  NOTE: { label: 'Not', color: 'warning' },
}

export const USER_ROLE: Record<UserRole, Meta> = {
  ADMIN: { label: 'Yönetici', color: 'error' },
  MANAGER: { label: 'Müdür', color: 'warning' },
  MEMBER: { label: 'Üye', color: 'default' },
}

export const NOTIFICATION_STATUS: Record<NotificationStatus, Meta> = {
  PENDING: { label: 'Kuyrukta', color: 'default' },
  SENT: { label: 'Gönderildi', color: 'info' },
  READ: { label: 'Okundu', color: 'success' },
  FAILED: { label: 'Başarısız', color: 'error' },
}

// Timeline noktalarının rengi için işlem tipi → renk eşlemesi
export const ACTIVITY_STYLE: Record<ActivityType, { color: MuiColor; hex: string }> = {
  COMPANY_CREATED: { color: 'primary', hex: '#4f46e5' },
  COMPANY_UPDATED: { color: 'info', hex: '#0ea5e9' },
  PROJECT_CREATED: { color: 'primary', hex: '#4f46e5' },
  PROJECT_UPDATED: { color: 'info', hex: '#0ea5e9' },
  PROJECT_STATUS_CHANGED: { color: 'warning', hex: '#f59e0b' },
  MILESTONE_CREATED: { color: 'primary', hex: '#7c3aed' },
  MILESTONE_UPDATED: { color: 'info', hex: '#0ea5e9' },
  MILESTONE_COMPLETED: { color: 'success', hex: '#10b981' },
  CARI_CREATED: { color: 'primary', hex: '#4f46e5' },
  CARI_UPDATED: { color: 'info', hex: '#0ea5e9' },
  CARI_STAGE_CHANGED: { color: 'success', hex: '#10b981' },
  NOTE_ADDED: { color: 'warning', hex: '#f59e0b' },
}

export const ACTIVITY_TYPE: Record<ActivityType, string> = {
  COMPANY_CREATED: 'Şirket oluşturuldu',
  COMPANY_UPDATED: 'Şirket güncellendi',
  PROJECT_CREATED: 'Proje oluşturuldu',
  PROJECT_UPDATED: 'Proje güncellendi',
  PROJECT_STATUS_CHANGED: 'Proje durumu değişti',
  MILESTONE_CREATED: 'Aşama oluşturuldu',
  MILESTONE_UPDATED: 'Aşama güncellendi',
  MILESTONE_COMPLETED: 'Aşama tamamlandı',
  CARI_CREATED: 'Cari oluşturuldu',
  CARI_UPDATED: 'Cari güncellendi',
  CARI_STAGE_CHANGED: 'Cari aşaması değişti',
  NOTE_ADDED: 'Not eklendi',
}

// <select> gibi bileşenler için yardımcı liste üreticisi
export function toOptions<T extends string>(map: Record<T, Meta>) {
  return (Object.keys(map) as T[]).map((value) => ({ value, label: map[value].label }))
}
