'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import PageHeader from '@/components/common/PageHeader'
import { markAllNotificationsRead, markNotificationRead } from '@/actions/notifications'
import { NOTIFICATION_STATUS } from '@/lib/labels'
import { formatDateTime } from '@/lib/format'
import type { NotificationRow } from '@/types/dto'

export default function NotificationsClient({ rows }: { rows: NotificationRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()
  const hasUnread = rows.some((r) => r.status !== 'READ')

  function markOne(id: string) {
    startTransition(async () => {
      await markNotificationRead(id)
      router.refresh()
    })
  }
  function markAll() {
    startTransition(async () => {
      await markAllNotificationsRead()
      router.refresh()
    })
  }

  return (
    <>
      <PageHeader
        title="Bildirimler"
        subtitle="Aşama/durum değişikliklerinde üretilen in-app ve e-posta (simülasyon) bildirimleri"
        action={
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            disabled={!hasUnread || pending}
            onClick={markAll}
          >
            Tümünü okundu işaretle
          </Button>
        }
      />

      <Card>
        {rows.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Henüz bildirim yok.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {rows.map((n, i) => {
              const unread = n.status !== 'READ'
              const meta = NOTIFICATION_STATUS[n.status]
              return (
                <React.Fragment key={n.id}>
                  {i > 0 && <Divider component="li" />}
                  <ListItem
                    sx={{ bgcolor: unread ? 'action.hover' : 'transparent', py: 1.5 }}
                    secondaryAction={
                      unread ? (
                        <Tooltip title="Okundu işaretle">
                          <IconButton edge="end" onClick={() => markOne(n.id)} disabled={pending}>
                            <MarkEmailReadOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      ) : null
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: n.channel === 'EMAIL' ? 'secondary.main' : 'primary.main' }}>
                        {n.channel === 'EMAIL' ? <EmailOutlinedIcon /> : <NotificationsNoneOutlinedIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography component="span" fontWeight={unread ? 700 : 500}>
                            {n.title}
                          </Typography>
                          <Chip label={meta.label} color={meta.color} size="small" variant="outlined" />
                          <Chip label={n.channel === 'EMAIL' ? 'E-posta' : 'Uygulama'} size="small" />
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {n.body}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary" display="block">
                            {n.recipientName ? `${n.recipientName} · ` : ''}
                            {formatDateTime(n.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              )
            })}
          </List>
        )}
      </Card>
    </>
  )
}
