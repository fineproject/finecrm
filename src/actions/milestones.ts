'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { MILESTONE_STATUS } from '@/lib/labels'
import type { MilestoneStatus } from '@prisma/client'

export interface MilestoneInput {
  projectId: string
  title: string
  description?: string | null
  status?: MilestoneStatus
  order?: number
  dueDate?: string | null
}

function clean(input: MilestoneInput) {
  const title = input.title?.trim()
  if (!title) throw new Error('Aşama başlığı zorunludur.')
  if (!input.projectId) throw new Error('Proje seçilmelidir.')
  return {
    projectId: input.projectId,
    title,
    description: input.description?.trim() || null,
    status: input.status ?? 'PENDING',
    order: input.order ?? 0,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
  }
}

function revalidate(projectId?: string) {
  revalidatePath('/projects')
  revalidatePath('/reports')
  revalidatePath('/')
  if (projectId) revalidatePath(`/projects/${projectId}`)
}

export async function createMilestone(input: MilestoneInput) {
  const data = clean(input)
  const milestone = await prisma.milestone.create({ data })
  await logActivity({
    type: 'MILESTONE_CREATED',
    message: `"${milestone.title}" aşaması oluşturuldu`,
    projectId: milestone.projectId,
    milestoneId: milestone.id,
  })
  revalidate(milestone.projectId)
  return { id: milestone.id }
}

export async function updateMilestone(id: string, input: MilestoneInput) {
  const existing = await prisma.milestone.findUniqueOrThrow({ where: { id } })
  const data = clean(input)
  const completing = data.status === 'COMPLETED' && existing.status !== 'COMPLETED'

  const milestone = await prisma.milestone.update({
    where: { id },
    data: { ...data, completedAt: completing ? new Date() : existing.completedAt },
  })

  if (completing) {
    await notifyMilestoneCompleted(milestone.id)
  } else {
    await logActivity({
      type: 'MILESTONE_UPDATED',
      message: `"${milestone.title}" aşaması güncellendi (${MILESTONE_STATUS[milestone.status].label})`,
      projectId: milestone.projectId,
      milestoneId: milestone.id,
    })
  }

  revalidate(milestone.projectId)
  return { id: milestone.id }
}

export async function completeMilestone(id: string) {
  const existing = await prisma.milestone.findUniqueOrThrow({ where: { id } })
  if (existing.status === 'COMPLETED') return { id }
  await prisma.milestone.update({
    where: { id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  })
  await notifyMilestoneCompleted(id)
  revalidate(existing.projectId)
  return { id }
}

export async function deleteMilestone(id: string) {
  const milestone = await prisma.milestone.delete({ where: { id } })
  await logActivity({
    type: 'MILESTONE_UPDATED',
    message: `"${milestone.title}" aşaması silindi`,
    projectId: milestone.projectId,
  })
  revalidate(milestone.projectId)
  return { id }
}

// Aşama tamamlandığında audit-log + projedeki carilere e-posta (simülasyon)
async function notifyMilestoneCompleted(milestoneId: string) {
  const milestone = await prisma.milestone.findUniqueOrThrow({
    where: { id: milestoneId },
    include: { project: { include: { cariler: { select: { id: true } } } } },
  })
  const message = `"${milestone.title}" aşaması tamamlandı`

  await logActivity({
    type: 'MILESTONE_COMPLETED',
    message,
    projectId: milestone.projectId,
    milestoneId: milestone.id,
    notify: milestone.project.cariler.map((c) => ({
      channel: 'EMAIL' as const,
      title: 'Aşama tamamlandı',
      body: `${message} — Proje: ${milestone.project.name}`,
      recipientCariId: c.id,
    })),
  })
}
