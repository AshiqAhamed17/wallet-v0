import { useMemo } from 'react'
import isEqual from 'lodash/isEqual'
import { useAppSelector } from '@/store'
import { selectBalances } from '@/store/balancesSlice'
import type { TokenItem } from '@/hooks/loadables/useLoadBalances'

const useBalances = (): {
  balances: Array<TokenItem>
  loading: boolean
  error?: string
} => {
  const { data, error, loading } = useAppSelector(selectBalances, isEqual)

  return useMemo(
    () => ({
      balances: data ?? [],
      error,
      loading: loading || data == undefined,
    }),
    [data, error, loading],
  )
}

export default useBalances
