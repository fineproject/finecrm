'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { PROJECT_STATUS } from '@/lib/labels'
import type { ProjectStatus } from '@prisma/client'

export interface ProjectInput {
  companyId: string
  name: string
  description?: string | null
  status?: ProjectStatus
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
}

function clean(input: ProjectInput) {
  const name = input.name?.trim()
  if (!name) throw new Error('Proje adı zorunludur.')
  if (!input.companyId) throw new Error('Şirket seçilmelidir.')
  return {
    companyId: input.companyId,
    name,
    description: input.description?.trim() || null,
    status: input.status ?? 'PENDING',
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    budget: input.budget ?? null,
  }
}

function revalidate() {
  revalidatePath('/projects')
  revalidatePath('/')
  revalidatePath('/reports')
}

export async function createProject(input: ProjectInput) {
  const data = clean(input)
  const project = await prisma.project.create({ data })
  await logActivity({
    type: 'PROJECT_CREATED',
    message: `"${project.name}" projesi oluşturuldu`,
    companyId: project.companyId,
    projectId: project.id,
  })
  revalidate()
  return { id: project.id }
}

export async function updateProject(id: string, input: ProjectInput) {
  const existing = await prisma.project.findUniqueOrThrow({ where: { id } })
  const data = clean(input)
  const project = await prisma.project.update({ where: { id }, data })

  await logActivity({
    type: 'PROJECT_UPDATED',
    message: `"${project.name}" projesi güncellendi`,
    companyId: project.companyId,
    projectId: project.id,
  })

  // Durum değişikliği ayrı loglanır ve ilgili carilere bildirim gider
  if (existing.status !== project.status) {
    await notifyStatusChange(project.id, existing.status, project.status)
  }

  revalidate()
  return { id: project.id }
}

export async function setProjectStatus(id: string, status: ProjectStatus) {
  const existing = await prisma.project.findUniqueOrThrow({ where: { id } })
  if (existing.status === status) return { id }
  const project = await prisma.project.update({ where: { id }, data: { status } })
  await notifyStatusChange(project.id, existing.status, status)
  revalidate()
  return { id }
}

export async function deleteProject(id: string) {
  const project = await prisma.project.delete({ where: { id } })
  await logActivity({
    type: 'PROJECT_UPDATED',
    message: `"${project.name}" projesi silindi`,
    companyId: project.companyId,
  })
  revalidate()
  return { id }
}

// Durum değişiminde audit-log + projedeki tüm carilere e-posta (simülasyon) bildirimi
async function notifyStatusChange(
  projectId: string,
  from: ProjectStatus,
  to: ProjectStatus,
) {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { cariler: { select: { id: true } } },
  })
  const message = `"${project.name}" projesi durumu "${PROJECT_STATUS[from].label}" → "${PROJECT_STATUS[to].label}" olarak değişti`

  await logActivity({
    type: 'PROJECT_STATUS_CHANGED',
    message,
    companyId: project.companyId,
    projectId: project.id,
    metadata: { from, to },
    notify: project.cariler.map((c) => ({
      channel: 'EMAIL' as const,
      title: 'Proje durumu güncellendi',
      body: message,
      recipientCariId: c.id,
    })),
  })
}
