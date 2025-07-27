import { useMemo } from 'react'
import { isMultisigExecutionInfo, isTransactionListItem, type TransactionListItem } from '@/utils/transaction-guards'
import uniqBy from 'lodash/uniqBy'
import useTxQueue from '@/hooks/useTxQueue'

export const _getUniqueQueuedTxs = (data?: Array<TransactionListItem>) => {
  if (!data) {
    return []
  }

  const txs = data.filter(isTransactionListItem).map((item) => item.transaction)

  return uniqBy(txs, (tx) => {
    return isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : ''
  })
}

const usePreviousNonces = () => {
  const { data } = useTxQueue()

  const previousNonces = useMemo(() => {
    return _getUniqueQueuedTxs(data)
      .map((tx) => (isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined))
      .filter((nonce): nonce is number => nonce !== undefined)
  }, [data])

  return previousNonces
}

export default usePreviousNonces
