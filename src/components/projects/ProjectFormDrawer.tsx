'use client'

import * as React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'
import { createProject, updateProject } from '@/actions/projects'
import { PROJECT_STATUS, toOptions } from '@/lib/labels'
import type { Option, ProjectRow } from '@/types/dto'
import type { ProjectStatus } from '@prisma/client'

interface Props {
  open: boolean
  initial?: ProjectRow | null
  companies: Option[]
  defaultCompanyId?: string
  onClose: () => void
  onSuccess: () => void
}

const statusOptions = toOptions(PROJECT_STATUS)

function toDateInput(iso: string | null | undefined) {
  return iso ? iso.slice(0, 10) : ''
}

export default function ProjectFormDrawer({
  open,
  initial,
  companies,
  defaultCompanyId,
  onClose,
  onSuccess,
}: Props) {
  const [values, setValues] = React.useState({
    companyId: '',
    name: '',
    description: '',
    status: 'PENDING' as ProjectStatus,
    startDate: '',
    endDate: '',
    budget: '',
  })
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      setValues({
        companyId: initial?.companyId ?? defaultCompanyId ?? companies[0]?.id ?? '',
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        status: initial?.status ?? 'PENDING',
        startDate: toDateInput(initial?.startDate),
        endDate: toDateInput(initial?.endDate),
        budget: initial?.budget != null ? String(initial.budget) : '',
      })
      setError(null)
    }
  }, [open, initial, defaultCompanyId, companies])

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
      setValues((v) => ({ ...v, [key]: e.target.value as string }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const payload = {
          companyId: values.companyId,
          name: values.name,
          description: values.description,
          status: values.status,
          startDate: values.startDate || null,
          endDate: values.endDate || null,
          budget: values.budget === '' ? null : Number(values.budget),
        }
        if (initial) await updateProject(initial.id, payload)
        else await createProject(payload)
        onSuccess()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
      }
    })
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box component="form" onSubmit={submit} sx={{ width: { xs: 320, sm: 440 }, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{initial ? 'Projeyi Düzenle' : 'Yeni Proje'}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField select label="Şirket" value={values.companyId} onChange={set('companyId')} required fullWidth>
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Proje Adı" value={values.name} onChange={set('name')} required fullWidth />
          <TextField label="Açıklama" value={values.description} onChange={set('description')} multiline rows={2} fullWidth />
          <TextField select label="Durum" value={values.status} onChange={set('status')} fullWidth>
            {statusOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Başlangıç"
              type="date"
              value={values.startDate}
              onChange={set('startDate')}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Bitiş"
              type="date"
              value={values.endDate}
              onChange={set('endDate')}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <TextField
            label="Bütçe (₺)"
            type="number"
            value={values.budget}
            onChange={set('budget')}
            inputProps={{ min: 0, step: 1000 }}
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={onClose} color="inherit">Vazgeç</Button>
            <Button type="submit" variant="contained" disabled={pending}>
              {pending ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  )
}
