'use client'

import * as React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'
import { createCompany, updateCompany } from '@/actions/companies'
import type { CompanyRow } from '@/types/dto'

interface Props {
  open: boolean
  initial?: CompanyRow | null
  onClose: () => void
  onSuccess: () => void
}

export default function CompanyFormDrawer({ open, initial, onClose, onSuccess }: Props) {
  const [values, setValues] = React.useState({
    name: '',
    taxNumber: '',
    email: '',
    phone: '',
    address: '',
  })
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      setValues({
        name: initial?.name ?? '',
        taxNumber: initial?.taxNumber ?? '',
        email: initial?.email ?? '',
        phone: initial?.phone ?? '',
        address: initial?.address ?? '',
      })
      setError(null)
    }
  }, [open, initial])

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        if (initial) await updateCompany(initial.id, values)
        else await createCompany(values)
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
          <Typography variant="h6">{initial ? 'Şirketi Düzenle' : 'Yeni Şirket'}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField label="Şirket Adı" value={values.name} onChange={set('name')} required autoFocus fullWidth />
          <TextField label="Vergi No" value={values.taxNumber} onChange={set('taxNumber')} fullWidth />
          <TextField label="E-posta" type="email" value={values.email} onChange={set('email')} fullWidth />
          <TextField label="Telefon" value={values.phone} onChange={set('phone')} fullWidth />
          <TextField label="Adres" value={values.address} onChange={set('address')} multiline rows={2} fullWidth />

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
