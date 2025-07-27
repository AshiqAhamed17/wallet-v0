import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import type { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
import { ethers } from 'ethers'

export interface SafeInfo {
  chainId: string
  address: string
  name?: string
  owners?: string[]
  threshold?: number
}

export class SafeClient {
  private provider: ethers.providers.JsonRpcProvider
  private signer: ethers.Signer

  constructor(rpcUrl: string, signer: ethers.Signer) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    this.signer = signer
  }

  async getSafeInstance(safeAddress: string): Promise<Safe> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signer,
    })

    return Safe.create({
      ethAdapter,
      safeAddress,
    })
  }

  async validateSafe(safeAddress: string): Promise<SafeInfo> {
    try {
      const safe = await this.getSafeInstance(safeAddress)
      const owners = await safe.getOwners()
      const threshold = await safe.getThreshold()

      return {
        address: safeAddress,
        chainId: (await this.provider.getNetwork()).chainId.toString(),
        owners: owners.map((owner) => owner.toLowerCase()),
        threshold: threshold.toNumber(),
      }
    } catch (error) {
      throw new Error(`Invalid Safe address: ${error}`)
    }
  }

  async createTransaction(safeAddress: string, transactionData: SafeTransactionDataPartial) {
    const safe = await this.getSafeInstance(safeAddress)
    return await safe.createTransaction(transactionData)
  }

  async signTransaction(safeTxHash: string, safeAddress: string) {
    const safe = await this.getSafeInstance(safeAddress)
    return await safe.signTransaction(safeTxHash)
  }

  async executeTransaction(safeTxHash: string, safeAddress: string) {
    const safe = await this.getSafeInstance(safeAddress)
    return await safe.executeTransaction(safeTxHash)
  }

  async getTransactionHash(safeTransaction: any) {
    const safe = await this.getSafeInstance(safeTransaction.safe)
    return await safe.getTransactionHash(safeTransaction)
  }
}

export const createSafeClient = (rpcUrl: string, signer: ethers.Signer) => {
  return new SafeClient(rpcUrl, signer)
}
