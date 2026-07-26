'use client'

import * as React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { ACTIVITY_TYPE } from '@/lib/labels'
import { formatDateTime } from '@/lib/format'
import type { ActivityRow } from '@/types/dto'
import type { ActivityType } from '@prisma/client'

type Period = 'all' | 'day' | 'week' | 'month'

const PERIODS: { value: Period; label: string; days?: number }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'day', label: 'Günlük', days: 1 },
  { value: 'week', label: 'Haftalık', days: 7 },
  { value: 'month', label: 'Aylık', days: 30 },
]

function cutoff(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.getTime()
}

export default function ReportsClient({ rows }: { rows: ActivityRow[] }) {
  const [type, setType] = React.useState<ActivityType | ''>('')
  const [period, setPeriod] = React.useState<Period>('all')

  const withinPeriod = React.useCallback(
    (iso: string, p: Period) => {
      const meta = PERIODS.find((x) => x.value === p)
      if (!meta?.days) return true
      return new Date(iso).getTime() >= cutoff(meta.days)
    },
    [],
  )

  const filtered = rows.filter(
    (r) => (!type || r.type === type) && withinPeriod(r.createdAt, period),
  )

  const summary = PERIODS.filter((p) => p.days).map((p) => ({
    label: p.label,
    count: rows.filter((r) => withinPeriod(r.createdAt, p.value)).length,
  }))

  const columns: GridColDef<ActivityRow>[] = [
    { field: 'createdAt', headerName: 'Tarih', width: 160, valueFormatter: (v: string) => formatDateTime(v) },
    {
      field: 'type',
      headerName: 'İşlem',
      width: 200,
      renderCell: (p) => <Chip label={ACTIVITY_TYPE[p.value as ActivityType]} size="small" variant="outlined" />,
    },
    { field: 'message', headerName: 'Açıklama', flex: 1.6, minWidth: 240 },
    {
      field: 'context',
      headerName: 'İlgili',
      flex: 1,
      minWidth: 150,
      valueGetter: (_v, row) => row.projectName ?? row.companyName ?? row.cariName ?? '—',
    },
  ]

  return (
    <>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        İşlem Geçmişi
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent>
              <Typography variant="h4" fontWeight={800}>{s.count}</Typography>
              <Typography variant="body2" color="text.secondary">
                {s.label} hareket
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="İşlem tipi"
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType | '')}
          sx={{ minWidth: 240 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {(Object.keys(ACTIVITY_TYPE) as ActivityType[]).map((t) => (
            <MenuItem key={t} value={t}>{ACTIVITY_TYPE[t]}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Dönem"
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          sx={{ minWidth: 180 }}
        >
          {PERIODS.map((p) => (
            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Card sx={{ height: 560 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
          pageSizeOptions={[15, 30, 50]}
          sx={{ border: 0 }}
        />
      </Card>
    </>
  )
}
