import { type ReactElement } from 'react'
import * as hooks from '@/components/tx/SignOrExecuteForm/hooks'
import { SignForm } from '@/components/tx/SignOrExecuteForm/SignForm'
import { render } from '@/tests/test-utils'
import { createMockSafeTransaction } from '@/tests/transactions'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import { fireEvent, waitFor } from '@testing-library/react'

// We assume that CheckWallet always returns true
jest.mock('@/components/common/CheckWallet', () => ({
  __esModule: true,
  default({ children }: { children: (ok: boolean) => ReactElement }) {
    return children(true)
  },
}))

describe('SignForm', () => {
  const safeTransaction = createMockSafeTransaction({
    to: '0x1',
    data: '0x',
    operation: OperationType.Call,
  })

  const defaultProps = {
    onSubmit: jest.fn(),
    isOwner: true,
    txActions: { signTx: jest.fn(), addToBatch: jest.fn(), executeTx: jest.fn() },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('displays a warning if connected wallet already signed the tx', () => {
    jest.spyOn(hooks, 'useAlreadySigned').mockReturnValue(true)

    const { getByText } = render(<SignForm {...defaultProps} />)

    expect(getByText('You have already signed this transaction.')).toBeInTheDocument()
  })

  it('does not display a warning if connected wallet has not signed the tx yet', () => {
    jest.spyOn(hooks, 'useAlreadySigned').mockReturnValue(false)

    const { queryByText } = render(<SignForm {...defaultProps} />)

    expect(queryByText('You have already signed this transaction.')).not.toBeInTheDocument()
  })

  it('shows a non-owner error', () => {
    jest.spyOn(hooks, 'useAlreadySigned').mockReturnValue(false)

    const { queryByText } = render(<SignForm {...defaultProps} isOwner={false} />)

    expect(
      queryByText(
        'You are currently not an owner of this Safe Account and won&apos;t be able to submit this transaction.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows a submit error', async () => {
    const mockSignTx = jest.fn(() => {
      throw new Error('Error signing the tx')
    })

    const { getByText } = render(
      <SignForm {...defaultProps} safeTx={safeTransaction} txActions={{ signTx: mockSignTx, executeTx: jest.fn() }} />,
    )

    const button = getByText('Sign')

    fireEvent.click(button)

    await waitFor(() => {
      expect(getByText('Error submitting the transaction. Please try again.')).toBeInTheDocument()
    })
  })

  it('signs a transaction', async () => {
    const mockSignTx = jest.fn()

    const { getByText } = render(
      <SignForm {...defaultProps} safeTx={safeTransaction} txActions={{ signTx: mockSignTx, executeTx: jest.fn() }} />,
    )

    const button = getByText('Sign')

    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSignTx).toHaveBeenCalled()
    })
  })

  it('shows a disabled submit button if there is no safeTx', () => {
    const { getByText } = render(<SignForm {...defaultProps} safeTx={undefined} />)

    const button = getByText('Sign')

    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('shows a disabled submit button if passed via props', () => {
    const { getByText } = render(<SignForm {...defaultProps} safeTx={safeTransaction} disableSubmit />)

    const button = getByText('Sign')

    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('shows a disabled submit button if not an owner', () => {
    const { getByText } = render(<SignForm {...defaultProps} safeTx={safeTransaction} isOwner={false} />)

    const button = getByText('Sign')

    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })
})
