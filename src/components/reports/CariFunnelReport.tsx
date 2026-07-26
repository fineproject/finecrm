import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import type { FunnelMetric } from '@/server/reports'

export default function CariFunnelReport({ data }: { data: FunnelMetric[] }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="Cari Satış Hunisi"
        subheader="Gelen aramalar, dönüş yapılanlar ve potansiyele dönüşenler — dönemsel"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Metrik</TableCell>
            <TableCell align="right">Günlük</TableCell>
            <TableCell align="right">Haftalık</TableCell>
            <TableCell align="right">Aylık</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((m) => (
            <TableRow key={m.key} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>{m.label}</Typography>
              </TableCell>
              <TableCell align="right">{m.day}</TableCell>
              <TableCell align="right">{m.week}</TableCell>
              <TableCell align="right">{m.month}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
