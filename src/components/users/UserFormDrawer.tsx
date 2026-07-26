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
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import CloseIcon from '@mui/icons-material/Close'
import { createUser, updateUser } from '@/actions/users'
import { USER_ROLE, toOptions } from '@/lib/labels'
import type { Option, UserRow } from '@/types/dto'
import type { UserRole } from '@prisma/client'

interface Props {
  open: boolean
  initial?: UserRow | null
  companies: Option[]
  projects: Option[]
  onClose: () => void
  onSuccess: () => void
}

const roleOptions = toOptions(USER_ROLE)

export default function UserFormDrawer({ open, initial, companies, projects, onClose, onSuccess }: Props) {
  const [values, setValues] = React.useState({
    email: '',
    name: '',
    role: 'MEMBER' as UserRole,
    password: '',
    accessCompanyIds: [] as string[],
    accessProjectIds: [] as string[],
  })
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      setValues({
        email: initial?.email ?? '',
        name: initial?.name ?? '',
        role: initial?.role ?? 'MEMBER',
        password: '',
        accessCompanyIds: initial?.accessCompanyIds ?? [],
        accessProjectIds: initial?.accessProjectIds ?? [],
      })
      setError(null)
    }
  }, [open, initial])

  const set =
    (key: 'email' | 'name' | 'role' | 'password') =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
      setValues((v) => ({ ...v, [key]: e.target.value as string }))

  const setMulti =
    (key: 'accessCompanyIds' | 'accessProjectIds') =>
    (e: React.ChangeEvent<{ value: unknown }>) =>
      setValues((v) => ({ ...v, [key]: e.target.value as string[] }))

  const isAdmin = values.role === 'ADMIN'

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const payload = {
          email: initial ? initial.email : values.email,
          name: values.name,
          role: values.role,
          password: values.password || null,
          accessCompanyIds: values.accessCompanyIds,
          accessProjectIds: values.accessProjectIds,
        }
        if (initial) await updateUser(initial.id, payload)
        else await createUser(payload)
        onSuccess()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
      }
    })
  }

  const labelFor = (opts: Option[], ids: string[]) =>
    ids.map((id) => opts.find((o) => o.id === id)?.label ?? id)

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box component="form" onSubmit={submit} sx={{ width: { xs: 320, sm: 440 }, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{initial ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField label="E-posta" type="email" value={values.email} onChange={set('email')} required disabled={!!initial} fullWidth />
          <TextField label="Ad Soyad" value={values.name} onChange={set('name')} required fullWidth />
          <TextField select label="Rol" value={values.role} onChange={set('role')} fullWidth>
            {roleOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>
          <TextField
            label={initial ? 'Yeni Şifre (opsiyonel)' : 'Şifre'}
            type="password"
            value={values.password}
            onChange={set('password')}
            required={!initial}
            helperText="En az 6 karakter"
            fullWidth
          />

          <Typography variant="subtitle2" sx={{ mt: 1 }}>Erişim Kapsamı</Typography>
          {isAdmin ? (
            <Alert severity="info">Yönetici tüm şirket ve projelere erişir.</Alert>
          ) : (
            <>
              <TextField
                select
                label="Erişebileceği Şirketler"
                value={values.accessCompanyIds}
                onChange={setMulti('accessCompanyIds')}
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (s) => {
                    const arr = labelFor(companies, s as string[])
                    return arr.length ? arr.join(', ') : 'Seçilmedi'
                  },
                }}
                helperText="Seçilen şirketlerin tüm projelerine erişir"
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Checkbox checked={values.accessCompanyIds.includes(c.id)} />
                    <ListItemText primary={c.label} />
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Ek Proje Erişimi"
                value={values.accessProjectIds}
                onChange={setMulti('accessProjectIds')}
                fullWidth
                SelectProps={{
                  multiple: true,
                  renderValue: (s) => {
                    const arr = labelFor(projects, s as string[])
                    return arr.length ? arr.join(', ') : 'Seçilmedi'
                  },
                }}
                helperText="Şirket vermeden yalnızca belirli projelere erişim"
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <Checkbox checked={values.accessProjectIds.includes(p.id)} />
                    <ListItemText primary={p.label} />
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}

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
