import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/protocol-kit'
import { EthersAdapter } from '@safe-global/protocol-kit'
import { ethers } from 'ethers'
import { isWalletRejection, isHardwareWallet } from '@/utils/wallets'
import { OperationType, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { SAFE_FEATURES } from '@safe-global/protocol-kit/dist/src/utils'
import { hasSafeFeature } from '@/utils/safe-versions'
import { createWeb3 } from '@/hooks/wallets/web3'
import { hexValue } from 'ethers/lib/utils'
import { connectWallet, getConnectedWallet } from '@/hooks/wallets/useOnboard'
import { type OnboardAPI } from '@web3-onboard/core'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import type { JsonRpcSigner } from '@ethersproject/providers'
import { asError } from '@/services/exceptions/utils'
import { EternalSafeTransaction } from '@/store/addedTxsSlice'

export const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error(
      'The Safe SDK could not be initialized. Please be aware that we only support v1.0.0 Safe Accounts and up.',
    )
  }
  return safeSDK
}

export const switchWalletChain = async (onboard: OnboardAPI, chainId: string): Promise<ConnectedWallet | null> => {
  const currentWallet = getConnectedWallet(onboard.state.get().wallets)

  if (!currentWallet) {
    return null
  }

  if (isHardwareWallet(currentWallet)) {
    await onboard.disconnectWallet({ label: currentWallet.label })
    const wallets = await connectWallet(onboard, { autoSelect: currentWallet.label })

    return wallets ? getConnectedWallet(wallets) : null
  }

  const didSwitch = await onboard.setChain({ chainId: hexValue(parseInt(chainId)) })
  if (!didSwitch) {
    return currentWallet
  }

  /**
   * Onboard doesn't update immediately and otherwise returns a stale wallet if we directly get its state
   */
  return new Promise((resolve) => {
    const source$ = onboard.state.select('wallets').subscribe((newWallets) => {
      const newWallet = getConnectedWallet(newWallets)
      if (newWallet && newWallet.chainId === chainId) {
        source$.unsubscribe()
        resolve(newWallet)
      }
    })
  })
}

export const assertWalletChain = async (onboard: OnboardAPI, chainId: string): Promise<ConnectedWallet> => {
  const wallet = getConnectedWallet(onboard.state.get().wallets)

  if (!wallet) {
    throw new Error('No wallet connected.')
  }

  if (wallet.chainId === chainId) {
    return wallet
  }

  const newWallet = await switchWalletChain(onboard, chainId)

  if (!newWallet) {
    throw new Error('No wallet connected.')
  }

  if (newWallet.chainId !== chainId) {
    throw new Error('Wallet connected to wrong chain.')
  }

  return newWallet
}

export const getAssertedChainSigner = async (
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
): Promise<JsonRpcSigner> => {
  const wallet = await assertWalletChain(onboard, chainId)
  const provider = createWeb3(wallet.provider)
  return provider.getSigner()
}

/**
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner
 * This resolves the promise sooner when executing a tx and mocks
 * most of the values of transactionResponse which is needed when
 * dealing with smart-contract wallet owners
 */
export const getUncheckedSafeSDK = async (onboard: OnboardAPI, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const signer = await getAssertedChainSigner(onboard, chainId)
  const sdk = getAndValidateSafeSDK()

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer.connectUnchecked(),
  })

  return sdk.connect({ ethAdapter })
}

export const getSafeSDKWithSigner = async (onboard: OnboardAPI, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const signer = await getAssertedChainSigner(onboard, chainId)
  const sdk = getAndValidateSafeSDK()

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })

  return sdk.connect({ ethAdapter })
}

type SigningMethods = Parameters<Safe['signTransaction']>[1]

export const getSupportedSigningMethods = (safeVersion: SafeInfo['version']): SigningMethods[] => {
  const ETH_SIGN_TYPED_DATA: SigningMethods = 'eth_signTypedData'
  const ETH_SIGN: SigningMethods = 'eth_sign'

  if (!hasSafeFeature(SAFE_FEATURES.ETH_SIGN, safeVersion)) {
    return [ETH_SIGN_TYPED_DATA]
  }

  return [ETH_SIGN_TYPED_DATA, ETH_SIGN]
}

export const tryOffChainTxSigning = async (
  safeTx: EternalSafeTransaction | SafeTransaction,
  safeVersion: SafeInfo['version'],
  sdk: Safe,
): Promise<EternalSafeTransaction | SafeTransaction> => {
  const signingMethods = getSupportedSigningMethods(safeVersion)

  for await (const [i, signingMethod] of signingMethods.entries()) {
    try {
      let signedTx = await sdk.signTransaction(safeTx, signingMethod)
      if (safeTx instanceof EternalSafeTransaction) {
        ;(signedTx as EternalSafeTransaction).timestamp = safeTx.timestamp
      }
      return signedTx
    } catch (error) {
      const isLastSigningMethod = i === signingMethods.length - 1

      if (isWalletRejection(asError(error)) || isLastSigningMethod) {
        throw error
      }
    }
  }

  // Won't be reached, but TS otherwise complains
  throw new Error('No supported signing methods')
}

export const isDelegateCall = (safeTx: SafeTransaction): boolean => {
  return safeTx.data.operation === OperationType.DelegateCall
}
