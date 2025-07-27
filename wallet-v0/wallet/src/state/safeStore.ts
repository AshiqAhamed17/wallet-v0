import create from 'zustand'
import { persist } from 'zustand/middleware'

export interface SafeInfo {
  chainId: string
  address: string
  name?: string
  owners?: string[]
  threshold?: number
}

interface SafeState {
  safes: SafeInfo[]
  currentSafe: SafeInfo | null
  currentChainId: string
  addSafe: (safe: SafeInfo) => void
  removeSafe: (address: string, chainId: string) => void
  setCurrentSafe: (safe: SafeInfo | null) => void
  updateSafe: (address: string, chainId: string, updates: Partial<SafeInfo>) => void
  setCurrentChainId: (chainId: string) => void
  importSafes: (safes: SafeInfo[]) => void
  exportSafes: () => SafeInfo[]
  getSafesByChain: (chainId: string) => SafeInfo[]
}

export const useSafeStore = create<SafeState>()(
  persist(
    (set, get) => ({
      safes: [],
      currentSafe: null,
      currentChainId: '1', // Default to mainnet
      addSafe: (safe) =>
        set((state) => ({
          safes: [...state.safes, safe],
        })),
      removeSafe: (address, chainId) =>
        set((state) => ({
          safes: state.safes.filter((s) => s.address !== address || s.chainId !== chainId),
        })),
      setCurrentSafe: (safe) => set(() => ({ currentSafe: safe })),
      updateSafe: (address, chainId, updates) =>
        set((state) => ({
          safes: state.safes.map((s) => (s.address === address && s.chainId === chainId ? { ...s, ...updates } : s)),
        })),
      setCurrentChainId: (chainId) => set(() => ({ currentChainId: chainId })),
      importSafes: (safes) => set(() => ({ safes })),
      exportSafes: () => get().safes,
      getSafesByChain: (chainId) => get().safes.filter((safe) => safe.chainId === chainId),
    }),
    {
      name: 'safe-storage',
      partialize: (state) => ({
        safes: state.safes,
        currentChainId: state.currentChainId,
      }),
    },
  ),
)
