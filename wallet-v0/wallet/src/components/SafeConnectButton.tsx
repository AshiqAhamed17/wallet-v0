'use client'
import { Button, Stack, Typography } from '@mui/material'
import { useConnect, useAccount, useDisconnect } from 'wagmi'

function truncateAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4)
}

export default function SafeConnectButton() {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {!isConnected ? (
        connectors.map((connector) => (
          <Button
            key={connector.id}
            variant="contained"
            onClick={() => connect({ connector })}
            disabled={!connector.ready || isLoading}
          >
            {isLoading && pendingConnector?.id === connector.id ? 'Connecting...' : `Connect ${connector.name}`}
          </Button>
        ))
      ) : (
        <>
          <Typography variant="body2">{truncateAddress(address || '')}</Typography>
          <Button variant="outlined" onClick={() => disconnect()}>
            Disconnect
          </Button>
        </>
      )}
      {error && (
        <Typography color="error" variant="body2">
          {error.message}
        </Typography>
      )}
    </Stack>
  )
}
