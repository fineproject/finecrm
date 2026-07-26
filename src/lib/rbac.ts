import type { UserRole } from '@prisma/client'

// Rol hiyerarşisi — büyük sayı = daha fazla yetki
export const ROLE_RANK: Record<UserRole, number> = {
  MEMBER: 1,
  MANAGER: 2,
  ADMIN: 3,
}

/** role, min rolüne eşit veya daha yetkili mi? */
export function hasRole(role: UserRole | undefined | null, min: UserRole): boolean {
  if (!role) return false
  return ROLE_RANK[role] >= ROLE_RANK[min]
}
