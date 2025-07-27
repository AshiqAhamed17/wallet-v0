import madProps from '@/utils/mad-props'
import { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { CircularProgress, Box, Button, CardActions, Divider } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import CheckWallet from '@/components/common/CheckWallet'
import { useAlreadySigned, useTxActions } from './hooks'
import type { SignOrExecuteProps } from '.'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { TxModalContext } from '@/components/tx-flow'
import { asError } from '@/services/exceptions/utils'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'

export const SignForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  isOwner,
  txActions,
}: SignOrExecuteProps & {
  isOwner: ReturnType<typeof useIsSafeOwner>
  txActions: ReturnType<typeof useTxActions>
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const { signTx } = txActions
  const { setTxFlow } = useContext(TxModalContext)
  const hasSigned = useAlreadySigned(safeTx)

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    if (!safeTx) return

    setIsSubmittable(false)
    setSubmitError(undefined)

    let resultTxId: string
    try {
      resultTxId = await signTx(safeTx, txId)
    } catch (_err) {
      const err = asError(_err)
      trackError(Errors._805, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    // On successful sign
    onSubmit?.(resultTxId)

    setTxFlow(undefined)
  }

  const cannotPropose = !isOwner
  const submitDisabled = !safeTx || !isSubmittable || disableSubmit || cannotPropose

  return (
    <form onSubmit={handleSubmit}>
      {hasSigned && <ErrorMessage level="warning">You have already signed this transaction.</ErrorMessage>}

      {cannotPropose ? (
        <NonOwnerError />
      ) : (
        submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )
      )}

      <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

      <CardActions>
        <Box display="flex" gap={2}>
          {/* Batch button */}
          {/* TOOD(devanon): Re-introduce batching */}
          {/* {isCreation && !isBatch && (
            <BatchButton
              onClick={onBatchClick}
              disabled={submitDisabled || !isBatchable}
              tooltip={!isBatchable ? `Cannot batch this type of transaction` : undefined}
            />
          )} */}

          {/* Submit button */}
          <CheckWallet>
            {(isOk) => (
              <Button
                data-testid="sign-btn"
                variant="contained"
                type="submit"
                disabled={!isOk || submitDisabled}
                sx={{ minWidth: '82px' }}
              >
                {!isSubmittable ? <CircularProgress size={20} /> : 'Sign'}
              </Button>
            )}
          </CheckWallet>
        </Box>
      </CardActions>
    </form>
  )
}

export default madProps(SignForm, {
  isOwner: useIsSafeOwner,
  txActions: useTxActions,
})
