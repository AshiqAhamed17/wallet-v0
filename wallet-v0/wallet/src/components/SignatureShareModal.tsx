'use client'
import { useTxStore } from '@/state/txStore'
import { ShareUtils } from '@/utils/shareUtils'
import type { SignatureData } from '@/utils/transaction'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useRef, useState } from 'react'

interface SignatureShareModalProps {
  open: boolean
  onClose: () => void
  signatureData?: SignatureData
}

export default function SignatureShareModal({ open, onClose, signatureData }: SignatureShareModalProps) {
  const [importedData, setImportedData] = useState<SignatureData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addPendingSignature = useTxStore((state) => state.addPendingSignature)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (ShareUtils.validateSignatureData(data)) {
          setImportedData(data)
          setError(null)
        } else {
          setError('Invalid signature data format')
        }
      } catch (err) {
        setError('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  const handleUrlImport = (url: string) => {
    const data = ShareUtils.extractSignatureDataFromUrl(url)
    if (data && ShareUtils.validateSignatureData(data)) {
      setImportedData(data)
      setError(null)
    } else {
      setError('Invalid signature URL')
    }
  }

  const handleImportSignature = () => {
    if (!importedData) return

    try {
      addPendingSignature(importedData)
      setSuccess('Signature imported successfully')
      setImportedData(null)
      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError('Failed to import signature')
    }
  }

  const handleDownload = () => {
    if (!signatureData) return
    ShareUtils.downloadSignatureFile(signatureData)
  }

  const handleCopyLink = () => {
    if (!signatureData) return
    const link = ShareUtils.generateShareableLink(signatureData, window.location.origin)
    navigator.clipboard.writeText(link)
    setSuccess('Link copied to clipboard')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{signatureData ? 'Share Signature' : 'Import Signature'}</DialogTitle>
      <DialogContent>
        {signatureData ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Share this signature with other Safe owners:
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button variant="contained" onClick={handleDownload}>
                Download JSON
              </Button>
              <Button variant="outlined" onClick={handleCopyLink}>
                Copy Link
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Safe: {signatureData.safeAddress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction Hash: {signatureData.safeTxHash}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Signatures: {signatureData.signatures.length}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Import a signature file or URL:
            </Typography>
            <Stack spacing={2}>
              <Button variant="contained" onClick={() => fileInputRef.current?.click()}>
                Upload JSON File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <TextField
                fullWidth
                label="Or paste signature URL"
                placeholder="https://example.com?data=..."
                onChange={(e) => handleUrlImport(e.target.value)}
              />
            </Stack>

            {importedData && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Imported Signature:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Safe: {importedData.safeAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Signatures: {importedData.signatures.length}
                </Typography>
                <Button variant="contained" onClick={handleImportSignature} sx={{ mt: 1 }}>
                  Import Signature
                </Button>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
