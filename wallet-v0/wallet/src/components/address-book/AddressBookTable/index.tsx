import { Box } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useContext, useMemo, useState } from 'react'

import type { AddressEntry } from '@/components/address-book/EntryDialog'
import EntryDialog from '@/components/address-book/EntryDialog'
import ExportDialog from '@/components/address-book/ExportDialog'
import ImportDialog from '@/components/address-book/ImportDialog'
import RemoveDialog from '@/components/address-book/RemoveDialog'
import CheckWallet from '@/components/common/CheckWallet'
import EnhancedTable from '@/components/common/EnhancedTable'
import tableCss from '@/components/common/EnhancedTable/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import { TxModalContext, type TxModalContextType } from '@/components/tx-flow'
import { TokenTransferFlow } from '@/components/tx-flow/flows'
import useAddressBook from '@/hooks/useAddressBook'
import { useCurrentChain } from '@/hooks/useChains'
import NoEntriesIcon from '@/public/images/address-book/no-entries.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import EditIcon from '@/public/images/common/edit.svg'
import madProps from '@/utils/mad-props'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import AddressBookHeader from '../AddressBookHeader'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'actions', label: '' },
]

export enum ModalType {
  EXPORT = 'export',
  IMPORT = 'import',
  ENTRY = 'entry',
  REMOVE = 'remove',
}

const defaultOpen = {
  [ModalType.EXPORT]: false,
  [ModalType.IMPORT]: false,
  [ModalType.ENTRY]: false,
  [ModalType.REMOVE]: false,
}

type AddressBookTableProps = {
  chain?: ChainInfo
  setTxFlow: TxModalContextType['setTxFlow']
}

function AddressBookTable({ chain, setTxFlow }: AddressBookTableProps) {
  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)
  const [searchQuery, setSearchQuery] = useState('')
  const [defaultValues, setDefaultValues] = useState<AddressEntry | undefined>(undefined)

  const handleOpenModal = (type: keyof typeof open) => () => {
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleOpenModalWithValues = (modal: ModalType, address: string, name: string) => {
    setDefaultValues({ address, name })
    handleOpenModal(modal)()
  }

  const handleClose = () => {
    setOpen(defaultOpen)
    setDefaultValues(undefined)
  }

  const addressBook = useAddressBook()
  const addressBookEntries = Object.entries(addressBook)
  const filteredEntries = useMemo(() => {
    if (!searchQuery) {
      return addressBookEntries
    }

    const query = searchQuery.toLowerCase()
    return addressBookEntries.filter(([address, name]) => {
      return address.toLowerCase().includes(query) || (name as string).toLowerCase().includes(query)
    })
  }, [addressBookEntries, searchQuery])

  const rows = filteredEntries.map(([address, name]) => ({
    cells: {
      name: {
        rawValue: name as string,
        content: name as string,
      },
      address: {
        rawValue: address,
        content: <EthHashInfo address={address} showName={false} shortAddress={false} hasExplorer showCopyButton />,
      },
      actions: {
        rawValue: '',
        sticky: true,
        content: (
          <div className={tableCss.actions}>
            <Tooltip title="Edit entry" placement="top">
              <IconButton
                onClick={() => handleOpenModalWithValues(ModalType.ENTRY, address, name as string)}
                size="small"
              >
                <SvgIcon component={EditIcon} inheritViewBox color="border" fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete entry" placement="top">
              <IconButton
                onClick={() => handleOpenModalWithValues(ModalType.REMOVE, address, name as string)}
                size="small"
              >
                <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
              </IconButton>
            </Tooltip>

            <CheckWallet>
              {(isOk) => (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => setTxFlow(<TokenTransferFlow recipient={address} />)}
                  disabled={!isOk}
                >
                  Send
                </Button>
              )}
            </CheckWallet>
          </div>
        ),
      },
    },
  }))

  return (
    <>
      <AddressBookHeader
        handleOpenModal={handleOpenModal}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <main>
        {filteredEntries.length > 0 ? (
          <EnhancedTable rows={rows} headCells={headCells} mobileVariant />
        ) : (
          <Box bgcolor="background.paper" borderRadius={1}>
            <PagePlaceholder
              img={<NoEntriesIcon />}
              text={`No entries found${chain ? ` on ${chain.chainName}` : ''}`}
            />
          </Box>
        )}
      </main>

      {open[ModalType.EXPORT] && <ExportDialog handleClose={handleClose} />}

      {open[ModalType.IMPORT] && <ImportDialog handleClose={handleClose} />}

      {open[ModalType.ENTRY] && (
        <EntryDialog
          handleClose={handleClose}
          defaultValues={defaultValues}
          disableAddressInput={Boolean(defaultValues?.name)}
        />
      )}

      {open[ModalType.REMOVE] && <RemoveDialog handleClose={handleClose} address={defaultValues?.address || ''} />}
    </>
  )
}

const useSetTxFlow = () => useContext(TxModalContext).setTxFlow

export default madProps(AddressBookTable, {
  chain: useCurrentChain,
  setTxFlow: useSetTxFlow,
})
