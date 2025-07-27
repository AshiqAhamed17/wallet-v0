'use client'
import { useSafeStore } from '@/state/safeStore'
import { createSafeClient } from '@/utils/safeClient'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { ethers } from 'ethers'
import { useRef, useState } from 'react'
import { useAccount } from 'wagmi'

export default function SafeImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const addSafe = useSafeStore((state) => state.addSafe)
  const importSafes = useSafeStore((state) => state.importSafes)
  const exportSafes = useSafeStore((state) => state.exportSafes)
  const safes = useSafeStore((state) => state.safes)
  const { address, isConnected } = useAccount()

  const validateAndImportSafe = async (safeData: any) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first')
    }

    setIsValidating(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      // Create a mock provider for validation (you'll need to get the actual RPC URL)
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
      const signer = provider.getSigner()
      const safeClient = createSafeClient(process.env.NEXT_PUBLIC_RPC_URL || '', signer)

      const validatedSafe = await safeClient.validateSafe(safeData.address)

      addSafe({
        ...validatedSafe,
        name: safeData.name || `Safe ${validatedSafe.address.slice(0, 6)}...`,
      })

      setImportSuccess(`Safe ${validatedSafe.address.slice(0, 6)}... imported successfully`)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to validate Safe')
    } finally {
      setIsValidating(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string)

        if (Array.isArray(data)) {
          // Import multiple safes
          for (const safe of data) {
            await validateAndImportSafe(safe)
          }
        } else {
          // Import single safe
          await validateAndImportSafe(data)
        }
      } catch (err) {
        setImportError('Invalid Safe JSON format')
      }
    }
    reader.readAsText(file)
  }

  const handleExport = () => {
    const safesData = exportSafes()
    const blob = new Blob([JSON.stringify(safesData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'safes.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Import / Export Safes
      </Typography>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Connect your wallet to import and validate Safes
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <Button
          variant="contained"
          onClick={() => fileInputRef.current?.click()}
          disabled={!isConnected || isValidating}
          startIcon={isValidating ? <CircularProgress size={16} /> : undefined}
        >
          {isValidating ? 'Validating...' : 'Import JSON'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
        <Button variant="outlined" onClick={handleExport} disabled={safes.length === 0}>
          Export All ({safes.length})
        </Button>
      </Stack>

      {importError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {importError}
        </Alert>
      )}

      {importSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {importSuccess}
        </Alert>
      )}
    </Box>
  )
}
