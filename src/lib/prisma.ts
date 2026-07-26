import { PrismaClient } from '@prisma/client'

// Next.js dev modunda hot-reload sırasında birden fazla PrismaClient
// örneği oluşmasını engellemek için global singleton kullanılır.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
