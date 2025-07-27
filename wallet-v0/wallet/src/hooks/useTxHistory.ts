import { useAppSelector } from '@/store'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { selectAddedTxs } from '@/store/addedTxsSlice'
import { isEqual } from 'lodash'
import { extractTxDetails } from '@/services/tx/extractTxInfo'
import {
  partiallyDecodedTransaction,
  enrichTransactionDetailsFromHistory,
  getTxKeyFromTxId,
  makeTxFromDetails,
} from '@/utils/transactions'
import { type DetailedTransaction, isDetailedTransactionListItem } from '@/utils/transaction-guards'
import { selectTxHistory } from '@/store/txHistorySlice'

const useTxHistory = (): {
  data: Array<DetailedTransaction>
  error?: string
  loading: boolean
} => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe

  const transactions = useAppSelector((state) => selectAddedTxs(state, chainId, safeAddress), isEqual)
  const { data: executedTransactions, loading: executedTransactionsLoading } = useAppSelector(
    (state) => selectTxHistory(state),
    isEqual,
  )

  const [data, error, loading] = useAsync<Array<DetailedTransaction>>(
    async () => {
      if (!executedTransactions) {
        return []
      }

      const results: Array<DetailedTransaction | undefined> = await Promise.all(
        Object.values(executedTransactions)
          .map(async (executedTx) => {
            let txKey = getTxKeyFromTxId(executedTx.txId)
            if (!txKey) return

            const tx = transactions?.[txKey]

            if (!tx) {
              return partiallyDecodedTransaction(executedTx, safeAddress)
            }

            const details = await extractTxDetails(safeAddress, tx, safe)

            enrichTransactionDetailsFromHistory(details, executedTx)

            const transaction = makeTxFromDetails(details)

            return {
              ...transaction,
              details,
            }
          })
          .reverse(),
      )

      return results.filter(isDetailedTransactionListItem)
    },
    [safe, safeAddress, transactions, executedTransactions],
    false,
  )

  return {
    data: data ?? [],
    error: error?.message,
    loading: loading || executedTransactionsLoading,
  }
}

export default useTxHistory
