import { useEffect, useState } from 'react'
import { type TokenInfo } from '@uniswap/token-lists'
import { SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import { useCurrentChain } from '@/hooks/useChains'
import { Errors, logError } from '@/services/exceptions'
import { getAddress } from 'ethers/lib/utils'

const safeToken = {
  chainId: 1,
  address: SAFE_TOKEN_ADDRESSES['1'],
  name: 'Safe Token',
  symbol: 'SAFE',
  decimals: 18,
  logoURI: `https://safe-transaction-assets.safe.global/tokens/logos/${SAFE_TOKEN_ADDRESSES['1']}.png`,
}

export function useTokenList(tokenListURI: string, isTokenListEnabled: boolean): Array<TokenInfo> | undefined {
  const chain = useCurrentChain()

  const [tokenList, setTokenList] = useState<Array<TokenInfo>>()

  useEffect(() => {
    if (!chain || !isTokenListEnabled) {
      setTokenList(undefined)
      return
    }

    const chainId = parseInt(chain.chainId)

    fetch(tokenListURI)
      .then(async (response) => {
        if (response.ok) {
          const { tokens }: { tokens: TokenInfo[] } = await response.json()

          const tokenList = tokens
            .filter((token) => {
              const sameChainId = token.chainId === chainId
              const isSafeToken = getAddress(token.address) === getAddress(safeToken.address)
              return sameChainId && !isSafeToken
            })
            .map((token) => {
              return {
                ...token,
                address: getAddress(token.address),
              }
            })

          if (chainId === 1) tokenList.push(safeToken)

          setTokenList(tokenList)
        } else {
          const errorMessage = await response.text()
          return Promise.reject(new Error(errorMessage))
        }
      })
      .catch((err) => {
        logError(Errors._601, err.message)
        setTokenList(undefined)
      })
  }, [tokenListURI, chain, isTokenListEnabled])

  return tokenList
}
