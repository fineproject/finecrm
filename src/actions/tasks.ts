'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/authz'
import { getScope } from '@/server/access'
import { assignableUsers } from '@/server/tasks'
import { logActivity } from '@/lib/activity'
import type { TaskPriority, TaskStatus } from '@prisma/client'

// Atama yetkisi: assignedUserId, atanabilir kullanıcılar arasında olmalı
async function assertCanAssign(assignedUserId: string | null) {
  if (!assignedUserId) return
  const allowed = await assignableUsers()
  if (!allowed.some((a) => a.id === assignedUserId)) {
    throw new Error('Bu kullanıcıya görev atayamazsınız.')
  }
}

export interface TaskInput {
  title: string
  description?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  dueDate?: string | null
  assignedUserId?: string | null
  cariId?: string | null
  projectId?: string | null
}

function clean(input: TaskInput) {
  const title = input.title?.trim()
  if (!title) throw new Error('Görev başlığı zorunludur.')
  return {
    title,
    description: input.description?.trim() || null,
    priority: input.priority ?? 'MEDIUM',
    status: input.status ?? 'PENDING',
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    assignedUserId: input.assignedUserId || null,
    cariId: input.cariId || null,
    projectId: input.projectId || null,
  }
}

function revalidate() {
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function createTask(input: TaskInput) {
  const user = await requireAuth()
  // Üye yalnızca kendine görev oluşturabilir
  const assignedUserId = user.role === 'MEMBER' ? user.id : input.assignedUserId || null
  await assertCanAssign(assignedUserId)
  const task = await prisma.task.create({ data: clean({ ...input, assignedUserId }) })
  revalidate()
  return { id: task.id }
}

export async function updateTask(id: string, input: TaskInput) {
  const user = await requireAuth()
  const assignedUserId = user.role === 'MEMBER' ? user.id : input.assignedUserId || null
  await assertCanAssign(assignedUserId)
  const data = clean({ ...input, assignedUserId })
  await prisma.task.update({
    where: { id },
    data: { ...data, completedAt: data.status === 'DONE' ? new Date() : null },
  })
  revalidate()
  return { id }
}

export async function addTaskNote(taskId: string, note: string) {
  const user = await requireAuth()
  const text = note.trim()
  if (!text) throw new Error('Not boş olamaz.')

  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } })
  if (user.role !== 'ADMIN') {
    const scope = await getScope()
    const ok =
      task.assignedUserId === user.id ||
      (!!task.projectId && scope.projectIds.includes(task.projectId))
    if (!ok) throw new Error('Bu göreve erişiminiz yok.')
  }

  await logActivity({
    type: 'NOTE_ADDED',
    message: text,
    taskId: task.id,
    projectId: task.projectId ?? undefined,
    cariId: task.cariId ?? undefined,
    actorId: user.id,
  })
  revalidatePath(`/tasks/${taskId}`)
  revalidatePath('/tasks')
  return { ok: true }
}

export async function completeTask(id: string) {
  await requireAuth()
  await prisma.task.update({
    where: { id },
    data: { status: 'DONE', completedAt: new Date() },
  })
  revalidate()
  return { id }
}

export async function reopenTask(id: string) {
  await requireAuth()
  await prisma.task.update({ where: { id }, data: { status: 'PENDING', completedAt: null } })
  revalidate()
  return { id }
}

export async function deleteTask(id: string) {
  await requireAuth()
  await prisma.task.delete({ where: { id } })
  revalidate()
  return { id }
}
