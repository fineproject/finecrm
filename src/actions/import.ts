'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/authz'
import { logActivity } from '@/lib/activity'

export interface ImportCariRow {
  firstName: string
  lastName: string
  phone?: string
  email?: string
  infoStatus?: string
}

/** Seçilen projeye CSV'den toplu cari ekler. */
export async function bulkCreateCariler(projectId: string, rows: ImportCariRow[]) {
  await requireAuth()
  if (!projectId) throw new Error('Proje seçilmelidir.')

  const valid = rows
    .map((r) => ({
      firstName: (r.firstName ?? '').trim(),
      lastName: (r.lastName ?? '').trim(),
      phone: (r.phone ?? '').trim() || null,
      email: (r.email ?? '').trim() || null,
      infoStatus: (r.infoStatus ?? '').trim() || null,
      projectId,
      stage: 'ADDED' as const,
    }))
    .filter((r) => r.firstName && r.lastName)

  if (valid.length === 0) throw new Error('İçe aktarılacak geçerli satır bulunamadı (ad/soyad zorunlu).')

  const result = await prisma.cari.createMany({ data: valid })

  await logActivity({
    type: 'CARI_CREATED',
    message: `CSV içe aktarım: ${result.count} cari eklendi`,
    projectId,
  })

  revalidatePath('/cariler')
  revalidatePath('/')
  return { count: result.count }
}
