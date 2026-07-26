'use server'

import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import type { UserRole } from '@prisma/client'

export interface UserInput {
  email: string
  name: string
  role: UserRole
  password?: string | null
}

// Kullanıcı yönetimi yalnızca ADMIN rolüne açıktır
async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Bu işlem için yönetici yetkisi gerekir.')
  }
  return session
}

function revalidate() {
  revalidatePath('/users')
}

export async function createUser(input: UserInput) {
  await requireAdmin()
  const email = input.email?.trim().toLowerCase()
  const name = input.name?.trim()
  if (!email || !name) throw new Error('E-posta ve ad zorunludur.')
  if (!input.password || input.password.length < 6) {
    throw new Error('Şifre en az 6 karakter olmalıdır.')
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new Error('Bu e-posta ile bir kullanıcı zaten var.')

  const passwordHash = await bcrypt.hash(input.password, 10)
  const user = await prisma.user.create({
    data: { email, name, role: input.role, passwordHash },
  })
  revalidate()
  return { id: user.id }
}

export async function updateUser(id: string, input: UserInput) {
  await requireAdmin()
  const name = input.name?.trim()
  if (!name) throw new Error('Ad zorunludur.')

  const data: {
    name: string
    role: UserRole
    passwordHash?: string
  } = { name, role: input.role }

  if (input.password) {
    if (input.password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır.')
    data.passwordHash = await bcrypt.hash(input.password, 10)
  }

  await prisma.user.update({ where: { id }, data })
  revalidate()
  return { id }
}

export async function deleteUser(id: string) {
  const session = await requireAdmin()
  if (session.user?.id === id) {
    throw new Error('Kendi hesabınızı silemezsiniz.')
  }
  await prisma.user.delete({ where: { id } })
  revalidate()
  return { id }
}
