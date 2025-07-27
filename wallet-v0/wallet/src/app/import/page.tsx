'use client'
import { Button, Container, Paper, Stack, Typography } from '@mui/material'
import { useRef } from 'react'

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Import Safe
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Upload a Safe JSON file to import your Safe(s).
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Button variant="contained" aria-label="Upload Safe JSON" onClick={() => fileInputRef.current?.click()}>
            Upload JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            aria-label="Safe JSON File Input"
            // TODO: Add import logic
          />
        </Stack>
      </Paper>
    </Container>
  )
}
