import { type ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'

import useSafeInfo from '@/hooks/useSafeInfo'
import SafeIcon from '@/components/common/SafeIcon'
import NewTxButton from '@/components/sidebar/NewTxButton'
import { useAppSelector } from '@/store'

import css from './styles.module.css'
import QrIconBold from '@/public/images/sidebar/qr-bold.svg'
import CopyIconBold from '@/public/images/sidebar/copy-bold.svg'
import LinkIconBold from '@/public/images/sidebar/link-bold.svg'

import { selectSettings } from '@/store/settingsSlice'
import { useCurrentChain } from '@/hooks/useChains'
import { getBlockExplorerLink } from '@/utils/chains'
import EthHashInfo from '@/components/common/EthHashInfo'
import QrCodeButton from '../QrCodeButton'
import { SvgIcon } from '@mui/material'
import useSafeAddress from '@/hooks/useSafeAddress'
import ExplorerButton from '@/components/common/ExplorerButton'
import CopyTooltip from '@/components/common/CopyTooltip'

const SafeHeader = (): ReactElement => {
  const safeAddress = useSafeAddress()
  const { safe } = useSafeInfo()
  const { threshold, owners } = safe
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)

  const addressCopyText = settings.shortName.copy && chain ? `${chain.shortName}:${safeAddress}` : safeAddress

  const blockExplorerLink = chain ? getBlockExplorerLink(chain, safeAddress) : undefined

  return (
    <div className={css.container}>
      <div className={css.info}>
        <div data-testid="safe-header-info" className={css.safe}>
          <div>
            {safeAddress ? (
              <SafeIcon address={safeAddress} threshold={threshold} owners={owners?.length} />
            ) : (
              <Skeleton variant="circular" width={40} height={40} />
            )}
          </div>

          <div className={css.address}>
            {safeAddress ? (
              <EthHashInfo address={safeAddress} shortAddress showAvatar={false} />
            ) : (
              <Typography variant="body2">
                <Skeleton variant="text" width={86} />
                <Skeleton variant="text" width={120} />
              </Typography>
            )}
          </div>
        </div>

        <div className={css.iconButtons}>
          <QrCodeButton>
            <Tooltip title="Open QR code" placement="top">
              <IconButton className={css.iconButton}>
                <SvgIcon component={QrIconBold} inheritViewBox color="primary" fontSize="small" />
              </IconButton>
            </Tooltip>
          </QrCodeButton>

          <CopyTooltip text={addressCopyText}>
            <IconButton className={css.iconButton}>
              <SvgIcon component={CopyIconBold} inheritViewBox color="primary" fontSize="small" />
            </IconButton>
          </CopyTooltip>

          <ExplorerButton {...blockExplorerLink} className={css.iconButton} icon={LinkIconBold} />
        </div>
      </div>

      <NewTxButton />
    </div>
  )
}

export default SafeHeader
