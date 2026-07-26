'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { addCariNote, setCariStage } from '@/actions/cariler'
import { CARI_STAGE, CARI_TYPE, ACTIVITY_TYPE, ACTIVITY_STYLE, toOptions } from '@/lib/labels'
import { formatDateTime, initials } from '@/lib/format'
import type { CariDetail } from '@/types/dto'
import type { CariStage } from '@prisma/client'

const stageSteps = toOptions(CARI_STAGE)

export default function CariDetailView({ cari }: { cari: CariDetail }) {
  const router = useRouter()
  const [note, setNote] = React.useState('')
  const [pending, startTransition] = React.useTransition()

  function changeStage(stage: CariStage) {
    if (stage === cari.stage) return
    startTransition(async () => {
      await setCariStage(cari.id, stage)
      router.refresh()
    })
  }

  function submitNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    startTransition(async () => {
      await addCariNote(cari.id, note)
      setNote('')
      router.refresh()
    })
  }

  const stageMeta = CARI_STAGE[cari.stage]
  const typeMeta = CARI_TYPE[cari.type]

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton component={Link} href="/cariler" size="small">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ bgcolor: stageMeta.hex, width: 48, height: 48, fontWeight: 700 }}>
          {initials(cari.firstName, cari.lastName)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={800}>{cari.fullName}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Chip label={stageMeta.label} color={stageMeta.color} size="small" />
            <Chip label={typeMeta.label} color={typeMeta.color} size="small" variant="outlined" />
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 2, alignItems: 'start' }}>
        {/* Sol: bilgi + aşama + not ekle */}
        <Stack spacing={2}>
          <Card>
            <CardHeader title="Cari Bilgileri" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={1.2} divider={<Divider flexItem />}>
                <InfoRow label="Telefon" value={cari.phone} />
                <InfoRow label="E-posta" value={cari.email} />
                <InfoRow label="Proje" value={cari.projectName} />
                <InfoRow label="Şirket" value={cari.companyName} />
                <InfoRow label="Proje Aşaması" value={cari.currentMilestoneTitle} />
                <InfoRow label="Bilgi Durumu" value={cari.infoStatus} />
                <InfoRow label="Oluşturulma" value={formatDateTime(cari.createdAt)} />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Aşama İlerlet" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={1}>
                {stageSteps.map((s) => {
                  const active = s.value === cari.stage
                  return (
                    <Button
                      key={s.value}
                      fullWidth
                      variant={active ? 'contained' : 'outlined'}
                      color={active ? 'primary' : 'inherit'}
                      disabled={pending}
                      onClick={() => changeStage(s.value as CariStage)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {s.label}
                    </Button>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Not / İşlem Ekle" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <CardContent sx={{ pt: 0 }}>
              <Box component="form" onSubmit={submitNote}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Örn. Telefonla arandı, mesaj bırakıldı"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  multiline
                  minRows={2}
                  sx={{ mb: 1 }}
                />
                <Button type="submit" variant="contained" disabled={pending || !note.trim()}>
                  Ekle
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        {/* Sağ: işlem geçmişi timeline */}
        <Card>
          <CardHeader
            title={`İşlem Geçmişi (${cari.history.length})`}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
          />
          <CardContent>
            {cari.history.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Henüz işlem yok.
              </Typography>
            ) : (
              <Box>
                {cari.history.map((h, i) => {
                  const style = ACTIVITY_STYLE[h.type]
                  const isLast = i === cari.history.length - 1
                  return (
                    <Box key={h.id} sx={{ display: 'flex', gap: 2 }}>
                      {/* Sol sütun: nokta + bağlayıcı çizgi */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: style.hex,
                            mt: 0.5,
                            flexShrink: 0,
                            boxShadow: (t) => `0 0 0 3px ${t.palette.background.paper}, 0 0 0 4px ${t.palette.divider}`,
                          }}
                        />
                        {!isLast && <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />}
                      </Box>
                      {/* Sağ sütun: içerik */}
                      <Box sx={{ pb: isLast ? 0 : 2.5, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2" fontWeight={500}>{h.message}</Typography>
                          <Chip label={ACTIVITY_TYPE[h.type]} size="small" variant="outlined" color={style.color} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(h.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
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
      <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right' }}>
        {value || '—'}
      </Typography>
    </Stack>
  )
}
