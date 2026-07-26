'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { DataGrid, GridActionsCellItem, GridToolbar, type GridColDef } from '@mui/x-data-grid'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LabelChip from '@/components/common/LabelChip'
import ProjectFormDrawer from './ProjectFormDrawer'
import { deleteProject } from '@/actions/projects'
import { PROJECT_STATUS } from '@/lib/labels'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Option, ProjectRow } from '@/types/dto'
import type { ProjectStatus } from '@prisma/client'

export default function ProjectsClient({
  rows,
  companies,
}: {
  rows: ProjectRow[]
  companies: Option[]
}) {
  const router = useRouter()
  const [companyFilter, setCompanyFilter] = React.useState('')
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ProjectRow | null>(null)
  const [toDelete, setToDelete] = React.useState<ProjectRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const refresh = () => router.refresh()
  const filtered = companyFilter ? rows.filter((r) => r.companyId === companyFilter) : rows

  const columns: GridColDef<ProjectRow>[] = [
    { field: 'name', headerName: 'Proje', flex: 1.4, minWidth: 180 },
    { field: 'companyName', headerName: 'Şirket', flex: 1.1, minWidth: 150 },
    {
      field: 'status',
      headerName: 'Durum',
      width: 150,
      renderCell: (params) => {
        const v = params.value as ProjectStatus
        return <LabelChip label={PROJECT_STATUS[v].label} color={PROJECT_STATUS[v].color} />
      },
    },
    { field: 'startDate', headerName: 'Başlangıç', width: 120, valueFormatter: (v: string | null) => formatDate(v) },
    { field: 'endDate', headerName: 'Bitiş', width: 120, valueFormatter: (v: string | null) => formatDate(v) },
    {
      field: 'budget',
      headerName: 'Bütçe',
      width: 130,
      type: 'number',
      valueFormatter: (v: number | null) => formatCurrency(v),
    },
    { field: 'milestoneCount', headerName: 'Aşama', width: 90, type: 'number' },
    { field: 'cariCount', headerName: 'Cari', width: 80, type: 'number' },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditOutlinedIcon />}
          label="Düzenle"
          onClick={() => {
            setEditing(params.row)
            setDrawerOpen(true)
          }}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineIcon />}
          label="Sil"
          onClick={() => setToDelete(params.row)}
        />,
      ],
    },
  ]

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteProject(toDelete.id)
      setToDelete(null)
      refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Projeler"
        subtitle="Şirketlere ait projeleri, durum, tarih ve bütçeleriyle yönetin"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={companies.length === 0}
            onClick={() => {
              setEditing(null)
              setDrawerOpen(true)
            }}
          >
            Yeni Proje
          </Button>
        }
      />

      <TextField
        select
        size="small"
        label="Şirkete göre filtrele"
        value={companyFilter}
        onChange={(e) => setCompanyFilter(e.target.value)}
        sx={{ minWidth: 240, mb: 2 }}
      >
        <MenuItem value="">Tümü</MenuItem>
        {companies.map((c) => (
          <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
        ))}
      </TextField>

      <Card sx={{ height: 620 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, printOptions: { disableToolbarButton: true } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ border: 0 }}
        />
      </Card>

      <ProjectFormDrawer
        open={drawerOpen}
        initial={editing}
        companies={companies}
        defaultCompanyId={companyFilter || undefined}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Projeyi sil"
        message={`"${toDelete?.name}" projesi, aşamaları ve carileri silinecek. Onaylıyor musunuz?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
