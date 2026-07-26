'use client'

import { BarChart } from '@mui/x-charts/BarChart'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function ActivityTrendChart({
  data,
}: {
  data: { date: string; count: number }[]
}) {
  const total = data.reduce((s, d) => s + d.count, 0)

  if (total === 0) {
    return (
      <Box sx={{ height: 260, display: 'grid', placeItems: 'center' }}>
        <Typography color="text.secondary">Son 14 günde hareket yok</Typography>
      </Box>
    )
  }

  const labels = data.map((d) => {
    const [, m, day] = d.date.split('-')
    return `${day}.${m}`
  })

  return (
    <BarChart
      height={260}
      xAxis={[{ scaleType: 'band', data: labels }]}
      series={[{ data: data.map((d) => d.count), label: 'Hareket', color: '#4f46e5' }]}
      slotProps={{ legend: { hidden: true } }}
      margin={{ top: 16, right: 16, bottom: 28, left: 32 }}
    />
  )
}
