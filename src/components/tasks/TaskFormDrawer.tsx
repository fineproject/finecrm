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
import { createTask, updateTask } from '@/actions/tasks'
import { TASK_PRIORITY, TASK_STATUS, toOptions } from '@/lib/labels'
import type { Option, TaskRow } from '@/types/dto'
import type { TaskPriority, TaskStatus } from '@prisma/client'

interface Props {
  open: boolean
  initial?: TaskRow | null
  users: Option[]
  projects: Option[]
  cariler: Option[]
  onClose: () => void
  onSuccess: () => void
}

const priorityOptions = toOptions(TASK_PRIORITY)
const statusOptions = toOptions(TASK_STATUS)

export default function TaskFormDrawer({ open, initial, users, projects, cariler, onClose, onSuccess }: Props) {
  const [values, setValues] = React.useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    status: 'PENDING' as TaskStatus,
    dueDate: '',
    assignedUserId: '',
    projectId: '',
    cariId: '',
  })
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      setValues({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        priority: initial?.priority ?? 'MEDIUM',
        status: initial?.status ?? 'PENDING',
        dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : '',
        assignedUserId: initial?.assignedUserId ?? '',
        projectId: initial?.projectId ?? '',
        cariId: initial?.cariId ?? '',
      })
      setError(null)
    }
  }, [open, initial])

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
          title: values.title,
          description: values.description,
          priority: values.priority,
          status: values.status,
          dueDate: values.dueDate || null,
          assignedUserId: values.assignedUserId || null,
          projectId: values.projectId || null,
          cariId: values.cariId || null,
        }
        if (initial) await updateTask(initial.id, payload)
        else await createTask(payload)
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
          <Typography variant="h6">{initial ? 'Görevi Düzenle' : 'Yeni Görev'}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField label="Başlık" value={values.title} onChange={set('title')} required autoFocus fullWidth />
          <TextField label="Açıklama" value={values.description} onChange={set('description')} multiline rows={2} fullWidth />
          <Stack direction="row" spacing={2}>
            <TextField select label="Öncelik" value={values.priority} onChange={set('priority')} fullWidth>
              {priorityOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField select label="Durum" value={values.status} onChange={set('status')} fullWidth>
              {statusOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          </Stack>
          <TextField label="Son Tarih" type="date" value={values.dueDate} onChange={set('dueDate')} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField select label="Atanan Kullanıcı" value={values.assignedUserId} onChange={set('assignedUserId')} fullWidth>
            <MenuItem value="">— Yok —</MenuItem>
            {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.label}</MenuItem>)}
          </TextField>
          <TextField select label="Proje" value={values.projectId} onChange={set('projectId')} fullWidth>
            <MenuItem value="">— Yok —</MenuItem>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>)}
          </TextField>
          <TextField select label="Cari" value={values.cariId} onChange={set('cariId')} fullWidth>
            <MenuItem value="">— Yok —</MenuItem>
            {cariler.map((c) => <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>)}
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
