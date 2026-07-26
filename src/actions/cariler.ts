'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { requireRole } from '@/lib/authz'
import { CARI_STAGE, INTERACTION_TYPE, type InteractionType } from '@/lib/labels'
import type { CariStage, CariType } from '@prisma/client'

export interface CariInput {
  projectId: string
  firstName: string
  lastName: string
  phone?: string | null
  email?: string | null
  type?: CariType
  stage?: CariStage
  infoStatus?: string | null
  currentMilestoneId?: string | null
}

function clean(input: CariInput) {
  const firstName = input.firstName?.trim()
  const lastName = input.lastName?.trim()
  if (!firstName || !lastName) throw new Error('Ad ve soyad zorunludur.')
  if (!input.projectId) throw new Error('Proje seçilmelidir.')
  return {
    projectId: input.projectId,
    firstName,
    lastName,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    type: input.type ?? 'CUSTOMER',
    stage: input.stage ?? 'ADDED',
    infoStatus: input.infoStatus?.trim() || null,
    currentMilestoneId: input.currentMilestoneId || null,
  }
}

function revalidate() {
  revalidatePath('/cariler')
  revalidatePath('/')
  revalidatePath('/reports')
}

export async function createCari(input: CariInput) {
  const data = clean(input)
  const cari = await prisma.cari.create({ data })
  await logActivity({
    type: 'CARI_CREATED',
    message: `${cari.firstName} ${cari.lastName} carisi eklendi (${CARI_STAGE[cari.stage].label})`,
    projectId: cari.projectId,
    cariId: cari.id,
  })
  revalidate()
  return { id: cari.id }
}

export async function updateCari(id: string, input: CariInput) {
  const existing = await prisma.cari.findUniqueOrThrow({ where: { id } })
  const data = clean(input)
  const cari = await prisma.cari.update({ where: { id }, data })

  await logActivity({
    type: 'CARI_UPDATED',
    message: `${cari.firstName} ${cari.lastName} carisi güncellendi`,
    projectId: cari.projectId,
    cariId: cari.id,
  })

  if (existing.stage !== cari.stage) {
    await notifyStageChange(cari.id, existing.stage, cari.stage)
  }

  revalidate()
  return { id: cari.id }
}

export async function setCariStage(id: string, stage: CariStage) {
  const existing = await prisma.cari.findUniqueOrThrow({ where: { id } })
  if (existing.stage === stage) return { id }
  await prisma.cari.update({ where: { id }, data: { stage } })
  await notifyStageChange(id, existing.stage, stage)
  revalidate()
  return { id }
}

export async function addCariNote(
  cariId: string,
  note: string,
  interaction: InteractionType = 'NOTE',
) {
  const text = note.trim()
  if (!text) throw new Error('Not boş olamaz.')
  const cari = await prisma.cari.findUniqueOrThrow({ where: { id: cariId } })
  await logActivity({
    type: 'NOTE_ADDED',
    message: `[${INTERACTION_TYPE[interaction].label}] ${text}`,
    metadata: { interaction },
    projectId: cari.projectId,
    cariId: cari.id,
  })
  revalidatePath(`/cariler/${cariId}`)
  revalidatePath('/reports')
  revalidatePath('/')
  return { ok: true }
}

export async function deleteCari(id: string) {
  await requireRole('MANAGER')
  const cari = await prisma.cari.delete({ where: { id } })
  await logActivity({
    type: 'CARI_UPDATED',
    message: `${cari.firstName} ${cari.lastName} carisi silindi`,
    projectId: cari.projectId,
  })
  revalidate()
  return { id }
}

// Aşama değişiminde audit-log + cariye e-posta (simülasyon) bildirimi
async function notifyStageChange(cariId: string, from: CariStage, to: CariStage) {
  const cari = await prisma.cari.findUniqueOrThrow({ where: { id: cariId } })
  const message = `${cari.firstName} ${cari.lastName} aşaması "${CARI_STAGE[from].label}" → "${CARI_STAGE[to].label}" olarak güncellendi`

  await logActivity({
    type: 'CARI_STAGE_CHANGED',
    message,
    projectId: cari.projectId,
    cariId: cari.id,
    metadata: { from, to },
    notify: [
      {
        channel: 'EMAIL',
        title: 'Aşama güncellemesi',
        body: message,
        recipientCariId: cari.id,
      },
    ],
  })
}
