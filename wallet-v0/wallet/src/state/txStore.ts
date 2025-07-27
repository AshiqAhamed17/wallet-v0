import type { SignatureData } from '@/utils/transaction'
import create from 'zustand'
import { persist } from 'zustand/middleware'

export interface SafeTransaction {
  id: string
  safeAddress: string
  chainId: string
  data: any
  status: 'queued' | 'pending' | 'executed' | 'failed'
  signatures: string[]
  safeTxHash?: string
  threshold?: number
}

interface TxState {
  txQueue: SafeTransaction[]
  txHistory: SafeTransaction[]
  pendingSignatures: SignatureData[]
  addTxToQueue: (tx: SafeTransaction) => void
  removeTxFromQueue: (id: string) => void
  markTxExecuted: (id: string) => void
  addSignature: (id: string, signature: string) => void
  addPendingSignature: (signatureData: SignatureData) => void
  removePendingSignature: (safeTxHash: string) => void
  getPendingSignatures: () => SignatureData[]
  clearPendingSignatures: () => void
}

export const useTxStore = create<TxState>()(
  persist(
    (set, get) => ({
      txQueue: [],
      txHistory: [],
      pendingSignatures: [],
      addTxToQueue: (tx) => set((state) => ({ txQueue: [...state.txQueue, tx] })),
      removeTxFromQueue: (id) => set((state) => ({ txQueue: state.txQueue.filter((tx) => tx.id !== id) })),
      markTxExecuted: (id) =>
        set((state) => {
          const executedTx = state.txQueue.find((tx) => tx.id === id)
          return executedTx
            ? {
                txQueue: state.txQueue.filter((tx) => tx.id !== id),
                txHistory: [...state.txHistory, { ...executedTx, status: 'executed' }],
              }
            : {}
        }),
      addSignature: (id, signature) =>
        set((state) => ({
          txQueue: state.txQueue.map((tx) =>
            tx.id === id ? { ...tx, signatures: [...tx.signatures, signature] } : tx,
          ),
        })),
      addPendingSignature: (signatureData) =>
        set((state) => ({
          pendingSignatures: [...state.pendingSignatures, signatureData],
        })),
      removePendingSignature: (safeTxHash) =>
        set((state) => ({
          pendingSignatures: state.pendingSignatures.filter((sig) => sig.safeTxHash !== safeTxHash),
        })),
      getPendingSignatures: () => get().pendingSignatures,
      clearPendingSignatures: () => set(() => ({ pendingSignatures: [] })),
    }),
    {
      name: 'tx-storage',
      partialize: (state) => ({
        txQueue: state.txQueue,
        txHistory: state.txHistory,
        pendingSignatures: state.pendingSignatures,
      }),
    },
  ),
)
