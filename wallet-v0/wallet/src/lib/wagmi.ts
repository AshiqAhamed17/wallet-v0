import { configureChains, createConfig } from '@wagmi/core'
import { mainnet, sepolia } from '@wagmi/core/chains'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { publicProvider } from '@wagmi/core/providers/public'

const sepoliaRpcUrl = process.env.NEXT_PUBLIC_RPC_URL || ''

const chains = [
  sepoliaRpcUrl ? { ...sepolia, rpcUrls: { ...sepolia.rpcUrls, default: { http: [sepoliaRpcUrl] } } } : sepolia,
  mainnet,
]

const { publicClient, webSocketPublicClient } = configureChains(chains, [
  sepoliaRpcUrl ? { ...publicProvider(), rpc: sepoliaRpcUrl } : publicProvider(),
  publicProvider(),
])

const connectors = [new InjectedConnector({ chains })]

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }
