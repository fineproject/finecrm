import { prisma } from '@/lib/prisma'
import type { CariDetail, CariRow, MilestoneRow, Option } from '@/types/dto'
import type { CariStage } from '@prisma/client'

export async function listCariler(filter?: {
  projectId?: string
  stage?: CariStage
}): Promise<CariRow[]> {
  const cariler = await prisma.cari.findMany({
    where: {
      projectId: filter?.projectId || undefined,
      stage: filter?.stage || undefined,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      project: { select: { name: true, company: { select: { name: true } } } },
      currentMilestone: { select: { id: true, title: true } },
    },
  })

  return cariler.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    fullName: `${c.firstName} ${c.lastName}`,
    phone: c.phone,
    email: c.email,
    type: c.type,
    stage: c.stage,
    infoStatus: c.infoStatus,
    projectId: c.projectId,
    projectName: c.project.name,
    companyName: c.project.company.name,
    currentMilestoneId: c.currentMilestone?.id ?? null,
    currentMilestoneTitle: c.currentMilestone?.title ?? null,
    createdAt: c.createdAt.toISOString(),
  }))
}

// Tek bir cariyi işlem geçmişiyle (timeline) birlikte getirir
export async function getCariDetail(id: string): Promise<CariDetail | null> {
  const c = await prisma.cari.findUnique({
    where: { id },
    include: {
      project: { select: { name: true, company: { select: { name: true } } } },
      currentMilestone: { select: { title: true } },
      activityLogs: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!c) return null

  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    fullName: `${c.firstName} ${c.lastName}`,
    phone: c.phone,
    email: c.email,
    type: c.type,
    stage: c.stage,
    infoStatus: c.infoStatus,
    projectId: c.projectId,
    projectName: c.project.name,
    companyName: c.project.company.name,
    currentMilestoneTitle: c.currentMilestone?.title ?? null,
    createdAt: c.createdAt.toISOString(),
    history: c.activityLogs.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

export async function milestoneOptions(projectId: string): Promise<Option[]> {
  if (!projectId) return []
  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
    select: { id: true, title: true },
  })
  return milestones.map((m) => ({ id: m.id, label: m.title }))
}

// Cari formunda proje seçimine göre aşama listesini beslemek için
// tüm projelerin aşamalarını { projectId: Option[] } olarak döndürür.
export async function milestoneOptionsByProject(): Promise<Record<string, Option[]>> {
  const milestones = await prisma.milestone.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, title: true, projectId: true },
  })
  const map: Record<string, Option[]> = {}
  for (const m of milestones) {
    ;(map[m.projectId] ??= []).push({ id: m.id, label: m.title })
  }
  return map
}

export async function listMilestones(projectId: string): Promise<MilestoneRow[]> {
  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  return milestones.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    status: m.status,
    order: m.order,
    dueDate: m.dueDate?.toISOString() ?? null,
    completedAt: m.completedAt?.toISOString() ?? null,
    projectId: m.projectId,
    createdAt: m.createdAt.toISOString(),
  }))
}
