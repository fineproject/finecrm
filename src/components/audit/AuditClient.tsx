'use client'

import * as React from 'react'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import { DataGrid, GridToolbar, type GridColDef } from '@mui/x-data-grid'
import PageHeader from '@/components/common/PageHeader'
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

export default function AuditClient({ rows }: { rows: ActivityRow[] }) {
  const [type, setType] = React.useState<ActivityType | ''>('')
  const [period, setPeriod] = React.useState<Period>('all')

  const filtered = rows.filter((r) => {
    if (type && r.type !== type) return false
    const meta = PERIODS.find((p) => p.value === period)
    if (meta?.days) {
      const cut = new Date()
      cut.setDate(cut.getDate() - meta.days)
      if (new Date(r.createdAt).getTime() < cut.getTime()) return false
    }
    return true
  })

  const columns: GridColDef<ActivityRow>[] = [
    { field: 'createdAt', headerName: 'Tarih', width: 160, valueFormatter: (v: string) => formatDateTime(v) },
    { field: 'actorName', headerName: 'Kullanıcı', width: 150, valueGetter: (v) => v || 'Sistem' },
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
      <PageHeader title="Denetim (Audit)" subtitle="Tüm sistem hareketleri; kim, ne zaman, ne yaptı" />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField select size="small" label="İşlem tipi" value={type} onChange={(e) => setType(e.target.value as ActivityType | '')} sx={{ minWidth: 240 }}>
          <MenuItem value="">Tümü</MenuItem>
          {(Object.keys(ACTIVITY_TYPE) as ActivityType[]).map((t) => (
            <MenuItem key={t} value={t}>{ACTIVITY_TYPE[t]}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Dönem" value={period} onChange={(e) => setPeriod(e.target.value as Period)} sx={{ minWidth: 180 }}>
          {PERIODS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
        </TextField>
      </Stack>

      <Card sx={{ height: 620 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, printOptions: { disableToolbarButton: true } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          pageSizeOptions={[20, 50, 100]}
          sx={{ border: 0 }}
        />
      </Card>
    </>
  )
}
