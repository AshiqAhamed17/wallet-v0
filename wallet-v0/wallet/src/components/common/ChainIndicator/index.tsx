import { getChainLogo } from '@/config/chains'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectChainById, selectChains } from '@/store/chainsSlice'
import { Skeleton } from '@mui/material'
import classnames from 'classnames'
import isEmpty from 'lodash/isEmpty'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import css from './styles.module.css'

type ChainIndicatorProps = {
  chainId?: string
  inline?: boolean
  className?: string
  showUnknown?: boolean
  showLogo?: boolean
}

const fallbackChainConfig = {
  chainName: 'Unknown chain',
  chainId: '-1',
  theme: {
    backgroundColor: '#ddd',
    textColor: '#000',
  },
  nativeCurrency: {
    logoUri: '',
  },
}

const ChainIndicator = ({
  chainId,
  className,
  inline = false,
  showUnknown = true,
  showLogo = true,
}: ChainIndicatorProps): ReactElement | null => {
  const currentChainId = useChainId()
  const id = chainId || currentChainId
  const chains = useAppSelector(selectChains)
  const chainConfig =
    useAppSelector((state: any) => selectChainById(state, id)) || (showUnknown ? fallbackChainConfig : null)
  const noChains = isEmpty(chains?.data)

  const style = useMemo(() => {
    if (!chainConfig) return
    const { theme } = chainConfig as any

    return {
      backgroundColor: theme.backgroundColor,
      color: theme.textColor,
    }
  }, [chainConfig])

  return noChains ? (
    <Skeleton width="100%" height="22px" variant="rectangular" sx={{ flexShrink: 0 }} />
  ) : chainConfig ? (
    <span
      style={showLogo ? undefined : style}
      className={classnames(inline ? css.inlineIndicator : css.indicator, showLogo ? css.withLogo : '', className)}
    >
      {showLogo && (
        <img
          src={
            'chainId' in chainConfig
              ? getChainLogo(
                  chainConfig.chainId,
                  typeof chainConfig.nativeCurrency === 'object' && chainConfig.nativeCurrency !== null
                    ? (chainConfig.nativeCurrency as { logoUri: string }).logoUri
                    : '',
                )
              : ''
          }
          alt={'chainName' in chainConfig ? `${chainConfig.chainName} Logo` : 'Chain Logo'}
          width={24}
          height={24}
          loading="lazy"
        />
      )}

      {'chainName' in chainConfig ? chainConfig.chainName : ''}
    </span>
  ) : null
}

export default ChainIndicator
