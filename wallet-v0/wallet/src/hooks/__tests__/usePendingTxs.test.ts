import { type PendingTx } from '@/store/pendingTxsSlice'
import { renderHook } from '@/tests/test-utils'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import { useHasPendingTxs } from '../usePendingTxs'

// Mock getTransactionQueue
jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
  getTransactionQueue: () =>
    Promise.resolve({
      next: null,
      previous: null,
      results: [
        {
          type: 'LABEL',
          label: 'Next',
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 'multisig_123',
          },
        },
        {
          type: 'TRANSACTION',
          transaction: {
            id: 'multisig_456',
          },
        },
      ],
    }),
}))

describe('useHasPendingTxs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        nonce: 100,
        threshold: 1,
        owners: [{ value: '0x123' }],
        chainId: '5',
      } as SafeInfo,
      safeAddress: '0x0000000000000000000000000000000000000001',
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))
  })

  it('should return true if there are pending txs', () => {
    const { result } = renderHook(() => useHasPendingTxs(), {
      initialReduxState: {
        pendingTxs: {
          multisig_123: {
            chainId: '5',
            safeAddress: '0x0000000000000000000000000000000000000001',
            txHash: 'tx123',
          } as PendingTx,

          multisig_456: {
            chainId: '5',
            safeAddress: '0x0000000000000000000000000000000000000002',
            txHash: 'tx456',
          } as PendingTx,
        },
      },
    })

    expect(result?.current).toBe(true)
  })

  it('should return false if there are no pending txs for the current chain', () => {
    const { result } = renderHook(() => useHasPendingTxs(), {
      initialReduxState: {
        pendingTxs: {
          multisig_789: {
            chainId: '1',
            safeAddress: '0x0000000000000000000000000000000000000001',
            txHash: 'tx789',
          } as PendingTx,
        },
      },
    })

    expect(result?.current).toBe(false)
  })
})
