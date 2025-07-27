import type { SyntheticEvent } from 'react'
import { type ReactElement, useContext } from 'react'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, Tooltip, SvgIcon } from '@mui/material'

import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo, type TransactionDetails } from '@/utils/transaction-guards'
import useIsPending from '@/hooks/useIsPending'
import RocketIcon from '@/public/images/transactions/rocket.svg'
import IconButton from '@mui/material/IconButton'
import { ReplaceTxHoverContext } from '../GroupedTxListItems/ReplaceTxHoverProvider'
import CheckWallet from '@/components/common/CheckWallet'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { getTxButtonTooltip } from '@/components/transactions/utils'
import { TxModalContext } from '@/components/tx-flow'
import { ConfirmTxFlow } from '@/components/tx-flow/flows'

const ExecuteTxButton = ({
  txSummary,
  txDetails,
  compact = false,
}: {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
  compact?: boolean
}): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)
  const { safe } = useSafeInfo()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const isPending = useIsPending(txSummary.id)
  const { setSelectedTxId } = useContext(ReplaceTxHoverContext)
  const safeSDK = useSafeSDK()

  const isNext = txNonce !== undefined && txNonce === safe.nonce
  const isDisabled = !isNext || isPending || !safeSDK

  const tooltipTitle = getTxButtonTooltip('Execute', { isNext, nonce: safe.nonce, hasSafeSDK: !!safeSDK })

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setTxFlow(<ConfirmTxFlow txSummary={txSummary} txDetails={txDetails} />, undefined, false)
  }

  const onMouseEnter = () => {
    setSelectedTxId(txSummary.id)
  }

  const onMouseLeave = () => {
    setSelectedTxId(undefined)
  }

  return (
    <>
      <CheckWallet allowNonOwner>
        {(isOk) =>
          compact ? (
            <Tooltip title={tooltipTitle} arrow placement="top">
              <span>
                <IconButton
                  onClick={onClick}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  color="primary"
                  disabled={!isOk || isDisabled}
                  size="small"
                >
                  <SvgIcon component={RocketIcon} inheritViewBox fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Button
              onClick={onClick}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              variant="contained"
              disabled={!isOk || isDisabled}
              size="stretched"
            >
              Execute
            </Button>
          )
        }
      </CheckWallet>
    </>
  )
}

export default ExecuteTxButton
