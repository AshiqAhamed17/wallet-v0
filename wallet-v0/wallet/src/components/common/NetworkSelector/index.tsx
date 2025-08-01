import ChainIndicator from '@/components/common/ChainIndicator'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import Link from 'next/link'
import type { SelectChangeEvent } from '@mui/material'
import { ListSubheader, MenuItem, Select, Skeleton } from '@mui/material'
import partition from 'lodash/partition'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useChains from '@/hooks/useChains'
import { useRouter } from 'next/router'
import css from './styles.module.css'
import { useChainId } from '@/hooks/useChainId'
import { type ReactElement, useMemo } from 'react'
import { useCallback } from 'react'
import { AppRoutes } from '@/config/routes'

const keepPathRoutes = [AppRoutes.welcome.index, AppRoutes.newSafe.load, AppRoutes.newSafe.create]

const NetworkSelector = (props: { onChainSelect?: () => void }): ReactElement => {
  const { configs } = useChains()
  const chainId = useChainId()
  const router = useRouter()

  const [testNets, prodNets] = useMemo(() => partition(configs, (config) => config.isTestnet ?? false), [configs])

  const getNetworkLink = useCallback(
    (shortName: string) => {
      const shouldKeepPath = keepPathRoutes.includes(router.pathname)

      const route = {
        pathname: shouldKeepPath ? router.pathname : '/',
        query: {
          chain: shortName,
        } as {
          chain: string
          safeViewRedirectURL?: string
        },
      }

      if (router.query?.safeViewRedirectURL) {
        route.query.safeViewRedirectURL = router.query?.safeViewRedirectURL.toString()
      }

      return route
    },
    [router],
  )

  const onChange = (event: SelectChangeEvent) => {
    event.preventDefault() // Prevent the link click

    const newChainId = event.target.value
    const shortName = configs.find((item) => item.chainId === newChainId)?.shortName

    if (shortName) {
      router.push(getNetworkLink(shortName))
    }
  }

  const renderMenuItem = useCallback(
    (value: string, chain: ChainInfo) => {
      return (
        <MenuItem key={value} value={value} className={css.menuItem}>
          <Link href={getNetworkLink(chain.shortName)} onClick={props.onChainSelect} className={css.item}>
            <ChainIndicator chainId={chain.chainId} inline />
          </Link>
        </MenuItem>
      )
    },
    [getNetworkLink, props.onChainSelect],
  )

  return configs.length ? (
    <Select
      value={chainId}
      onChange={onChange}
      size="small"
      className={css.select}
      variant="standard"
      IconComponent={ExpandMoreIcon}
      MenuProps={{
        transitionDuration: 0,
        MenuListProps: { component: undefined },
        sx: {
          '& .MuiPaper-root': {
            overflow: 'auto',
          },
        },
      }}
      sx={{
        '& .MuiSelect-select': {
          py: 0,
        },
      }}
    >
      {prodNets.map((chain) => renderMenuItem(chain.chainId, chain))}

      <ListSubheader className={css.listSubHeader}>Testnets</ListSubheader>

      {testNets.map((chain) => renderMenuItem(chain.chainId, chain))}
    </Select>
  ) : (
    <Skeleton width={94} height={31} sx={{ mx: 2 }} />
  )
}

export default NetworkSelector
