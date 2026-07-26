'use client'

import { PieChart } from '@mui/x-charts/PieChart'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface PieDatum {
  label: string
  value: number
  color: string
}

export default function ProjectStatusChart({ data }: { data: PieDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <Box sx={{ height: 260, display: 'grid', placeItems: 'center' }}>
        <Typography color="text.secondary">Gösterilecek veri yok</Typography>
      </Box>
    )
  }

  return (
    <PieChart
      height={260}
      series={[
        {
          data: data.map((d, i) => ({ id: i, value: d.value, label: d.label, color: d.color })),
          innerRadius: 55,
          paddingAngle: 2,
          cornerRadius: 4,
          highlightScope: { faded: 'global', highlighted: 'item' },
        },
      ]}
      slotProps={{
        legend: {
          direction: 'row',
          position: { vertical: 'bottom', horizontal: 'middle' },
          padding: 0,
        },
      }}
    />
  )
}
