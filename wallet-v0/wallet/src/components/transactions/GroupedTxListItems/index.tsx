import type { ReactElement } from 'react'
import { useContext } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { type DetailedTransaction, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import css from './styles.module.css'
import { ReplaceTxHoverContext, ReplaceTxHoverProvider } from './ReplaceTxHoverProvider'
import ExternalLink from '@/components/common/ExternalLink'
import { HelpCenterArticle } from '@/config/constants'

const Disclaimer = ({ nonce }: { nonce?: number }) => (
  <Box className={css.disclaimerContainer}>
    <Typography alignSelf="flex-start">{nonce}</Typography>
    <Typography>
      These transactions conflict as they use the same nonce. Executing one will automatically replace the other(s).
    </Typography>

    <ExternalLink
      href={HelpCenterArticle.CONFLICTING_TRANSACTIONS}
      title="Why are transactions with the same nonce conflicting with each other?"
      className={css.link}
    >
      Learn more
    </ExternalLink>
  </Box>
)

const TxGroup = ({ groupedListItems }: { groupedListItems: Array<DetailedTransaction> }): ReactElement => {
  const nonce = isMultisigExecutionInfo(groupedListItems[0].transaction.executionInfo)
    ? groupedListItems[0].transaction.executionInfo.nonce
    : undefined

  const { replacedTxIds } = useContext(ReplaceTxHoverContext)

  return (
    <Paper className={css.container} variant="outlined">
      <Disclaimer nonce={nonce} />
      {groupedListItems.map((tx) => (
        <div key={tx.transaction.id} className={replacedTxIds.includes(tx.transaction.id) ? css.willBeReplaced : ''}>
          <ExpandableTransactionItem item={tx} txDetails={tx.details} isGrouped />
        </div>
      ))}
    </Paper>
  )
}

const GroupedTxListItems = ({
  groupedListItems,
}: {
  groupedListItems: Array<DetailedTransaction>
}): ReactElement | null => {
  if (groupedListItems.length === 0) return null

  return (
    <ReplaceTxHoverProvider groupedListItems={groupedListItems}>
      <TxGroup groupedListItems={groupedListItems} />
    </ReplaceTxHoverProvider>
  )
}

export default GroupedTxListItems
