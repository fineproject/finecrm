import type { ReportData } from '@/server/reports'
import { formatCurrency, formatDateTime } from './format'

// ArrayBuffer -> base64 (font gömme için)
function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

// jsPDF için Türkçe destekli fontu public/fonts'tan yükleyip kaydeder
async function registerFont(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  url: string,
  vfs: string,
  style: 'normal' | 'bold',
) {
  const res = await fetch(url)
  const base64 = toBase64(await res.arrayBuffer())
  doc.addFileToVFS(vfs, base64)
  doc.addFont(vfs, 'Liberation', style)
}

const FONT = 'Liberation'
const BRAND: [number, number, number] = [79, 70, 229]

export async function generateReportPdf(data: ReportData) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  await registerFont(doc, '/fonts/LiberationSans-Regular.ttf', 'LiberationSans.ttf', 'normal')
  await registerFont(doc, '/fonts/LiberationSans-Bold.ttf', 'LiberationSans-Bold.ttf', 'bold')
  doc.setFont(FONT, 'normal')

  const marginX = 40

  // Başlık
  doc.setFont(FONT, 'bold').setFontSize(18)
  doc.text('FineCRM — Kapsamlı Rapor', marginX, 46)
  doc.setFont(FONT, 'normal').setFontSize(9).setTextColor(120)
  doc.text(`Oluşturulma: ${formatDateTime(new Date().toISOString())}`, marginX, 62)
  doc.setTextColor(0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextY = () => ((doc as any).lastAutoTable?.finalY ?? 70) + 26

  const section = (title: string, startY: number) => {
    doc.setFont(FONT, 'bold').setFontSize(12).text(title, marginX, startY)
    return startY + 8
  }

  const common = {
    styles: { font: FONT, fontSize: 9, cellPadding: 5 },
    headStyles: { font: FONT, fontStyle: 'bold' as const, fillColor: BRAND, textColor: 255 },
    margin: { left: marginX, right: marginX },
    theme: 'grid' as const,
  }

  // 1) Özet
  let y = section('Genel Özet', 84)
  autoTable(doc, {
    ...common,
    startY: y,
    head: [['Metrik', 'Değer']],
    body: [
      ['Şirket', String(data.totals.companies)],
      ['Proje', String(data.totals.projects)],
      ['Aktif Proje', String(data.totals.activeProjects)],
      ['Tamamlanan Proje', String(data.totals.completedProjects)],
      ['Cari', String(data.totals.cariler)],
      ['Toplam Bütçe', formatCurrency(data.totals.totalBudget)],
    ],
  })

  // 2) Proje durum dağılımı
  y = section('Proje Durum Dağılımı', nextY())
  autoTable(doc, {
    ...common,
    startY: y,
    head: [['Durum', 'Adet']],
    body: data.projectStatus.map((s) => [s.label, String(s.count)]),
  })

  // 3) Cari aşama dağılımı
  y = section('Cari Aşama Dağılımı', nextY())
  autoTable(doc, {
    ...common,
    startY: y,
    head: [['Aşama', 'Adet']],
    body: data.cariStage.map((s) => [s.label, String(s.count)]),
  })

  // 4) Satış hunisi
  y = section('Cari Satış Hunisi', nextY())
  autoTable(doc, {
    ...common,
    startY: y,
    head: [['Metrik', 'Günlük', 'Haftalık', 'Aylık']],
    body: data.funnel.map((f) => [f.label, String(f.day), String(f.week), String(f.month)]),
  })

  // 5) Şirket bazında özet
  y = section('Şirket Bazında Özet', nextY())
  autoTable(doc, {
    ...common,
    startY: y,
    head: [['Şirket', 'Proje', 'Cari', 'Bütçe']],
    body: data.companies.map((c) => [
      c.name,
      String(c.projectCount),
      String(c.cariCount),
      formatCurrency(c.budget),
    ]),
  })

  // 6) Son işlemler
  y = section('Son İşlemler', nextY())
  autoTable(doc, {
    ...common,
    startY: y,
    head: [['Tarih', 'İşlem', 'Açıklama', 'İlgili']],
    columnStyles: { 2: { cellWidth: 200 } },
    body: data.recent.map((r) => [formatDateTime(r.createdAt), r.type, r.message, r.context]),
  })

  // Sayfa numaraları
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont(FONT, 'normal').setFontSize(8).setTextColor(150)
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      doc.internal.pageSize.getWidth() - marginX,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'right' },
    )
  }

  doc.save(`finecrm-rapor-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// UTF-8 BOM + ';' ayraç => Türkçe Excel uyumlu CSV
export function generateReportCsv(data: ReportData) {
  const rows: string[][] = []
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const push = (arr: (string | number)[]) => rows.push(arr.map(cell))

  push(['FineCRM Kapsamlı Rapor'])
  push(['Oluşturulma', formatDateTime(new Date().toISOString())])
  push([])
  push(['GENEL ÖZET'])
  push(['Şirket', data.totals.companies])
  push(['Proje', data.totals.projects])
  push(['Aktif Proje', data.totals.activeProjects])
  push(['Tamamlanan Proje', data.totals.completedProjects])
  push(['Cari', data.totals.cariler])
  push(['Toplam Bütçe', data.totals.totalBudget])
  push([])
  push(['SATIŞ HUNİSİ', 'Günlük', 'Haftalık', 'Aylık'])
  data.funnel.forEach((f) => push([f.label, f.day, f.week, f.month]))
  push([])
  push(['ŞİRKET BAZINDA ÖZET', 'Proje', 'Cari', 'Bütçe'])
  data.companies.forEach((c) => push([c.name, c.projectCount, c.cariCount, c.budget]))

  const csv = '﻿' + rows.map((r) => r.join(';')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finecrm-rapor-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
