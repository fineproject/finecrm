import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { formatCurrency } from '@/lib/format'

export default function CompanyBreakdown({
  rows,
}: {
  rows: { name: string; projectCount: number; cariCount: number; budget: number }[]
}) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="Şirket Bazında Özet"
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
      />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Şirket</TableCell>
            <TableCell align="right">Proje</TableCell>
            <TableCell align="right">Cari</TableCell>
            <TableCell align="right">Bütçe</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant="body2" color="text.secondary">Kayıt yok.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((c) => (
              <TableRow key={c.name} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                </TableCell>
                <TableCell align="right">{c.projectCount}</TableCell>
                <TableCell align="right">{c.cariCount}</TableCell>
                <TableCell align="right">{formatCurrency(c.budget)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
