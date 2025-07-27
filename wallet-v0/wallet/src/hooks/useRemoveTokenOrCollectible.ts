import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import { remove as removeToken } from '@/store/customTokensSlice'
import { remove as removeCollectible } from '@/store/customCollectiblesSlice'
import { useCallback, useState } from 'react'

// This is the default for MUI Collapse
export const COLLAPSE_TIMEOUT_MS = 300

export const useRemoveToken = () => useRemoveTokenOrCollectible('token')

export const useRemoveCollectible = () => useRemoveTokenOrCollectible('collectible')

export const useRemoveTokenOrCollectible = (variant: 'token' | 'collectible') => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()

  const [removing, setRemoving] = useState<string>()

  const remove = useCallback(
    (address: string) => {
      const removeFunction = variant === 'token' ? removeToken : removeCollectible
      setRemoving(address)
      setTimeout(() => {
        dispatch(removeFunction([chainId, address]))
        setRemoving(undefined)
      }, COLLAPSE_TIMEOUT_MS)
    },
    [chainId, dispatch, variant],
  )

  return {
    remove,
    removing,
  }
}
