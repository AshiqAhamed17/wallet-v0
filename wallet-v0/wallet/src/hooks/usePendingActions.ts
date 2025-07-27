import { isTransactionListItem, type TransactionListItem } from '@/utils/transaction-guards'
import { isSignableBy } from '@/utils/transaction-guards'
import { useMemo } from 'react'
import useTxQueue from './useTxQueue'
import useWallet from './wallets/useWallet'

type PendingActions = {
  totalQueued: string
  totalToSign: string
}

const getSignableCount = (data: Array<TransactionListItem>, walletAddress: string): number => {
  return data.filter((tx) => isTransactionListItem(tx) && isSignableBy(tx.transaction, walletAddress)).length
}

const usePendingActions = (): PendingActions => {
  const wallet = useWallet()
  const { data } = useTxQueue()

  return useMemo(
    () => ({
      // Return 20+ if more than one page, otherwise just the length
      totalQueued: data ? (data.filter(isTransactionListItem).length || '') + '' : '',
      // Return the queued txs signable by wallet
      totalToSign: data ? (getSignableCount(data, wallet?.address || '') || '').toString() : '',
    }),
    [data, wallet],
  )
}

export default usePendingActions
