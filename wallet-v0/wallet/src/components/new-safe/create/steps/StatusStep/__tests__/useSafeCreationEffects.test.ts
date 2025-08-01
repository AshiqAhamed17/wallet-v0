import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import * as web3 from '@/hooks/wallets/web3'
import * as pendingSafe from '@/components/new-safe/create/logic'
import * as usePendingSafe from '@/components/new-safe/create/steps/StatusStep/usePendingSafe'
import * as addressbook from '@/components/new-safe/create/logic/address-book'
import { Web3Provider } from '@ethersproject/providers'
import useSafeCreationEffects from '@/components/new-safe/create/steps/StatusStep/useSafeCreationEffects'
import type { PendingSafeData } from '@/components/new-safe/create/types'
import { hexZeroPad } from 'ethers/lib/utils'
import { MulticallWrapper } from 'ethers-multicall-provider'

describe('useSafeCreationEffects', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(pendingSafe, 'pollSafeInfo').mockImplementation(jest.fn(() => Promise.resolve({} as SafeInfo)))
    jest.spyOn(addressbook, 'updateAddressBook').mockReturnValue(() => {})

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
    jest.spyOn(web3, 'useMultiWeb3ReadOnly').mockImplementation(() => MulticallWrapper.wrap(mockProvider))
  })

  it('should clear the tx hash if it exists on ERROR or REVERTED', () => {
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()
    jest
      .spyOn(usePendingSafe, 'usePendingSafe')
      .mockReturnValue([{ txHash: '0x123' } as PendingSafeData, setPendingSafeSpy])

    renderHook(() =>
      useSafeCreationEffects({
        status: SafeCreationStatus.ERROR,
        setStatus: setStatusSpy,
      }),
    )

    expect(setPendingSafeSpy).toHaveBeenCalled()
  })

  it('should not clear the tx hash if it doesnt exist on ERROR or REVERTED', () => {
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()
    jest.spyOn(usePendingSafe, 'usePendingSafe').mockReturnValue([{} as PendingSafeData, setPendingSafeSpy])
    renderHook(() =>
      useSafeCreationEffects({
        status: SafeCreationStatus.ERROR,
        setStatus: setStatusSpy,
      }),
    )

    expect(setPendingSafeSpy).not.toHaveBeenCalled()
  })

  it('should poll safe info on SUCCESS', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()
    jest
      .spyOn(usePendingSafe, 'usePendingSafe')
      .mockReturnValue([
        { safeAddress: hexZeroPad('0x123', 20), txHash: '0x123' } as PendingSafeData,
        setPendingSafeSpy,
      ])
    renderHook(() =>
      useSafeCreationEffects({
        status: SafeCreationStatus.SUCCESS,
        setStatus: setStatusSpy,
      }),
    )

    expect(pollSafeInfoSpy).toHaveBeenCalled()
  })

  it('should not poll safe info on SUCCESS if there is no safe address', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()
    jest.spyOn(usePendingSafe, 'usePendingSafe').mockReturnValue([{} as PendingSafeData, setPendingSafeSpy])
    renderHook(() =>
      useSafeCreationEffects({
        status: SafeCreationStatus.SUCCESS,
        setStatus: setStatusSpy,
      }),
    )

    expect(pollSafeInfoSpy).not.toHaveBeenCalled()
  })
})
