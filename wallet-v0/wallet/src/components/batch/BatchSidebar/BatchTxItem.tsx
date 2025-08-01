import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import TxData from '@/components/transactions/TxDetails/TxData'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import TxInfo from '@/components/transactions/TxInfo'
import TxType from '@/components/transactions/TxType'
import DeleteIcon from '@/public/images/common/delete.svg'
import DragIcon from '@/public/images/common/drag.svg'
import { type DraftBatchItem } from '@/store/batchSlice'
import { dateString } from '@/utils/formatters'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase, ListItem, SvgIcon } from '@mui/material'
import { type SyntheticEvent, useCallback, useMemo } from 'react'
import css from './styles.module.css'

type BatchTxItemProps = DraftBatchItem & {
  id: string
  count: number
  timestamp?: number
  txDetails: any
  onDelete?: (id: string) => void
  draggable?: boolean
  dragging?: boolean
}

const BatchTxItem = ({
  id,
  count,
  timestamp,
  txDetails,
  onDelete,
  dragging = false,
  draggable = false,
}: BatchTxItemProps) => {
  const txSummary = useMemo(
    () => ({
      timestamp: timestamp || Date.now(), // Provide default value
      id: txDetails.txId,
      txHash: txDetails.txId, // Add missing txHash
      txInfo: txDetails.txInfo,
      txStatus: txDetails.txStatus,
      safeAppInfo: txDetails.safeAppInfo,
    }),
    [timestamp, txDetails],
  )

  const handleDelete = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()
      if (confirm('Are you sure you want to delete this transaction?')) {
        onDelete?.(id)
      }
    },
    [onDelete, id],
  )

  return (
    <ListItem disablePadding sx={{ gap: 2, alignItems: 'flex-start' }}>
      <div className={css.number}>{count}</div>

      <Accordion elevation={0} sx={{ flex: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} disabled={dragging} className={css.accordion}>
          <Box flex={1} display="flex" alignItems="center" gap={2} py={0.4}>
            {draggable && (
              <SvgIcon
                component={DragIcon}
                inheritViewBox
                fontSize="small"
                className={css.dragHandle}
                onClick={(e: MouseEvent) => e.stopPropagation()}
              />
            )}

            <TxType tx={txSummary} />

            <Box flex={1}>
              <TxInfo info={txDetails.txInfo} />
            </Box>

            {onDelete && (
              <>
                <Box className={css.separator} />

                <ButtonBase onClick={handleDelete} title="Delete transaction" sx={{ p: 0.5 }}>
                  <SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" />
                </ButtonBase>

                <Box className={css.separator} mr={2} />
              </>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <div className={css.details}>
            <TxData txDetails={txDetails} trusted />

            <TxDataRow title="Created:">{timestamp ? dateString(timestamp) : null}</TxDataRow>

            {txDetails.txData?.dataDecoded && (
              <MethodDetails data={txDetails.txData.dataDecoded} addressInfoIndex={txDetails.txData.addressInfoIndex} />
            )}
          </div>
        </AccordionDetails>
      </Accordion>
    </ListItem>
  )
}

export default BatchTxItem
