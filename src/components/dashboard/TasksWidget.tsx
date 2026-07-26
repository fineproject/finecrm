import Link from 'next/link'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { formatDate } from '@/lib/format'
import type { TaskDashboard } from '@/server/tasks'
import type { TaskRow } from '@/types/dto'

export default function TasksWidget({ data }: { data: TaskDashboard }) {
  const list = [...data.overdue, ...data.today, ...data.upcoming].slice(0, 6)

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="Görev Hatırlatmaları"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
        action={
          <Button component={Link} href="/tasks" size="small">
            Tümü
          </Button>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Mini label="Geciken" value={data.overdue.length} color="error.main" />
          <Mini label="Bugün" value={data.today.length} color="warning.main" />
          <Mini label="Bu Hafta" value={data.upcoming.length} color="info.main" />
        </Stack>

        {list.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Yaklaşan görev yok.</Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={1}>
            {list.map((t) => (
              <TaskLine key={t.id} task={t} overdue={data.overdue.some((o) => o.id === t.id)} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}

function Mini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography variant="h5" fontWeight={800} sx={{ color }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  )
}

function TaskLine({ task, overdue }: { task: TaskRow; overdue: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>{task.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {task.cariName ?? task.projectName ?? '—'}
        </Typography>
      </Box>
      <Chip
        label={formatDate(task.dueDate)}
        size="small"
        color={overdue ? 'error' : 'default'}
        variant="outlined"
      />
    </Stack>
  )
}
