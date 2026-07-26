'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import MuiLink from '@mui/material/Link'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LabelChip from '@/components/common/LabelChip'
import CariFormDrawer from './CariFormDrawer'
import QuickNoteDialog from './QuickNoteDialog'
import { deleteCari } from '@/actions/cariler'
import { CARI_STAGE, CARI_TYPE, toOptions } from '@/lib/labels'
import { formatDate } from '@/lib/format'
import type { CariRow, Option } from '@/types/dto'
import type { CariStage, CariType } from '@prisma/client'

const stageFilterOptions = toOptions(CARI_STAGE)

export default function CarilerClient({
  rows,
  projects,
  milestonesByProject,
}: {
  rows: CariRow[]
  projects: Option[]
  milestonesByProject: Record<string, Option[]>
}) {
  const router = useRouter()
  const [projectFilter, setProjectFilter] = React.useState('')
  const [stageFilter, setStageFilter] = React.useState<CariStage | ''>('')
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<CariRow | null>(null)
  const [toDelete, setToDelete] = React.useState<CariRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [noteTarget, setNoteTarget] = React.useState<CariRow | null>(null)

  const refresh = () => router.refresh()
  const filtered = rows.filter(
    (r) =>
      (!projectFilter || r.projectId === projectFilter) &&
      (!stageFilter || r.stage === stageFilter),
  )

  const columns: GridColDef<CariRow>[] = [
    {
      field: 'fullName',
      headerName: 'Ad Soyad',
      flex: 1.2,
      minWidth: 160,
      renderCell: (p) => (
        <MuiLink
          component={Link}
          href={`/cariler/${p.row.id}`}
          underline="hover"
          color="inherit"
          sx={{ fontWeight: 600 }}
        >
          {p.value}
        </MuiLink>
      ),
    },
    {
      field: 'type',
      headerName: 'Tip',
      width: 110,
      renderCell: (p) => {
        const v = p.value as CariType
        return <LabelChip label={CARI_TYPE[v].label} color={CARI_TYPE[v].color} />
      },
    },
    {
      field: 'stage',
      headerName: 'Aşama',
      width: 140,
      renderCell: (p) => {
        const v = p.value as CariStage
        return <LabelChip label={CARI_STAGE[v].label} color={CARI_STAGE[v].color} />
      },
    },
    { field: 'infoStatus', headerName: 'Bilgi Durumu', flex: 1, minWidth: 140, valueGetter: (v) => v || '—' },
    { field: 'projectName', headerName: 'Proje', flex: 1, minWidth: 140 },
    { field: 'companyName', headerName: 'Şirket', flex: 1, minWidth: 140 },
    { field: 'currentMilestoneTitle', headerName: 'Proje Aşaması', flex: 1, minWidth: 140, valueGetter: (v) => v || '—' },
    { field: 'phone', headerName: 'Telefon', width: 130, valueGetter: (v) => v || '—' },
    { field: 'createdAt', headerName: 'Eklendi', width: 120, valueFormatter: (v: string) => formatDate(v) },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 160,
      getActions: (params) => [
        <GridActionsCellItem
          key="note"
          icon={<NoteAddOutlinedIcon />}
          label="Not Ekle"
          onClick={() => setNoteTarget(params.row)}
        />,
        <GridActionsCellItem
          key="timeline"
          icon={<TimelineOutlinedIcon />}
          label="Geçmiş"
          onClick={() => router.push(`/cariler/${params.id}`)}
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
      await deleteCari(toDelete.id)
      setToDelete(null)
      refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Cariler"
        subtitle="Projelere bağlı müşteri/paydaşları ve satış aşamalarını yönetin"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={projects.length === 0}
            onClick={() => {
              setEditing(null)
              setDrawerOpen(true)
            }}
          >
            Yeni Cari
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Projeye göre"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Tüm projeler</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Aşamaya göre"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as CariStage | '')}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tüm aşamalar</MenuItem>
          {stageFilterOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      <Card sx={{ height: 620 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ border: 0 }}
        />
      </Card>

      <CariFormDrawer
        open={drawerOpen}
        initial={editing}
        projects={projects}
        milestonesByProject={milestonesByProject}
        defaultProjectId={projectFilter || undefined}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Cariyi sil"
        message={`"${toDelete?.fullName}" carisi silinecek. Onaylıyor musunuz?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />

      {noteTarget && (
        <QuickNoteDialog
          open={!!noteTarget}
          cariId={noteTarget.id}
          cariName={noteTarget.fullName}
          onClose={() => setNoteTarget(null)}
          onSuccess={refresh}
        />
      )}
    </>
  )
}
