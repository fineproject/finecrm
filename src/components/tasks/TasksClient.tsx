'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import MuiLink from '@mui/material/Link'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { DataGrid, GridActionsCellItem, GridToolbar, type GridColDef } from '@mui/x-data-grid'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LabelChip from '@/components/common/LabelChip'
import TaskFormDrawer from './TaskFormDrawer'
import { completeTask, deleteTask } from '@/actions/tasks'
import { TASK_PRIORITY, TASK_STATUS } from '@/lib/labels'
import { formatDate } from '@/lib/format'
import type { Option, TaskRow } from '@/types/dto'
import type { TaskPriority, TaskStatus } from '@prisma/client'

export default function TasksClient({
  rows,
  users,
  projects,
  cariler,
}: {
  rows: TaskRow[]
  users: Option[]
  projects: Option[]
  cariler: Option[]
}) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = React.useState<TaskStatus | ''>('')
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<TaskRow | null>(null)
  const [toDelete, setToDelete] = React.useState<TaskRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const refresh = () => router.refresh()
  const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows

  const columns: GridColDef<TaskRow>[] = [
    {
      field: 'title',
      headerName: 'Başlık',
      flex: 1.4,
      minWidth: 180,
      renderCell: (p) => (
        <MuiLink component={Link} href={`/tasks/${p.row.id}`} underline="hover" color="inherit" sx={{ fontWeight: 600 }}>
          {p.value}
        </MuiLink>
      ),
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 130,
      renderCell: (p) => {
        const v = p.value as TaskStatus
        return <LabelChip label={TASK_STATUS[v].label} color={TASK_STATUS[v].color} />
      },
    },
    {
      field: 'priority',
      headerName: 'Öncelik',
      width: 110,
      renderCell: (p) => {
        const v = p.value as TaskPriority
        return <LabelChip label={TASK_PRIORITY[v].label} color={TASK_PRIORITY[v].color} />
      },
    },
    {
      field: 'dueDate',
      headerName: 'Son Tarih',
      width: 120,
      valueFormatter: (v: string | null) => formatDate(v),
      cellClassName: (params) =>
        params.row.status === 'PENDING' && params.value && new Date(params.value as string) < new Date()
          ? 'overdue-cell'
          : '',
    },
    { field: 'assignedUserName', headerName: 'Atanan', width: 140, valueGetter: (v) => v || '—' },
    { field: 'cariName', headerName: 'Cari', width: 140, valueGetter: (v) => v || '—' },
    { field: 'projectName', headerName: 'Proje', width: 140, valueGetter: (v) => v || '—' },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 160,
      getActions: (params) => [
        <GridActionsCellItem
          key="detail"
          icon={<VisibilityOutlinedIcon />}
          label="Detay"
          onClick={() => router.push(`/tasks/${params.row.id}`)}
        />,
        <GridActionsCellItem
          key="done"
          icon={<CheckCircleOutlineIcon />}
          label="Tamamla"
          disabled={params.row.status === 'DONE'}
          onClick={async () => {
            await completeTask(params.row.id)
            refresh()
          }}
        />,
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
      await deleteTask(toDelete.id)
      setToDelete(null)
      refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Görevler"
        subtitle="Follow-up ve hatırlatmaları yönetin; vadesi geçenler kırmızı görünür"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null)
              setDrawerOpen(true)
            }}
          >
            Yeni Görev
          </Button>
        }
      />

      <TextField
        select
        size="small"
        label="Duruma göre"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
        sx={{ minWidth: 200, mb: 2 }}
      >
        <MenuItem value="">Tümü</MenuItem>
        {(Object.keys(TASK_STATUS) as TaskStatus[]).map((s) => (
          <MenuItem key={s} value={s}>{TASK_STATUS[s].label}</MenuItem>
        ))}
      </TextField>

      <Card sx={{ height: 600, '& .overdue-cell': { color: 'error.main', fontWeight: 700 } }}>
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

      <TaskFormDrawer
        open={drawerOpen}
        initial={editing}
        users={users}
        projects={projects}
        cariler={cariler}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Görevi sil"
        message={`"${toDelete?.title}" görevi silinecek. Onaylıyor musunuz?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
