import React, { type ReactElement } from 'react'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import { Box } from '@mui/material'

import TxSigners from '@/components/transactions/TxSigners'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData from '@/components/transactions/TxDetails/TxData'
import {
  isAwaitingExecution,
  isModuleExecutionInfo,
  isMultiSendTxInfo,
  isMultisigDetailedExecutionInfo,
  isMultisigExecutionInfo,
  isTxQueued,
  type TransactionDetails,
} from '@/utils/transaction-guards'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'
import TxShareLink from '../TxShareLink'
import { ErrorBoundary } from '@sentry/react'
import ExecuteTxButton from '@/components/transactions/ExecuteTxButton'
import SignTxButton from '@/components/transactions/SignTxButton'
import RejectTxButton from '@/components/transactions/RejectTxButton'
import { DelegateCallWarning, UnsignedWarning } from '@/components/transactions/Warning'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import useIsPending from '@/hooks/useIsPending'
import { isTrustedTx } from '@/utils/transactions'
import { useSafeTransactionFromDetails } from '@/hooks/useConvertTx'

export const NOT_AVAILABLE = 'n/a'

type TxDetailsProps = {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
}

const TxDetailsBlock = ({ txSummary, txDetails }: TxDetailsProps): ReactElement => {
  const isPending = useIsPending(txSummary.id)
  const isQueue = isTxQueued(txSummary.txStatus)
  const awaitingExecution = isAwaitingExecution(txSummary.txStatus)
  const isUnsigned =
    isMultisigExecutionInfo(txSummary.executionInfo) && txSummary.executionInfo.confirmationsSubmitted === 0

  const isUntrusted =
    isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo) &&
    txDetails.detailedExecutionInfo.trusted === false

  const isTrustedTransfer = isTrustedTx(txSummary)

  const safeTx = useSafeTransactionFromDetails(txDetails)

  return (
    <>
      {/* /Details */}
      <div className={`${css.details} ${isUnsigned ? css.noSigners : ''}`}>
        {safeTx && txDetails.txData && (
          <div className={css.shareLink}>
            <TxShareLink safeTx={safeTx} />
          </div>
        )}

        <div className={css.txData}>
          <ErrorBoundary fallback={<div>Error parsing data</div>}>
            <TxData txDetails={txDetails} trusted={isTrustedTransfer} />
          </ErrorBoundary>
        </div>

        {/* Module information*/}
        {isModuleExecutionInfo(txSummary.executionInfo) && (
          <div className={css.txModule}>
            <InfoDetails title="Module:">
              <EthHashInfo
                address={txSummary.executionInfo.address.value}
                shortAddress={false}
                showCopyButton
                hasExplorer
              />
            </InfoDetails>
          </div>
        )}

        <div className={css.txSummary}>
          {isUntrusted && !isPending && <UnsignedWarning />}

          {txDetails.txData?.operation === Operation.DELEGATE && (
            <div className={css.delegateCall}>
              <DelegateCallWarning showWarning={!txDetails.txData.trustedDelegateCallTarget} />
            </div>
          )}
          <Summary txDetails={txDetails} />
        </div>

        {isMultiSendTxInfo(txDetails.txInfo) && (
          <div className={`${css.multiSend}`}>
            <ErrorBoundary fallback={<div>Error parsing data</div>}>
              <Multisend txData={txDetails.txData} />
            </ErrorBoundary>
          </div>
        )}
      </div>

      {/* Signers */}
      {!isUnsigned && (
        <div className={css.txSigners}>
          <TxSigners txDetails={txDetails} txSummary={txSummary} />
          {isQueue && (
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
              {awaitingExecution ? (
                <ExecuteTxButton txSummary={txSummary} txDetails={txDetails} />
              ) : (
                <SignTxButton txSummary={txSummary} txDetails={txDetails} />
              )}
              <RejectTxButton txSummary={txSummary} />
            </Box>
          )}
        </div>
      )}
    </>
  )
}

const TxDetails = ({
  txSummary,
  txDetails,
}: {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
}): ReactElement => {
  return (
    <div className={css.container}>
      <TxDetailsBlock txSummary={txSummary} txDetails={txDetails} />
    </div>
  )
}

export default TxDetails
