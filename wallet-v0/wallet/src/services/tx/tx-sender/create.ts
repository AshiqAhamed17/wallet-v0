import type { TransactionDetails } from '@/utils/transaction-guards'
import type { AddOwnerTxParams, RemoveOwnerTxParams, SwapOwnerTxParams } from '@safe-global/protocol-kit'
import type { MetaTransactionData, SafeTransaction, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import extractTxInfo from '../extractTxInfo'
import { getAndValidateSafeSDK } from './sdk'

/**
 * Create a transaction from raw params
 */
export const createTx = async (txParams: SafeTransactionDataPartial, nonce?: number): Promise<SafeTransaction> => {
  if (nonce !== undefined) txParams = { ...txParams, nonce }
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createTransaction({ safeTransactionData: txParams })
}

/**
 * Create a multiSendCallOnly transaction from an array of MetaTransactionData and options
 * If only one tx is passed it will be created without multiSend and without onlyCalls.
 */
export const createMultiSendCallOnlyTx = async (txParams: MetaTransactionData[]): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createTransaction({ safeTransactionData: txParams, onlyCalls: true })
}

export const createRemoveOwnerTx = async (txParams: RemoveOwnerTxParams): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createRemoveOwnerTx(txParams)
}

export const createAddOwnerTx = async (txParams: AddOwnerTxParams): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createAddOwnerTx(txParams)
}

export const createSwapOwnerTx = async (txParams: SwapOwnerTxParams): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createSwapOwnerTx(txParams)
}

export const createUpdateThresholdTx = async (threshold: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createChangeThresholdTx(threshold)
}

export const createRemoveModuleTx = async (moduleAddress: string): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createDisableModuleTx(moduleAddress)
}

export const createRemoveGuardTx = async (): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createDisableGuardTx()
}

/**
 * Create a rejection tx
 */
export const createRejectTx = async (nonce: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createRejectionTransaction(nonce)
}

/**
 * Prepare a SafeTransaction from Client Gateway / Tx Queue
 */
export const createExistingTx = async (
  safeAddress: string,
  txDetails: TransactionDetails,
): Promise<SafeTransaction> => {
  // Convert them to the Core SDK tx params
  const { txParams, signatures } = extractTxInfo(txDetails, safeAddress)

  // Create a tx and add pre-approved signatures
  const safeTx = await createTx(txParams, txParams.nonce)
  Object.entries(signatures).forEach(([signer, data]) => {
    safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
  })

  return safeTx
}
