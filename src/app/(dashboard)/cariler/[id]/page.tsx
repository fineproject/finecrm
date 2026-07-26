import { notFound } from 'next/navigation'
import CariDetailView from '@/components/cariler/CariDetailView'
import { getCariDetail } from '@/server/cariler'

export const dynamic = 'force-dynamic'

export default async function CariDetailPage({ params }: { params: { id: string } }) {
  const cari = await getCariDetail(params.id)
  if (!cari) notFound()
  return <CariDetailView cari={cari} />
}
