'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { addTaskNote, completeTask, reopenTask } from '@/actions/tasks'
import { TASK_PRIORITY, TASK_STATUS } from '@/lib/labels'
import { formatDate, formatDateTime } from '@/lib/format'
import type { TaskDetail } from '@/types/dto'

export default function TaskDetailView({ task }: { task: TaskDetail }) {
  const router = useRouter()
  const [note, setNote] = React.useState('')
  const [pending, startTransition] = React.useTransition()

  const status = TASK_STATUS[task.status]
  const priority = TASK_PRIORITY[task.priority]

  function submitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    startTransition(async () => {
      await addTaskNote(task.id, note)
      setNote('')
      router.refresh()
    })
  }

  function toggleStatus() {
    startTransition(async () => {
      if (task.status === 'DONE') await reopenTask(task.id)
      else await completeTask(task.id)
      router.refresh()
    })
  }

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton component={Link} href="/tasks" size="small">
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={800}>{task.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Chip label={status.label} color={status.color} size="small" />
            <Chip label={priority.label} color={priority.color} size="small" variant="outlined" />
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 2, alignItems: 'start' }}>
        <Stack spacing={2}>
          <Card>
            <CardHeader title="Görev Bilgileri" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={1.2} divider={<Divider flexItem />}>
                <InfoRow label="Açıklama" value={task.description} />
                <InfoRow label="Atanan" value={task.assignedUserName} />
                <InfoRow label="Cari" value={task.cariName} />
                <InfoRow label="Proje" value={task.projectName} />
                <InfoRow label="Son Tarih" value={formatDate(task.dueDate)} />
                <InfoRow label="Oluşturulma" value={formatDateTime(task.createdAt)} />
              </Stack>
              <Button
                fullWidth
                variant={task.status === 'DONE' ? 'outlined' : 'contained'}
                color={task.status === 'DONE' ? 'inherit' : 'success'}
                startIcon={task.status === 'DONE' ? <ReplayIcon /> : <CheckCircleOutlineIcon />}
                disabled={pending}
                onClick={toggleStatus}
                sx={{ mt: 2 }}
              >
                {task.status === 'DONE' ? 'Yeniden Aç' : 'Tamamlandı olarak işaretle'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="İlerleme Notu Ekle" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <CardContent sx={{ pt: 0 }}>
              <Box component="form" onSubmit={submitNote}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  placeholder="Örn. Müşteriyle görüşüldü, teklif iletildi."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button type="submit" variant="contained" disabled={pending || !note.trim()}>
                  Ekle
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Card>
          <CardHeader
            title={`İlerleme Geçmişi (${task.notes.length})`}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          />
          <CardContent>
            {task.notes.length === 0 ? (
              <Typography color="text.secondary" variant="body2">Henüz not eklenmedi.</Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1.5}>
                {task.notes.map((n) => (
                  <Box key={n.id}>
                    <Typography variant="body2">{n.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.actorName ? `${n.actorName} · ` : ''}{formatDateTime(n.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right' }}>{value || '—'}</Typography>
    </Stack>
  )
}
