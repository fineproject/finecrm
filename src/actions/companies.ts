'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity'
import { requireRole } from '@/lib/authz'

export interface CompanyInput {
  name: string
  taxNumber?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

function clean(input: CompanyInput) {
  const name = input.name?.trim()
  if (!name) throw new Error('Şirket adı zorunludur.')
  return {
    name,
    taxNumber: input.taxNumber?.trim() || null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
  }
}

function revalidate() {
  revalidatePath('/companies')
  revalidatePath('/')
}

export async function createCompany(input: CompanyInput) {
  await requireRole('ADMIN')
  const data = clean(input)
  const company = await prisma.company.create({ data })
  await logActivity({
    type: 'COMPANY_CREATED',
    message: `"${company.name}" şirketi oluşturuldu`,
    companyId: company.id,
  })
  revalidate()
  return { id: company.id }
}

export async function updateCompany(id: string, input: CompanyInput) {
  await requireRole('ADMIN')
  const data = clean(input)
  const company = await prisma.company.update({ where: { id }, data })
  await logActivity({
    type: 'COMPANY_UPDATED',
    message: `"${company.name}" şirketi güncellendi`,
    companyId: company.id,
  })
  revalidate()
  return { id: company.id }
}

export async function deleteCompany(id: string) {
  await requireRole('ADMIN')
  const company = await prisma.company.delete({ where: { id } })
  await logActivity({
    type: 'COMPANY_UPDATED',
    message: `"${company.name}" şirketi silindi`,
  })
  revalidate()
  return { id }
}
