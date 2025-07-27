import type { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import { ethers } from 'ethers'
import { createSafeClient } from './safeClient'

export interface TransactionData {
  to: string
  value: string
  data: string
  operation?: number
  safeTxGas?: string
  baseGas?: string
  gasPrice?: string
  gasToken?: string
  refundReceiver?: string
  nonce?: number
}

export interface SignatureData {
  safeTxHash: string
  signatures: string[]
  txData: TransactionData
  safeAddress: string
  chainId: string
}

export class TransactionHelper {
  private safeClient: any

  constructor(rpcUrl: string, signer: ethers.Signer) {
    this.safeClient = createSafeClient(rpcUrl, signer)
  }

  async createSafeTransaction(safeAddress: string, transactionData: TransactionData) {
    const safeTransactionData: SafeTransactionDataPartial = {
      to: transactionData.to,
      value: transactionData.value,
      data: transactionData.data,
      operation: transactionData.operation || 0,
      safeTxGas: transactionData.safeTxGas || '0',
      baseGas: transactionData.baseGas || '0',
      gasPrice: transactionData.gasPrice || '0',
      gasToken: transactionData.gasToken || ethers.constants.AddressZero,
      refundReceiver: transactionData.refundReceiver || ethers.constants.AddressZero,
      nonce: transactionData.nonce,
    }

    return await this.safeClient.createTransaction(safeAddress, safeTransactionData)
  }

  async signSafeTransaction(safeTxHash: string, safeAddress: string) {
    return await this.safeClient.signTransaction(safeTxHash, safeAddress)
  }

  async executeSafeTransaction(safeTxHash: string, safeAddress: string) {
    return await this.safeClient.executeTransaction(safeTxHash, safeAddress)
  }

  async getTransactionHash(safeTransaction: any) {
    return await this.safeClient.getTransactionHash(safeTransaction)
  }

  validateTransactionData(data: TransactionData): boolean {
    if (!ethers.utils.isAddress(data.to)) {
      throw new Error('Invalid recipient address')
    }
    if (!ethers.BigNumber.isBigNumber(ethers.BigNumber.from(data.value))) {
      throw new Error('Invalid value')
    }
    return true
  }
}

export const createTransactionHelper = (rpcUrl: string, signer: ethers.Signer) => {
  return new TransactionHelper(rpcUrl, signer)
}
