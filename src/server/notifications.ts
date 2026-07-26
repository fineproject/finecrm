import { prisma } from '@/lib/prisma'
import type { NotificationRow } from '@/types/dto'

export async function listNotifications(): Promise<NotificationRow[]> {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      recipientUser: { select: { name: true } },
      recipientCari: { select: { firstName: true, lastName: true } },
    },
  })

  return notifications.map((n) => ({
    id: n.id,
    channel: n.channel,
    status: n.status,
    title: n.title,
    body: n.body,
    recipientName:
      n.recipientUser?.name ??
      (n.recipientCari ? `${n.recipientCari.firstName} ${n.recipientCari.lastName}` : null),
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
  }))
}

export async function unreadCount(): Promise<number> {
  return prisma.notification.count({ where: { status: { in: ['PENDING', 'SENT'] } } })
}
