import { prisma } from './prisma'
import type { NotificationChannel } from '@prisma/client'

export interface DispatchInput {
  channel?: NotificationChannel
  title: string
  body: string
  recipientUserId?: string | null
  recipientCariId?: string | null
  activityLogId?: string | null
}

const FROM = process.env.NOTIFICATION_FROM ?? 'no-reply@finecrm.local'

/**
 * E-posta gönderimini simüle eder. Gerçek bir SMTP/servis yerine
 * terminale loglar; ileride burası Resend/Nodemailer ile değiştirilebilir.
 * Başarılı olursa true döner.
 */
async function simulateEmail(to: string, subject: string, body: string): Promise<boolean> {
  // Gerçek entegrasyonda try/catch ile hata durumu FAILED işaretlenir.
  // eslint-disable-next-line no-console
  console.info(
    `\n📧 [EMAIL SİMÜLASYON] from=${FROM} to=${to}\n   subject: ${subject}\n   body: ${body}\n`,
  )
  return true
}

/**
 * Bir bildirim kaydı oluşturur ve kanalına göre "iletir".
 * - IN_APP: anında SENT (zil ikonuna düşer)
 * - EMAIL: alıcı e-postası bulunursa simüle edilir, SENT/sentAt işaretlenir
 */
export async function dispatchNotification(input: DispatchInput) {
  const channel: NotificationChannel = input.channel ?? 'IN_APP'

  const notification = await prisma.notification.create({
    data: {
      channel,
      status: 'PENDING',
      title: input.title,
      body: input.body,
      recipientUserId: input.recipientUserId ?? null,
      recipientCariId: input.recipientCariId ?? null,
      activityLogId: input.activityLogId ?? null,
    },
  })

  try {
    if (channel === 'EMAIL') {
      // Alıcı e-postasını bul (user veya cari)
      let to: string | null = null
      if (input.recipientUserId) {
        to = (await prisma.user.findUnique({ where: { id: input.recipientUserId } }))?.email ?? null
      } else if (input.recipientCariId) {
        to = (await prisma.cari.findUnique({ where: { id: input.recipientCariId } }))?.email ?? null
      }
      const ok = to ? await simulateEmail(to, input.title, input.body) : false
      return prisma.notification.update({
        where: { id: notification.id },
        data: ok
          ? { status: 'SENT', sentAt: new Date() }
          : { status: 'FAILED' },
      })
    }

    // IN_APP kanalı: doğrudan iletildi kabul edilir
    return prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'SENT', sentAt: new Date() },
    })
  } catch {
    return prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'FAILED' },
    })
  }
}
