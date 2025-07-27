'use client'
import { useSafeStore } from '@/state/safeStore'
import { useTxStore } from '@/state/txStore'
import { ShareUtils } from '@/utils/shareUtils'
import { createTransactionHelper } from '@/utils/transaction'
import { Alert, Box, Button, Paper, Step, StepContent, StepLabel, Stepper, TextField, Typography } from '@mui/material'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useAccount } from 'wagmi'

const steps = ['Create Transaction', 'Sign Transaction', 'Share Signatures', 'Execute Transaction']

export default function TransactionFlowStepper() {
  const [activeStep, setActiveStep] = useState(0)
  const [transactionData, setTransactionData] = useState({
    to: '',
    value: '0',
    data: '0x',
  })
  const [safeTxHash, setSafeTxHash] = useState('')
  const [signatureData, setSignatureData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { address, isConnected } = useAccount()
  const currentSafe = useSafeStore((state) => state.currentSafe)
  const addPendingSignature = useTxStore((state) => state.addPendingSignature)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleCreateTransaction = async () => {
    if (!isConnected || !currentSafe) {
      setError('Please connect wallet and select a Safe')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
      const signer = provider.getSigner()
      const txHelper = createTransactionHelper(process.env.NEXT_PUBLIC_RPC_URL || '', signer)

      const tx = await txHelper.createSafeTransaction(currentSafe.address, transactionData)
      const hash = await txHelper.getTransactionHash(tx)
      setSafeTxHash(hash)
      handleNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignTransaction = async () => {
    if (!isConnected || !currentSafe) {
      setError('Please connect wallet and select a Safe')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
      const signer = provider.getSigner()
      const txHelper = createTransactionHelper(process.env.NEXT_PUBLIC_RPC_URL || '', signer)

      const signedTx = await txHelper.signSafeTransaction(safeTxHash, currentSafe.address)

      const signatureData = {
        safeTxHash,
        signatures: [signedTx],
        txData: transactionData,
        safeAddress: currentSafe.address,
        chainId: currentSafe.chainId,
      }

      setSignatureData(signatureData)
      addPendingSignature(signatureData)
      handleNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign transaction')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShareSignatures = () => {
    if (!signatureData) return

    const shareableLink = ShareUtils.generateShareableLink(signatureData, window.location.origin)
    ShareUtils.downloadSignatureFile(signatureData)
    handleNext()
  }

  const handleExecuteTransaction = async () => {
    if (!isConnected || !currentSafe) {
      setError('Please connect wallet and select a Safe')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
      const signer = provider.getSigner()
      const txHelper = createTransactionHelper(process.env.NEXT_PUBLIC_RPC_URL || '', signer)

      await txHelper.executeSafeTransaction(safeTxHash, currentSafe.address)
      handleNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute transaction')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create Safe Transaction
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step}>
            <StepLabel>{step}</StepLabel>
            <StepContent>
              {index === 0 && (
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="To Address"
                    value={transactionData.to}
                    onChange={(e) => setTransactionData({ ...transactionData, to: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Value (ETH)"
                    type="number"
                    value={transactionData.value}
                    onChange={(e) => setTransactionData({ ...transactionData, value: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Data (hex)"
                    value={transactionData.data}
                    onChange={(e) => setTransactionData({ ...transactionData, data: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={
                    index === 0
                      ? handleCreateTransaction
                      : index === 1
                      ? handleSignTransaction
                      : index === 2
                      ? handleShareSignatures
                      : handleExecuteTransaction
                  }
                  disabled={isProcessing}
                  sx={{ mr: 1 }}
                >
                  {isProcessing ? 'Processing...' : step}
                </Button>
                <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  )
}
