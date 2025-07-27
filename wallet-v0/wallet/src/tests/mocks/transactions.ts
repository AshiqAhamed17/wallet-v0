import { addressEx } from '@/utils/addresses'
import type { DetailedTransaction, TransactionDetails } from '@/utils/transaction-guards'
import {
  type AddressEx,
  ConflictType,
  DetailedExecutionInfoType,
  type MultisigExecutionInfo,
  type Transaction,
  type TransactionInfo,
  TransactionInfoType,
  TransactionListItemType,
  TransactionStatus,
  type TransactionSummary,
  TransactionTokenType,
  TransferDirection,
  type TransferInfo,
} from '@safe-global/safe-gateway-typescript-sdk'

const mockAddressEx: AddressEx = {
  value: 'string',
}

const mockTransferInfo: TransferInfo = {
  type: TransactionTokenType.ERC20,
  tokenAddress: 'string',
  value: 'string',
  trusted: true,
}

const mockTxInfo: TransactionInfo = {
  type: TransactionInfoType.TRANSFER,
  sender: mockAddressEx,
  recipient: mockAddressEx,
  direction: TransferDirection.OUTGOING,
  transferInfo: mockTransferInfo,
}

const mockTxDetails: TransactionDetails = {
  safeAddress: '',
  txId: '',
  txStatus: TransactionStatus.AWAITING_CONFIRMATIONS,
  txInfo: {
    type: TransactionInfoType.CUSTOM,
    to: addressEx('0x'),
    dataSize: '0',
    value: '0',
    isCancellation: false,
  },
  detailedExecutionInfo: {
    type: DetailedExecutionInfoType.MULTISIG,
    submittedAt: 0,
    nonce: 0,
    safeTxGas: '',
    baseGas: '',
    gasPrice: '',
    gasToken: '',
    refundReceiver: addressEx('0x'),
    safeTxHash: '',
    signers: [],
    confirmationsRequired: 0,
    confirmations: [],
    trusted: true,
  },
}

export const defaultTx: TransactionSummary = {
  id: '',
  timestamp: 0,
  txInfo: mockTxInfo,
  txStatus: TransactionStatus.AWAITING_CONFIRMATIONS,
  executionInfo: {
    type: DetailedExecutionInfoType.MULTISIG,
    nonce: 1,
    confirmationsRequired: 2,
    confirmationsSubmitted: 2,
  },
}

export const getMockTx = ({ nonce }: { nonce?: number }): Transaction => {
  return {
    transaction: {
      ...defaultTx,
      executionInfo: {
        ...defaultTx.executionInfo,
        nonce: nonce ?? (defaultTx.executionInfo as MultisigExecutionInfo).nonce,
      } as MultisigExecutionInfo,
    },
    type: TransactionListItemType.TRANSACTION,
    conflictType: ConflictType.NONE,
  }
}

export const getMockDetailedTx = ({ nonce }: { nonce?: number }): DetailedTransaction => {
  return {
    transaction: {
      ...defaultTx,
      executionInfo: {
        ...defaultTx.executionInfo,
        nonce: nonce ?? (defaultTx.executionInfo as MultisigExecutionInfo).nonce,
      } as MultisigExecutionInfo,
    },
    type: TransactionListItemType.TRANSACTION,
    conflictType: ConflictType.NONE,
    details: {
      ...mockTxDetails,
      detailedExecutionInfo: {
        ...mockTxDetails.detailedExecutionInfo,
        nonce: nonce ?? mockTxDetails.detailedExecutionInfo.nonce,
      },
    },
  }
}
