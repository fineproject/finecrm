'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import PageHeader from '@/components/common/PageHeader'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LabelChip from '@/components/common/LabelChip'
import UserFormDrawer from './UserFormDrawer'
import { deleteUser } from '@/actions/users'
import { USER_ROLE } from '@/lib/labels'
import { formatDate } from '@/lib/format'
import type { Option, UserRow } from '@/types/dto'
import type { UserRole } from '@prisma/client'

export default function UsersClient({
  rows,
  companies,
  projects,
  isAdmin,
  currentUserId,
}: {
  rows: UserRow[]
  companies: Option[]
  projects: Option[]
  isAdmin: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<UserRow | null>(null)
  const [toDelete, setToDelete] = React.useState<UserRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = () => router.refresh()

  const columns: GridColDef<UserRow>[] = [
    { field: 'name', headerName: 'Ad Soyad', flex: 1.2, minWidth: 160 },
    { field: 'email', headerName: 'E-posta', flex: 1.4, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Rol',
      width: 140,
      renderCell: (p) => {
        const v = p.value as UserRole
        return <LabelChip label={USER_ROLE[v].label} color={USER_ROLE[v].color} />
      },
    },
    {
      field: 'access',
      headerName: 'Erişim',
      width: 150,
      sortable: false,
      valueGetter: (_v, row) =>
        row.role === 'ADMIN'
          ? 'Tümü'
          : `${row.accessCompanyIds.length} şirket · ${row.accessProjectIds.length} proje`,
    },
    { field: 'createdAt', headerName: 'Kayıt', width: 120, valueFormatter: (v: string) => formatDate(v) },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 90,
      getActions: (params) =>
        isAdmin
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
                disabled={params.row.id === currentUserId}
                onClick={() => setToDelete(params.row)}
              />,
            ]
          : [],
    },
  ]

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    setError(null)
    try {
      await deleteUser(toDelete.id)
      setToDelete(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme başarısız.')
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Kullanıcılar"
        subtitle="Sistem kullanıcılarını ve rollerini yönetin"
        action={
          isAdmin ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null)
                setDrawerOpen(true)
              }}
            >
              Yeni Kullanıcı
            </Button>
          ) : undefined
        }
      />

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Kullanıcı ekleme/düzenleme yalnızca Yönetici rolüne açıktır.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ height: 560 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ border: 0 }}
        />
      </Card>

      <UserFormDrawer
        open={drawerOpen}
        initial={editing}
        companies={companies}
        projects={projects}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Kullanıcıyı sil"
        message={`"${toDelete?.name}" kullanıcısı silinecek. Onaylıyor musunuz?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  )
}
