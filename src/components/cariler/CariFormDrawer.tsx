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
import { createCari, updateCari } from '@/actions/cariler'
import { CARI_STAGE, CARI_TYPE, toOptions } from '@/lib/labels'
import type { CariRow, Option } from '@/types/dto'
import type { CariStage, CariType } from '@prisma/client'

interface Props {
  open: boolean
  initial?: CariRow | null
  projects: Option[]
  milestonesByProject: Record<string, Option[]>
  defaultProjectId?: string
  onClose: () => void
  onSuccess: () => void
}

const stageOptions = toOptions(CARI_STAGE)
const typeOptions = toOptions(CARI_TYPE)

export default function CariFormDrawer({
  open,
  initial,
  projects,
  milestonesByProject,
  defaultProjectId,
  onClose,
  onSuccess,
}: Props) {
  const [values, setValues] = React.useState({
    projectId: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    type: 'CUSTOMER' as CariType,
    stage: 'ADDED' as CariStage,
    infoStatus: '',
    currentMilestoneId: '',
  })
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      setValues({
        projectId: initial?.projectId ?? defaultProjectId ?? projects[0]?.id ?? '',
        firstName: initial?.firstName ?? '',
        lastName: initial?.lastName ?? '',
        phone: initial?.phone ?? '',
        email: initial?.email ?? '',
        type: initial?.type ?? 'CUSTOMER',
        stage: initial?.stage ?? 'ADDED',
        infoStatus: initial?.infoStatus ?? '',
        currentMilestoneId: initial?.currentMilestoneId ?? '',
      })
      setError(null)
    }
  }, [open, initial, defaultProjectId, projects])

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
      setValues((v) => ({ ...v, [key]: e.target.value as string }))

  // Proje değişince, o projeye ait olmayan aşama seçimini sıfırla
  const milestoneOpts = milestonesByProject[values.projectId] ?? []
  function onProjectChange(e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) {
    const projectId = e.target.value as string
    setValues((v) => ({ ...v, projectId, currentMilestoneId: '' }))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const payload = { ...values, currentMilestoneId: values.currentMilestoneId || null }
        if (initial) await updateCari(initial.id, payload)
        else await createCari(payload)
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
          <Typography variant="h6">{initial ? 'Cariyi Düzenle' : 'Yeni Cari'}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField select label="Proje" value={values.projectId} onChange={onProjectChange} required fullWidth>
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2}>
            <TextField label="Ad" value={values.firstName} onChange={set('firstName')} required fullWidth />
            <TextField label="Soyad" value={values.lastName} onChange={set('lastName')} required fullWidth />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField label="Telefon" value={values.phone} onChange={set('phone')} fullWidth />
            <TextField label="E-posta" type="email" value={values.email} onChange={set('email')} fullWidth />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField select label="Tip" value={values.type} onChange={set('type')} fullWidth>
              {typeOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Aşama (Huni)" value={values.stage} onChange={set('stage')} fullWidth>
              {stageOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField label="Verilen Bilgi Durumu" value={values.infoStatus} onChange={set('infoStatus')} fullWidth />

          <TextField
            select
            label="Proje Aşaması (Milestone)"
            value={values.currentMilestoneId}
            onChange={set('currentMilestoneId')}
            fullWidth
            helperText={milestoneOpts.length === 0 ? 'Bu projede aşama tanımlı değil' : ' '}
          >
            <MenuItem value="">— Yok —</MenuItem>
            {milestoneOpts.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
            ))}
          </TextField>

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
