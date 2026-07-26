import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/authz'
import type { Prisma } from '@prisma/client'

export interface Scope {
  all: boolean // ADMIN => tüm veriye erişim
  companyIds: string[]
  projectIds: string[]
}

/**
 * Oturumdaki kullanıcının erişim kapsamını çözer.
 * - ADMIN => { all: true } (filtre yok)
 * - Diğerleri => atanmış şirketler + o şirketlerin projeleri + doğrudan atanmış projeler
 */
export async function getScope(): Promise<Scope> {
  const user = await getSessionUser()
  if (!user) return { all: false, companyIds: [], projectIds: [] }
  if (user.role === 'ADMIN') return { all: true, companyIds: [], projectIds: [] }

  const u = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      accessCompanies: { select: { id: true } },
      accessProjects: { select: { id: true, companyId: true } },
    },
  })
  if (!u) return { all: false, companyIds: [], projectIds: [] }

  const grantedCompanyIds = u.accessCompanies.map((c) => c.id)
  const projectsInCompanies = grantedCompanyIds.length
    ? await prisma.project.findMany({
        where: { companyId: { in: grantedCompanyIds } },
        select: { id: true },
      })
    : []

  const projectIds = Array.from(
    new Set([...u.accessProjects.map((p) => p.id), ...projectsInCompanies.map((p) => p.id)]),
  )
  const companyIds = Array.from(
    new Set([...grantedCompanyIds, ...u.accessProjects.map((p) => p.companyId)]),
  )

  return { all: false, companyIds, projectIds }
}

// ---- Prisma where parçaları ----
export function companyWhere(scope: Scope): Prisma.CompanyWhereInput {
  return scope.all ? {} : { id: { in: scope.companyIds } }
}
export function projectWhere(scope: Scope): Prisma.ProjectWhereInput {
  return scope.all ? {} : { id: { in: scope.projectIds } }
}
export function cariWhere(scope: Scope): Prisma.CariWhereInput {
  return scope.all ? {} : { projectId: { in: scope.projectIds } }
}
export function activityWhere(scope: Scope): Prisma.ActivityLogWhereInput {
  return scope.all
    ? {}
    : { OR: [{ projectId: { in: scope.projectIds } }, { companyId: { in: scope.companyIds } }] }
}
