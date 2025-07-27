import { Alert, Grid, Typography } from '@mui/material'
import { BigNumber } from 'ethers'
import { useContext, useEffect, useMemo, useState } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import SpendingLimitLabel from '@/components/common/SpendingLimitLabel'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useBalances from '@/hooks/useBalances'
import useChainId from '@/hooks/useChainId'
import { createNewSpendingLimitTx } from '@/services/tx/tx-sender'
import { useSettingsStore } from '@/state/settingsStore'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { formatVisualAmount } from '@/utils/formatters'
import type { NewSpendingLimitFlowProps } from '.'
import { SafeTxContext } from '../../SafeTxProvider'

export const ReviewSpendingLimit = ({ params }: { params: NewSpendingLimitFlowProps }) => {
  const [existingSpendingLimit, setExistingSpendingLimit] = useState<SpendingLimitState>()
  const spendingLimits = useSettingsStore((state) => state.spendingLimits)
  const chainId = useChainId()
  const { balances } = useBalances()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const token = balances.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals } = token?.tokenInfo || {}

  useEffect(() => {
    const existingSpendingLimit = spendingLimits.find(
      (spendingLimit) =>
        spendingLimit.beneficiary === params.beneficiary && spendingLimit.token.address === params.tokenAddress,
    )
    setExistingSpendingLimit(existingSpendingLimit)
  }, [spendingLimits, params])

  useEffect(() => {
    createNewSpendingLimitTx(params, spendingLimits, chainId, decimals, existingSpendingLimit)
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [chainId, decimals, existingSpendingLimit, params, setSafeTx, setSafeTxError, spendingLimits])

  const isOneTime = params.resetTime === '0'
  const resetTime = useMemo(() => {
    return isOneTime
      ? 'One-time spending limit'
      : getResetTimeOptions(chainId).find((time) => time.value === params.resetTime)?.label
  }, [isOneTime, params.resetTime, chainId])

  const existingAmount = existingSpendingLimit
    ? formatVisualAmount(BigNumber.from(existingSpendingLimit?.amount), decimals)
    : undefined

  const oldResetTime = existingSpendingLimit
    ? getResetTimeOptions(chainId).find((time) => time.value === existingSpendingLimit?.resetTimeMin)?.label
    : undefined

  return (
    <SignOrExecuteForm>
      {token && (
        <SendAmountBlock amount={params.amount} tokenInfo={token.tokenInfo} title="Amount">
          {existingAmount && existingAmount !== params.amount && (
            <>
              <Typography color="error" sx={{ textDecoration: 'line-through' }} component="span">
                {existingAmount}
              </Typography>
              {'→'}
            </>
          )}
        </SendAmountBlock>
      )}

      <Grid container gap={1} alignItems="center">
        <Grid item md>
          <Typography variant="body2" color="text.secondary">
            Beneficiary
          </Typography>
        </Grid>

        <Grid item md={10}>
          <EthHashInfo
            address={params.beneficiary}
            shortAddress={false}
            hasExplorer
            showCopyButton
            showAvatar={false}
          />
        </Grid>
      </Grid>

      <Grid container gap={1} alignItems="center">
        <Grid item md>
          <Typography variant="body2" color="text.secondary">
            Reset time
          </Typography>
        </Grid>
        <Grid item md={10}>
          {existingSpendingLimit ? (
            <>
              <SpendingLimitLabel
                label={
                  <>
                    {existingSpendingLimit.resetTimeMin !== params.resetTime && (
                      <>
                        <Typography
                          color="error"
                          sx={{ textDecoration: 'line-through' }}
                          display="inline"
                          component="span"
                        >
                          {oldResetTime}
                        </Typography>
                        {' → '}
                      </>
                    )}
                    <Typography display="inline" component="span">
                      {resetTime}
                    </Typography>
                  </>
                }
                isOneTime={existingSpendingLimit.resetTimeMin === '0'}
              />
            </>
          ) : (
            <SpendingLimitLabel label={resetTime || 'One-time spending limit'} isOneTime={!!resetTime && isOneTime} />
          )}
        </Grid>
      </Grid>
      {existingSpendingLimit && (
        <Alert severity="warning" sx={{ border: 'unset' }}>
          <Typography fontWeight={700}>You are about to replace an existing spending limit</Typography>
        </Alert>
      )}
    </SignOrExecuteForm>
  )
}
