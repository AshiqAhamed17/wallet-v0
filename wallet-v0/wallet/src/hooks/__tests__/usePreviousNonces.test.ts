import { _getUniqueQueuedTxs } from '@/hooks/usePreviousNonces'
import { getMockDetailedTx } from '@/tests/mocks/transactions'

describe('_getUniqueQueuedTxs', () => {
  it('returns an empty array if input is undefined', () => {
    const result = _getUniqueQueuedTxs()

    expect(result).toEqual([])
  })

  it('returns an empty array if input is an empty array', () => {
    const result = _getUniqueQueuedTxs([])

    expect(result).toEqual([])
  })

  it('only returns one transaction per nonce', () => {
    const mockTx = getMockDetailedTx({ nonce: 0 })
    const mockTx1 = getMockDetailedTx({ nonce: 1 })
    const mockTx2 = getMockDetailedTx({ nonce: 1 })

    const mockPage = [mockTx, mockTx1, mockTx2]

    const result = _getUniqueQueuedTxs(mockPage)

    expect(result.length).toEqual(2)
  })
})
