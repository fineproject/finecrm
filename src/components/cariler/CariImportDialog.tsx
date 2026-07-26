'use client'

import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { bulkCreateCariler, type ImportCariRow } from '@/actions/import'
import type { Option } from '@/types/dto'

interface Props {
  open: boolean
  projects: Option[]
  onClose: () => void
  onSuccess: () => void
}

// Basit CSV çözümleyici: ; veya , ayracı, başlık satırından kolon eşleme
function parseCsv(text: string): ImportCariRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const delim = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(delim).map((h) => h.trim().toLocaleLowerCase('tr'))

  const idx = (names: string[]) => headers.findIndex((h) => names.includes(h))
  const iFirst = idx(['ad', 'firstname', 'isim', 'name'])
  const iLast = idx(['soyad', 'lastname', 'surname'])
  const iPhone = idx(['telefon', 'phone', 'gsm', 'tel'])
  const iEmail = idx(['email', 'e-posta', 'eposta', 'mail'])
  const iInfo = idx(['bilgi', 'bilgidurumu', 'infostatus', 'durum'])

  const get = (cols: string[], i: number) => (i >= 0 ? (cols[i] ?? '').trim() : '')

  return lines.slice(1).map((line) => {
    const cols = line.split(delim)
    return {
      firstName: get(cols, iFirst),
      lastName: get(cols, iLast),
      phone: get(cols, iPhone),
      email: get(cols, iEmail),
      infoStatus: get(cols, iInfo),
    }
  })
}

export default function CariImportDialog({ open, projects, onClose, onSuccess }: Props) {
  const [projectId, setProjectId] = React.useState('')
  const [rows, setRows] = React.useState<ImportCariRow[]>([])
  const [fileName, setFileName] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      setProjectId(projects[0]?.id ?? '')
      setRows([])
      setFileName('')
      setError(null)
    }
  }, [open, projects])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const text = await file.text()
    const parsed = parseCsv(text).filter((r) => r.firstName && r.lastName)
    setRows(parsed)
    setError(parsed.length === 0 ? 'Geçerli satır bulunamadı. Başlık satırında "ad" ve "soyad" olmalı.' : null)
  }

  function submit() {
    if (!projectId || rows.length === 0) return
    setError(null)
    startTransition(async () => {
      try {
        await bulkCreateCariler(projectId, rows)
        onSuccess()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'İçe aktarım başarısız.')
      }
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cari İçe Aktar (CSV)</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Alert severity="info">
            CSV başlıkları: <b>ad, soyad, telefon, email, bilgi</b> (; veya , ayraçlı).
          </Alert>
          <TextField select label="Hedef Proje" value={projectId} onChange={(e) => setProjectId(e.target.value)} fullWidth>
            {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>)}
          </TextField>
          <Button component="label" variant="outlined" startIcon={<UploadFileOutlinedIcon />}>
            CSV Seç
            <input type="file" accept=".csv,text/csv" hidden onChange={onFile} />
          </Button>
          {fileName && (
            <Typography variant="body2" color="text.secondary">
              {fileName} — {rows.length} geçerli satır bulundu
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Vazgeç</Button>
        <Button onClick={submit} variant="contained" disabled={pending || !projectId || rows.length === 0}>
          {pending ? 'Aktarılıyor…' : `${rows.length} Cariyi Aktar`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
