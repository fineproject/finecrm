import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'

import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/dashboard/StatCard'
import ProjectStatusChart from '@/components/dashboard/ProjectStatusChart'
import ActivityTrendChart from '@/components/dashboard/ActivityTrendChart'
import TasksWidget from '@/components/dashboard/TasksWidget'
import { getDashboardStats } from '@/server/reports'
import { getTaskDashboard } from '@/server/tasks'
import { PROJECT_STATUS, CARI_STAGE, ACTIVITY_TYPE } from '@/lib/labels'
import { formatCurrency, formatDateTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let stats
  let tasks
  try {
    ;[stats, tasks] = await Promise.all([getDashboardStats(), getTaskDashboard()])
  } catch {
    return (
      <>
        <PageHeader title="Genel Bakış" subtitle="Şirket, proje ve cari özetleri" />
        <Alert severity="warning">
          Veritabanına bağlanılamadı. `.env` içinde `DATABASE_URL` tanımlayıp
          `npm run db:migrate` ve `npm run db:seed` komutlarını çalıştırın.
        </Alert>
      </>
    )
  }

  const pieData = stats.projectStatus.map((s) => ({
    label: PROJECT_STATUS[s.status].label,
    value: s.count,
    color: PROJECT_STATUS[s.status].hex ?? '#94a3b8',
  }))

  const totalCari = stats.totals.cariler || 1

  return (
    <>
      <PageHeader
        title="Genel Bakış"
        subtitle="Şirket, proje ve cari durumunuzun özeti ve dönemsel raporlar"
      />

      {/* İstatistik kartları */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard title="Şirket" value={stats.totals.companies} icon={<BusinessOutlinedIcon />} />
        <StatCard
          title="Proje"
          value={stats.totals.projects}
          icon={<FolderOutlinedIcon />}
          color="#0ea5e9"
        />
        <StatCard
          title="Cari"
          value={stats.totals.cariler}
          icon={<PeopleAltOutlinedIcon />}
          color="#7c3aed"
        />
        <StatCard
          title="Toplam Bütçe"
          value={formatCurrency(stats.totals.totalBudget)}
          icon={<PaymentsOutlinedIcon />}
          color="#10b981"
        />
      </Box>

      {/* Dönemsel özet (Günlük / Haftalık / Aylık) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.periods.map((p) => (
          <Card key={p.key}>
            <CardHeader title={p.label} titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
            <CardContent sx={{ pt: 0 }}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <PeriodStat label="Yeni Proje" value={p.newProjects} />
                <PeriodStat label="Tamamlanan Aşama" value={p.completedMilestones} />
                <PeriodStat label="Cari Hareketi" value={p.cariActivities} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Grafikler */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardHeader title="Proje Durum Dağılımı" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
          <CardContent>
            <ProjectStatusChart data={pieData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Son 14 Gün Hareket" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
          <CardContent>
            <ActivityTrendChart data={stats.activityTrend} />
          </CardContent>
        </Card>
      </Box>

      {/* Görev hatırlatmaları */}
      <TasksWidget data={tasks} />

      {/* Cari aşama dağılımı + son işlemler */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Card>
          <CardHeader title="Cari Aşama Dağılımı" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
          <CardContent>
            <Stack spacing={2}>
              {(Object.keys(CARI_STAGE) as (keyof typeof CARI_STAGE)[]).map((key) => {
                const count = stats.cariStage.find((s) => s.stage === key)?.count ?? 0
                const pct = Math.round((count / totalCari) * 100)
                return (
                  <Box key={key}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{CARI_STAGE[key].label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {count} ({pct}%)
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': { backgroundColor: CARI_STAGE[key].hex },
                      }}
                    />
                  </Box>
                )
              })}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Son İşlemler" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }} />
          <CardContent sx={{ pt: 0 }}>
            {stats.recent.length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Henüz işlem yok.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={1.5}>
                {stats.recent.map((a) => (
                  <Box key={a.id}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {a.message}
                      </Typography>
                      <Chip label={ACTIVITY_TYPE[a.type]} size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(a.createdAt)}
                      {a.projectName ? ` · ${a.projectName}` : ''}
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

function PeriodStat({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ textAlign: 'center', flex: 1 }}>
      <Typography variant="h5" fontWeight={800}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}
