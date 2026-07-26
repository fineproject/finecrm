import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.info('🌱 Seed başlıyor…')

  // Temiz başlangıç (bağımlılık sırasına göre)
  await prisma.notification.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.cari.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.project.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  const admin = await prisma.user.create({
    data: { email: 'admin@finecrm.local', name: 'Sistem Yöneticisi', role: 'ADMIN' },
  })

  // --- Şirketler ---
  const acme = await prisma.company.create({
    data: {
      name: 'Acme İnşaat A.Ş.',
      taxNumber: '1234567890',
      email: 'info@acme.com',
      phone: '0212 000 00 00',
      address: 'İstanbul',
    },
  })
  const nova = await prisma.company.create({
    data: { name: 'Nova Yazılım Ltd.', taxNumber: '9876543210', email: 'hello@nova.dev', phone: '0312 111 11 11' },
  })

  // --- Projeler ---
  const bahcesehir = await prisma.project.create({
    data: {
      companyId: acme.id,
      name: 'Bahçeşehir Konutları',
      description: '240 daireli konut projesi',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-12-31'),
      budget: 25_000_000,
    },
  })
  const plaza = await prisma.project.create({
    data: {
      companyId: acme.id,
      name: 'Merkez Plaza',
      status: 'PENDING',
      startDate: new Date('2026-09-01'),
      budget: 8_500_000,
    },
  })
  const crmApp = await prisma.project.create({
    data: {
      companyId: nova.id,
      name: 'Kurumsal CRM Uygulaması',
      description: 'Next.js tabanlı CRM',
      status: 'COMPLETED',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-03-01'),
      budget: 1_200_000,
    },
  })

  // --- Aşamalar (Milestones) ---
  const m1 = await prisma.milestone.create({
    data: { projectId: bahcesehir.id, title: 'Temel & Kaba İnşaat', status: 'COMPLETED', order: 1, completedAt: new Date('2026-04-01') },
  })
  const m2 = await prisma.milestone.create({
    data: { projectId: bahcesehir.id, title: 'İnce İşler', status: 'IN_PROGRESS', order: 2, dueDate: new Date('2026-09-30') },
  })
  await prisma.milestone.create({
    data: { projectId: bahcesehir.id, title: 'Teslim & İskan', status: 'PENDING', order: 3, dueDate: new Date('2026-12-15') },
  })

  // --- Cariler ---
  const cariler = await Promise.all([
    prisma.cari.create({
      data: {
        projectId: bahcesehir.id,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        phone: '0532 000 00 01',
        email: 'ahmet@example.com',
        type: 'CUSTOMER',
        stage: 'INFO_GIVEN',
        infoStatus: 'Broşür gönderildi',
        currentMilestoneId: m2.id,
      },
    }),
    prisma.cari.create({
      data: {
        projectId: bahcesehir.id,
        firstName: 'Ayşe',
        lastName: 'Demir',
        phone: '0533 000 00 02',
        type: 'CUSTOMER',
        stage: 'INVITED',
        infoStatus: 'Satış ofisine davet edildi',
        currentMilestoneId: m1.id,
      },
    }),
    prisma.cari.create({
      data: {
        projectId: plaza.id,
        firstName: 'Mehmet',
        lastName: 'Kaya',
        phone: '0534 000 00 03',
        type: 'STAKEHOLDER',
        stage: 'ADDED',
      },
    }),
    prisma.cari.create({
      data: {
        projectId: crmApp.id,
        firstName: 'Zeynep',
        lastName: 'Şahin',
        email: 'zeynep@nova.dev',
        type: 'STAKEHOLDER',
        stage: 'CALLED_AGAIN',
        infoStatus: 'Demo planlandı',
      },
    }),
  ])

  // --- Örnek işlem günlükleri ---
  await prisma.activityLog.createMany({
    data: [
      { type: 'PROJECT_CREATED', message: `"${bahcesehir.name}" projesi oluşturuldu`, actorId: admin.id, companyId: acme.id, projectId: bahcesehir.id },
      { type: 'MILESTONE_COMPLETED', message: `"${m1.title}" aşaması tamamlandı`, projectId: bahcesehir.id, milestoneId: m1.id },
      { type: 'CARI_STAGE_CHANGED', message: `${cariler[1].firstName} ${cariler[1].lastName} aşaması "Bilgi Verildi" → "Davet Edildi" olarak güncellendi`, projectId: bahcesehir.id, cariId: cariler[1].id, metadata: { from: 'INFO_GIVEN', to: 'INVITED' } },
    ],
  })

  // --- Örnek bildirimler ---
  await prisma.notification.createMany({
    data: [
      { channel: 'EMAIL', status: 'SENT', title: 'Aşama tamamlandı', body: `"${m1.title}" aşaması tamamlandı`, recipientCariId: cariler[0].id, sentAt: new Date() },
      { channel: 'IN_APP', status: 'PENDING', title: 'Aşama güncellemesi', body: `${cariler[1].firstName} ${cariler[1].lastName} davet edildi`, recipientCariId: cariler[1].id },
    ],
  })

  console.info('✅ Seed tamamlandı.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
