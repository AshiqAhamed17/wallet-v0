import { type SyntheticEvent, type ReactElement, useCallback, useState, useContext } from 'react'
import { type SafeCollectibleResponse } from '@safe-global/safe-gateway-typescript-sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useCollectibles from '@/hooks/useCollectibles'
import NftGrid from '../NftGrid'
import NftSendForm from '../NftSendForm'
import NftPreviewModal from '../NftPreviewModal'
import { TxModalContext } from '@/components/tx-flow'
import { NftTransferFlow } from '@/components/tx-flow/flows'
import AddTokenOrCollectible from '@/components/common/AddTokenOrCollectible'
import { Box } from '@mui/material'

const NftCollections = (): ReactElement => {
  // Load NFTs from the backend
  const [allNfts, error, loading] = useCollectibles()
  // Selected NFTs
  const [selectedNfts, setSelectedNfts] = useState<SafeCollectibleResponse[]>([])
  // Preview
  const [previewNft, setPreviewNft] = useState<SafeCollectibleResponse>()
  // Tx modal
  const { setTxFlow } = useContext(TxModalContext)

  // On NFT preview click
  const onPreview = useCallback((token: SafeCollectibleResponse) => {
    setPreviewNft(token)
  }, [])

  const onSendSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()

      if (selectedNfts.length) {
        // Show the NFT transfer modal
        setTxFlow(<NftTransferFlow tokens={selectedNfts} />)
      }
    },
    [selectedNfts, setTxFlow],
  )

  return (
    <>
      {error ? (
        /* Loading error */
        <ErrorMessage error={new Error(error)}>Failed to load NFTs</ErrorMessage>
      ) : (
        /* NFTs */ <>
          <form onSubmit={onSendSubmit}>
            {/* Batch send form */}
            <NftSendForm selectedNfts={selectedNfts} />

            {/* NFTs table */}
            <NftGrid
              nfts={allNfts}
              selectedNfts={selectedNfts}
              setSelectedNfts={setSelectedNfts}
              onPreview={onPreview}
              isLoading={loading}
            />
          </form>
          <Box
            p={1}
            px={2}
            bgcolor="background.paper"
            borderRadius={'0px 0px 6px 6px'}
            borderTop={allNfts.length > 0 ? 1 : 0}
            borderColor="border.light"
            sx={{
              ':hover': {
                backgroundColor: 'background.light',
              },
            }}
          >
            <AddTokenOrCollectible variant="collectible" />
          </Box>
        </>
      )}

      {/* NFT preview */}
      {<NftPreviewModal onClose={() => setPreviewNft(undefined)} nft={previewNft} />}
    </>
  )
}

export default NftCollections
