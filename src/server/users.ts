import { prisma } from '@/lib/prisma'
import type { UserRow } from '@/types/dto'

export async function listUsers(): Promise<UserRow[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      accessCompanies: { select: { id: true } },
      accessProjects: { select: { id: true } },
    },
  })
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    accessCompanyIds: u.accessCompanies.map((c) => c.id),
    accessProjectIds: u.accessProjects.map((p) => p.id),
    createdAt: u.createdAt.toISOString(),
  }))
}
