import { prisma } from './prisma'
import { dispatchNotification, type DispatchInput } from './notifications'
import type { ActivityType, Prisma } from '@prisma/client'

export interface LogActivityInput {
  type: ActivityType
  message: string
  metadata?: Prisma.InputJsonValue
  actorId?: string | null
  companyId?: string | null
  projectId?: string | null
  milestoneId?: string | null
  cariId?: string | null
  /** İşlem sonrası tetiklenecek bildirimler (in-app / email) */
  notify?: Omit<DispatchInput, 'activityLogId'>[]
}

/**
 * Merkezî audit-log kaydı oluşturur ve isteğe bağlı bildirimleri tetikler.
 * Tüm CRUD işlemleri bu fonksiyon üzerinden geçmeli ki raporlama ve
 * bildirim altyapısı tutarlı çalışsın.
 */
export async function logActivity(input: LogActivityInput) {
  const log = await prisma.activityLog.create({
    data: {
      type: input.type,
      message: input.message,
      metadata: input.metadata,
      actorId: input.actorId ?? null,
      companyId: input.companyId ?? null,
      projectId: input.projectId ?? null,
      milestoneId: input.milestoneId ?? null,
      cariId: input.cariId ?? null,
    },
  })

  if (input.notify?.length) {
    await Promise.all(
      input.notify.map((n) => dispatchNotification({ ...n, activityLogId: log.id })),
    )
  }

  return log
}
