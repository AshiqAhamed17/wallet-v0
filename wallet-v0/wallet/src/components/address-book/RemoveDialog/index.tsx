import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import type { ReactElement } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import { removeAddressBookEntry } from '@/store/addressBookSlice'

const RemoveDialog = ({ handleClose, address }: { handleClose: () => void; address: string }): ReactElement => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const addressBook = useAddressBook()

  const name = (addressBook as Record<string, string>)?.[address]

  const handleConfirm = () => {
    dispatch(removeAddressBookEntry({ chainId, address }))
    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Delete entry">
      <DialogContent sx={{ p: '24px !important' }}>
        <Typography>
          Are you sure you want to permanently delete <b>{name}</b> from your address book?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="danger" disableElevation>
          Delete
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default RemoveDialog
