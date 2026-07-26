'use client'

import * as React from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined'
import { generateReportCsv, generateReportPdf } from '@/lib/reportExport'
import type { ReportData } from '@/server/reports'

export default function ReportExport({ data }: { data: ReportData }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onPdf() {
    setLoading(true)
    setError(null)
    try {
      await generateReportPdf(data)
    } catch {
      setError('PDF oluşturulamadı.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<TableViewOutlinedIcon />}
          onClick={() => generateReportCsv(data)}
        >
          CSV
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfOutlinedIcon />}
          onClick={onPdf}
          disabled={loading}
        >
          {loading ? 'Hazırlanıyor…' : 'PDF İndir'}
        </Button>
      </Stack>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </>
  )
}
