import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

export default function StatCard({
  title,
  value,
  icon,
  color = 'primary.main',
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
}) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          variant="rounded"
          sx={{ bgcolor: color, width: 52, height: 52, color: '#fff' }}
        >
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={800} noWrap>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
