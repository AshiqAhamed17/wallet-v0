import { QueryClient } from '@tanstack/react-query'
import { configureChains, createConfig } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { publicProvider } from '@wagmi/core/providers/public'

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || ''
const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

const chains = [
  sepoliaRpcUrl
    ? { ...sepolia, rpcUrls: { ...sepolia.rpcUrls, default: { http: [sepoliaRpcUrl] } } }
    : sepolia,
  mainnet,
]

const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [
    sepoliaRpcUrl ? { ...publicProvider(), rpc: sepoliaRpcUrl } : publicProvider(),
    publicProvider(),
  ]
)

const connectors = [
  new InjectedConnector({ chains }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId: wcProjectId,
      showQrModal: true,
    }
  }),
]

export const queryClient = new QueryClient()

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
  queryClient,
})

export { chains }
