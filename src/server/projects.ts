import { prisma } from '@/lib/prisma'
import type { Option, ProjectRow } from '@/types/dto'

export async function listProjects(companyId?: string): Promise<ProjectRow[]> {
  const projects = await prisma.project.findMany({
    where: companyId ? { companyId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      company: { select: { name: true } },
      _count: { select: { milestones: true, cariler: true } },
    },
  })

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    companyId: p.companyId,
    companyName: p.company.name,
    status: p.status,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    budget: p.budget ? Number(p.budget) : null,
    milestoneCount: p._count.milestones,
    cariCount: p._count.cariler,
    createdAt: p.createdAt.toISOString(),
  }))
}

export async function projectOptions(companyId?: string): Promise<Option[]> {
  const projects = await prisma.project.findMany({
    where: companyId ? { companyId } : undefined,
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
  return projects.map((p) => ({ id: p.id, label: p.name }))
}
