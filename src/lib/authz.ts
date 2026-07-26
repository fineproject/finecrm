import { auth } from '@/auth'
import { hasRole } from './rbac'
import type { UserRole } from '@prisma/client'

/** Oturumdaki kullanıcıyı döndürür (yoksa null) */
export async function getSessionUser() {
  const session = await auth()
  return session?.user ?? null
}

/** Giriş yapılmış olmasını zorunlu kılar */
export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) throw new Error('Bu işlem için giriş yapmalısınız.')
  return user
}

/** En az `min` rolünü zorunlu kılar (server action guard) */
export async function requireRole(min: UserRole) {
  const user = await requireAuth()
  if (!hasRole(user.role, min)) {
    throw new Error('Bu işlem için yetkiniz yok.')
  }
  return user
}
