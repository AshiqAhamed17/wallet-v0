import { type ReactElement, useContext, useEffect } from 'react'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import {
  isExecutable,
  isMultisigExecutionInfo,
  isSignableBy,
  type TransactionDetails,
} from '@/utils/transaction-guards'
import { Typography } from '@mui/material'
import { createExistingTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../../SafeTxProvider'

type ConfirmProposedTxProps = {
  txSummary: TransactionSummary
  txDetails: TransactionDetails
}

const SIGN_TEXT = 'Sign this transaction.'
const EXECUTE_TEXT = 'Submit the form to execute this transaction.'
const SIGN_EXECUTE_TEXT = 'Sign or immediately execute this transaction.'

const ConfirmProposedTx = ({ txSummary, txDetails }: ConfirmProposedTxProps): ReactElement => {
  const wallet = useWallet()
  const { safe, safeAddress } = useSafeInfo()
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)

  const txId = txSummary.id
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const canExecute = isExecutable(txSummary, wallet?.address || '', safe)
  const canSign = isSignableBy(txSummary, wallet?.address || '')

  useEffect(() => {
    txNonce && setNonce(txNonce)
  }, [setNonce, txNonce])

  useEffect(() => {
    createExistingTx(safeAddress, txDetails).then(setSafeTx).catch(setSafeTxError)
  }, [safeAddress, txDetails, setSafeTx, setSafeTxError])

  const text = canSign ? (canExecute ? SIGN_EXECUTE_TEXT : SIGN_TEXT) : EXECUTE_TEXT

  return (
    <SignOrExecuteForm txId={txId} isExecutable={canExecute} onlyExecute={!canSign} txDetails={txDetails}>
      <Typography mb={2}>{text}</Typography>
    </SignOrExecuteForm>
  )
}

export default ConfirmProposedTx
