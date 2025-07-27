'use client'
import TransactionFlowStepper from '@/components/TransactionFlowStepper'
import { chains } from '@/lib/wagmi'
import { useSafeStore } from '@/state/safeStore'
import AddIcon from '@mui/icons-material/Add'
import {
  Button,
  Container,
  Fab,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const safes = useSafeStore((state) => state.safes)
  const currentSafe = useSafeStore((state) => state.currentSafe)
  const currentChainId = useSafeStore((state) => state.currentChainId)
  const setCurrentSafe = useSafeStore((state) => state.setCurrentSafe)
  const setCurrentChainId = useSafeStore((state) => state.setCurrentChainId)
  const getSafesByChain = useSafeStore((state) => state.getSafesByChain)
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width:600px)')

  const getChainName = (chainId: string) => {
    const chain = chains.find((c) => c.id.toString() === chainId)
    return chain ? chain.name : chainId
  }

  const handleSafeSelect = (safe: any) => {
    setCurrentSafe(safe)
  }

  const handleChainChange = (chainId: string) => {
    setCurrentChainId(chainId)
    setCurrentSafe(null) // Reset current safe when changing chains
  }

  const currentChainSafes = getSafesByChain(currentChainId)

  return (
    <Container maxWidth="sm" sx={{ py: 4, position: 'relative' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Safe Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Manage your imported Safes below.
        </Typography>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Network</InputLabel>
          <Select value={currentChainId} label="Network" onChange={(e) => handleChainChange(e.target.value)}>
            {chains.map((chain) => (
              <MenuItem key={chain.id} value={chain.id.toString()}>
                {chain.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          My Safes ({getChainName(currentChainId)})
        </Typography>
        {currentChainSafes.length === 0 ? (
          <Typography color="text.secondary">No Safes imported for this network.</Typography>
        ) : (
          <List>
            {currentChainSafes.map((safe) => (
              <ListItem key={safe.address + safe.chainId} divider>
                <ListItemText primary={safe.name || 'Safe'} secondary={safe.address} />
                <ListItemSecondaryAction>
                  <Button
                    variant={currentSafe?.address === safe.address ? 'contained' : 'outlined'}
                    size="small"
                    aria-label={`${currentSafe?.address === safe.address ? 'Deselect' : 'Select'} Safe ${safe.address}`}
                    onClick={() => handleSafeSelect(currentSafe?.address === safe.address ? null : safe)}
                    sx={{ mr: 1 }}
                  >
                    {currentSafe?.address === safe.address ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    aria-label={`Manage Safe ${safe.address}`}
                    onClick={() => router.push(`/manage/${safe.address}`)}
                  >
                    Manage
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {currentSafe && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create Transaction
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected Safe: {currentSafe.address}
          </Typography>
          <TransactionFlowStepper />
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label="Import Safe"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => router.push('/import')}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}
