'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function markNotificationRead(id: string) {
  await prisma.notification.update({
    where: { id },
    data: { status: 'READ', readAt: new Date() },
  })
  revalidatePath('/notifications')
  revalidatePath('/')
  return { id }
}

export async function markAllNotificationsRead() {
  await prisma.notification.updateMany({
    where: { status: { in: ['PENDING', 'SENT'] } },
    data: { status: 'READ', readAt: new Date() },
  })
  revalidatePath('/notifications')
  revalidatePath('/')
  return { ok: true }
}
