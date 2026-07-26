'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/authz'
import type { TaskPriority, TaskStatus } from '@prisma/client'

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
  await requireAuth()
  const task = await prisma.task.create({ data: clean(input) })
  revalidate()
  return { id: task.id }
}

export async function updateTask(id: string, input: TaskInput) {
  await requireAuth()
  const data = clean(input)
  await prisma.task.update({
    where: { id },
    data: { ...data, completedAt: data.status === 'DONE' ? new Date() : null },
  })
  revalidate()
  return { id }
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
