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
import { createUser, updateUser } from '@/actions/users'
import { USER_ROLE, toOptions } from '@/lib/labels'
import type { UserRow } from '@/types/dto'
import type { UserRole } from '@prisma/client'

interface Props {
  open: boolean
  initial?: UserRow | null
  onClose: () => void
  onSuccess: () => void
}

const roleOptions = toOptions(USER_ROLE)

export default function UserFormDrawer({ open, initial, onClose, onSuccess }: Props) {
  const [values, setValues] = React.useState({
    email: '',
    name: '',
    role: 'MEMBER' as UserRole,
    password: '',
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
        if (initial) {
          await updateUser(initial.id, {
            email: initial.email,
            name: values.name,
            role: values.role,
            password: values.password || null,
          })
        } else {
          await createUser(values)
        }
        onSuccess()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu.')
      }
    })
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box component="form" onSubmit={submit} sx={{ width: { xs: 320, sm: 420 }, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{initial ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField
            label="E-posta"
            type="email"
            value={values.email}
            onChange={set('email')}
            required
            disabled={!!initial}
            fullWidth
          />
          <TextField label="Ad Soyad" value={values.name} onChange={set('name')} required fullWidth />
          <TextField select label="Rol" value={values.role} onChange={set('role')} fullWidth>
            {roleOptions.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
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
