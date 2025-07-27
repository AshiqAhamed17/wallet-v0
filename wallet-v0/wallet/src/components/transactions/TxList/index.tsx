import type { ReactElement, ReactNode } from 'react'
import { useMemo } from 'react'
import { Box } from '@mui/material'
import TxListItem from '../TxListItem'
import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import { groupConflictingTxs } from '@/utils/tx-list'
import css from './styles.module.css'
import { type TransactionListItem } from '@/utils/transaction-guards'

type TxListProps = {
  items: Array<TransactionListItem>
}

export const TxListGrid = ({ children }: { children: ReactNode }): ReactElement => {
  return <Box className={css.container}>{children}</Box>
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const groupedItems = useMemo(() => groupConflictingTxs(items), [items])

  const transactions = groupedItems.map((item, index) => {
    if (Array.isArray(item)) {
      return <GroupedTxListItems key={index} groupedListItems={item} />
    }

    return <TxListItem key={index} item={item} />
  })

  return <TxListGrid>{transactions}</TxListGrid>
}

export default TxList
