'use client'

import * as React from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import { addCariNote } from '@/actions/cariler'

interface Props {
  open: boolean
  cariId: string
  cariName: string
  onClose: () => void
  onSuccess: () => void
}

export default function QuickNoteDialog({ open, cariId, cariName, onClose, onSuccess }: Props) {
  const [note, setNote] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (open) {
      setNote('')
      setError(null)
    }
  }, [open])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    setError(null)
    startTransition(async () => {
      try {
        await addCariNote(cariId, note)
        onSuccess()
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Not eklenemedi.')
      }
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={submit}>
        <DialogTitle>Not Ekle — {cariName}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            placeholder="Örn. Telefonla arandı, ulaşılamadı; yarın tekrar aranacak."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">Vazgeç</Button>
          <Button type="submit" variant="contained" disabled={pending || !note.trim()}>
            {pending ? 'Kaydediliyor…' : 'Ekle'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
