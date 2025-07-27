import { TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import type { Transaction } from '@safe-global/safe-gateway-typescript-sdk'

import {
  type DetailedTransaction,
  isConflictHeaderListItem,
  isNoneConflictType,
  isTransactionListItem,
  type TransactionListItem,
  isDetailedTransactionListItem,
} from '@/utils/transaction-guards'
import { sameAddress } from './addresses'

type GroupedTxs = Array<TransactionListItem | Array<DetailedTransaction>>

/**
 * Group txs by conflict header
 */
export const groupConflictingTxs = (list: TransactionListItem[]): GroupedTxs => {
  return list
    .reduce<GroupedTxs>((resultItems, item) => {
      if (isConflictHeaderListItem(item)) {
        return resultItems.concat([[]])
      }

      const prevItem = resultItems[resultItems.length - 1]
      if (Array.isArray(prevItem) && isDetailedTransactionListItem(item) && !isNoneConflictType(item)) {
        prevItem.push(item)
        return resultItems
      }

      return resultItems.concat(item)
    }, [])
    .map((item) => {
      if (Array.isArray(item)) {
        return item.sort((a, b) => b.transaction.timestamp - a.transaction.timestamp)
      }
      return item
    })
}

export function _getRecoveryCancellations(moduleAddress: string, transactions: Array<Transaction>) {
  const CANCELLATION_TX_METHOD_NAME = 'setTxNonce'

  return transactions.filter(({ transaction }) => {
    const { txInfo } = transaction
    return (
      txInfo.type === TransactionInfoType.CUSTOM &&
      sameAddress(txInfo.to.value, moduleAddress) &&
      txInfo.methodName === CANCELLATION_TX_METHOD_NAME
    )
  })
}

export const getLatestTransactions = (list: TransactionListItem[] = []): Transaction[] => {
  return (
    groupConflictingTxs(list)
      // Get latest transaction if there are conflicting ones
      .map((group) => (Array.isArray(group) ? group[0] : group))
      .filter(isTransactionListItem)
  )
}
