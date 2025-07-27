import { type ReactElement } from 'react'
import {
  isDateLabel,
  isDetailedTransactionListItem,
  isLabelListItem,
  type TransactionListItem,
} from '@/utils/transaction-guards'
import GroupLabel from '@/components/transactions/GroupLabel'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import ExpandableTransactionItem from './ExpandableTransactionItem'

type TxListItemProps = {
  item: TransactionListItem
}

const TxListItem = ({ item }: TxListItemProps): ReactElement | null => {
  if (isLabelListItem(item)) {
    return <GroupLabel item={item} />
  }
  if (isDetailedTransactionListItem(item)) {
    return <ExpandableTransactionItem item={item} txDetails={item.details} />
  }
  if (isDateLabel(item)) {
    return <TxDateLabel item={item} />
  }
  return null
}

export default TxListItem
