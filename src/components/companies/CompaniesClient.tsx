'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { DataGrid, GridActionsCellItem, GridToolbar, type GridColDef } from '@mui/x-data-grid'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CompanyFormDrawer from './CompanyFormDrawer'
import { deleteCompany } from '@/actions/companies'
import { formatDate } from '@/lib/format'
import type { CompanyRow } from '@/types/dto'

export default function CompaniesClient({
  rows,
  canManage = false,
}: {
  rows: CompanyRow[]
  canManage?: boolean
}) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<CompanyRow | null>(null)
  const [toDelete, setToDelete] = React.useState<CompanyRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  const refresh = () => router.refresh()

  const columns: GridColDef<CompanyRow>[] = [
    { field: 'name', headerName: 'Şirket', flex: 1.4, minWidth: 180 },
    { field: 'taxNumber', headerName: 'Vergi No', flex: 1, minWidth: 120, valueGetter: (v) => v || '—' },
    { field: 'phone', headerName: 'Telefon', flex: 1, minWidth: 130, valueGetter: (v) => v || '—' },
    { field: 'email', headerName: 'E-posta', flex: 1.2, minWidth: 160, valueGetter: (v) => v || '—' },
    { field: 'projectCount', headerName: 'Proje', width: 90, type: 'number' },
    { field: 'cariCount', headerName: 'Cari', width: 90, type: 'number' },
    {
      field: 'createdAt',
      headerName: 'Eklendi',
      width: 120,
      valueFormatter: (v: string) => formatDate(v),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 90,
      getActions: (params) =>
        canManage
          ? [
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
            ]
          : [],
    },
  ]

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await deleteCompany(toDelete.id)
      setToDelete(null)
      refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Şirketler"
        subtitle="Şirketleri ekleyin, düzenleyin ve projelerini takip edin"
        action={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null)
                setDrawerOpen(true)
              }}
            >
              Yeni Şirket
            </Button>
          ) : undefined
        }
      />

      <Card sx={{ height: 620 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, printOptions: { disableToolbarButton: true } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ border: 0 }}
        />
      </Card>

      <CompanyFormDrawer
        open={drawerOpen}
        initial={editing}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Şirketi sil"
        message={`"${toDelete?.name}" şirketi ve tüm projeleri/carileri silinecek. Onaylıyor musunuz?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
