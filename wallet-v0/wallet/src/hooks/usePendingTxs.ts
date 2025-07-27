import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { selectPendingTxIdsBySafe } from '@/store/pendingTxsSlice'
import useSafeInfo from './useSafeInfo'

const usePendingTxIds = (): Array<TransactionSummary['id']> => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId } = safe
  return useAppSelector((state) => selectPendingTxIdsBySafe(state, chainId, safeAddress))
}

export const useHasPendingTxs = (): boolean => {
  const pendingIds = usePendingTxIds()
  return pendingIds.length > 0
}
