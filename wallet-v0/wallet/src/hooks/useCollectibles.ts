import { useMemo } from 'react'
import type { SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { selectCollectibleBalances } from '@/store/collectiblesBalancesSlice'
import { useAppSelector } from '@/store'
import { isEqual } from 'lodash'

export const useCollectibles = (): [Array<SafeCollectibleResponse>, string | undefined, boolean] => {
  const { data, error, loading } = useAppSelector(selectCollectibleBalances, isEqual)

  return useMemo(() => [data ?? [], error, loading || data === undefined], [data, error, loading])
}

export default useCollectibles
