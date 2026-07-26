'use client'

import * as React from 'react'
import { authenticate } from '@/actions/auth'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Başarılı girişte server action yönlendirme fırlatır (buraya dönmez)
      const res = await authenticate(email, password)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      }
    } catch {
      // Yönlendirme dışı beklenmeyen hata
      setError('Giriş sırasında bir hata oluştu.')
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <Avatar
              variant="rounded"
              sx={{ width: 48, height: 48, fontWeight: 800, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}
            >
              ◆
            </Avatar>
            <Typography variant="h5" fontWeight={800}>FineCRM</Typography>
            <Typography variant="body2" color="text.secondary">
              Devam etmek için giriş yapın
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              <TextField
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                fullWidth
              />
              <TextField
                label="Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 3, textAlign: 'center' }}>
            Örnek: admin@finecrm.local / admin123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
