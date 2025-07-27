import { useEffect } from 'react'
import { getERC721TokenInfoOnChain, isERC721Token } from '@/utils/tokens'
import { Errors, logError } from '@/services/exceptions'
import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import { type TokenInfo, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isAddress } from 'ethers/lib/utils'

export function useCollectible(token: string): AsyncResult<Omit<TokenInfo, 'logoUri' | 'decimals'>> {
  const { safe } = useSafeInfo()
  const chainId = safe.chainId

  const [data, error, loading] = useAsync<Omit<TokenInfo, 'logoUri' | 'decimals'> | undefined>(
    async () => {
      if (!token || !isAddress(token) || !chainId) return

      if (!(await isERC721Token(token))) throw new Error('The address you have provided is not an ERC721 token.')

      try {
        return await getERC721TokenInfoOnChain(token)
      } catch (e) {
        // Not all ERC721 tokens have metadata
        return {
          address: token,
          symbol: '',
          name: '',
          type: TokenType.ERC721,
        }
      }
    },
    [chainId, token],
    true,
  )

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._604, error.message)
    }
  }, [error])

  return [data, error, loading]
}
