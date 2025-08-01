import ErrorMessage from '@/components/tx/ErrorMessage'
import useWalletCanPay from '@/hooks/useWalletCanPay'
import { useMemo } from 'react'
import { Button, Grid, Typography, Divider, Box } from '@mui/material'
import lightPalette from '@/components/theme/lightPalette'
import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useCurrentChain } from '@/hooks/useChains'
import useGasPrice from '@/hooks/useGasPrice'
import { useEstimateSafeCreationGas } from '@/components/new-safe/create/useEstimateSafeCreationGas'
import { formatVisualAmount } from '@/utils/formatters'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create'
import css from '@/components/new-safe/create/steps/ReviewStep/styles.module.css'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3 } from '@/hooks/wallets/web3'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import ReviewRow from '@/components/new-safe/ReviewRow'
import { BigNumber } from 'ethers'
import { usePendingSafe } from '../StatusStep/usePendingSafe'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

export const NetworkFee = ({ totalFee, chain }: { totalFee: string; chain: ChainInfo | undefined }) => {
  return (
    <Box
      p={1}
      sx={{
        backgroundColor: lightPalette.secondary.background,
        color: 'static.main',
        width: 'fit-content',
        borderRadius: '6px',
      }}
    >
      <Typography variant="body1">
        <b>
          &asymp; {totalFee} {chain?.nativeCurrency.symbol}
        </b>
      </Typography>
    </Box>
  )
}

const ReviewStep = ({ data, onSubmit, onBack, setStep }: StepRenderProps<NewSafeFormData>) => {
  const isWrongChain = useIsWrongChain()
  useSyncSafeCreationStep(setStep)
  const chain = useCurrentChain()
  const wallet = useWallet()
  const provider = useWeb3()
  const [gasPrice] = useGasPrice()
  const saltNonce = useMemo(() => Date.now(), [])
  const [_, setPendingSafe] = usePendingSafe()

  const safeParams = useMemo(() => {
    return {
      owners: data.owners.map((owner) => owner.address),
      threshold: data.threshold,
      saltNonce,
    }
  }, [data.owners, data.threshold, saltNonce])

  const { gasLimit } = useEstimateSafeCreationGas(safeParams)

  const maxFeePerGas = gasPrice?.maxFeePerGas
  const maxPriorityFeePerGas = gasPrice?.maxPriorityFeePerGas

  const walletCanPay = useWalletCanPay({ gasLimit, maxFeePerGas, maxPriorityFeePerGas })

  const totalFee =
    gasLimit && maxFeePerGas
      ? formatVisualAmount(
          maxFeePerGas
            .add(
              // maxPriorityFeePerGas is undefined if EIP-1559 disabled
              maxPriorityFeePerGas || BigNumber.from(0),
            )
            .mul(gasLimit),
          chain?.nativeCurrency.decimals,
        )
      : '> 0.001'

  const handleBack = () => {
    onBack(data)
  }

  const createSafe = async () => {
    if (!wallet || !provider || !chain) return

    const pendingSafe = {
      ...data,
      saltNonce,
    }

    setPendingSafe(pendingSafe)
    onSubmit(pendingSafe)
  }

  const isDisabled = isWrongChain

  return (
    <>
      <Box className={layoutCss.row}>
        <Grid container spacing={3}>
          <ReviewRow name="Network" value={<ChainIndicator chainId={chain?.chainId} inline />} />
          {data.name && <ReviewRow name="Name" value={<Typography>{data.name}</Typography>} />}
          <ReviewRow
            name="Owners"
            value={
              <Box data-testid="review-step-owner-info" className={css.ownersArray}>
                {data.owners.map((owner, index) => (
                  <EthHashInfo
                    address={owner.address}
                    name={owner.name || owner.ens}
                    shortAddress={false}
                    showPrefix={false}
                    showName
                    hasExplorer
                    showCopyButton
                    key={index}
                  />
                ))}
              </Box>
            }
          />
          <ReviewRow
            name="Threshold"
            value={
              <Typography>
                {data.threshold} out of {data.owners.length} owner(s)
              </Typography>
            }
          />
        </Grid>
      </Box>

      <Divider />
      <Box className={layoutCss.row} display="flex" flexDirection="column" gap={3}>
        <Grid data-testid="network-fee-section" container spacing={3}>
          <ReviewRow
            name="Est. network fee"
            value={
              <>
                <NetworkFee totalFee={totalFee} chain={chain} />

                <Typography variant="body2" color="text.secondary" mt={1}>
                  You will have to confirm a transaction with your connected wallet.
                </Typography>
              </>
            }
          />
        </Grid>

        {isWrongChain && <NetworkWarning />}

        {!walletCanPay && (
          <ErrorMessage>Your connected wallet doesn&apos;t have enough funds to execute this transaction</ErrorMessage>
        )}
      </Box>

      <Divider />

      <Box className={layoutCss.row}>
        <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
          <Button
            data-testid="back-btn"
            variant="outlined"
            size="small"
            onClick={handleBack}
            startIcon={<ArrowBackIcon fontSize="small" />}
          >
            Back
          </Button>
          <Button
            data-testid="review-step-next-btn"
            onClick={createSafe}
            variant="contained"
            size="stretched"
            disabled={isDisabled}
          >
            Next
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default ReviewStep
