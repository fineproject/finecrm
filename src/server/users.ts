import { prisma } from '@/lib/prisma'
import type { UserRow } from '@/types/dto'

export async function listUsers(): Promise<UserRow[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }))
}
