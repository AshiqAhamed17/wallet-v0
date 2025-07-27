import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import ConfirmProposedTx from './ConfirmProposedTx'
import { useTransactionType } from '@/hooks/useTransactionType'
import TxInfo from '@/components/transactions/TxInfo'
import type { TransactionDetails } from '@/utils/transaction-guards'

const ConfirmTxFlow = ({ txSummary, txDetails }: { txSummary: TransactionSummary; txDetails: TransactionDetails }) => {
  const { text } = useTransactionType(txSummary)

  return (
    <TxLayout
      title="Confirm transaction"
      subtitle={
        <>
          {text}&nbsp;
          <TxInfo info={txSummary.txInfo} withLogo={false} omitSign />
        </>
      }
      step={0}
      txSummary={txSummary}
    >
      <ConfirmProposedTx txSummary={txSummary} txDetails={txDetails} />
    </TxLayout>
  )
}

export default ConfirmTxFlow
