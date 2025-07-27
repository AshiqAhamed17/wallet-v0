import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { LoadSafeFormData } from '@/components/new-safe/load'
import { FormProvider, useForm } from 'react-hook-form'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import NameInput from '@/components/common/NameInput'
import InfoIcon from '@/public/images/notifications/info.svg'
import css from '@/components/new-safe/create/steps/SetNameStep/styles.module.css'
import NetworkSelector from '@/components/common/NetworkSelector'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddressInput from '@/components/common/AddressInput'
import React from 'react'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import { AppRoutes } from '@/config/routes'
import MUILink from '@mui/material/Link'
import Link from 'next/link'
import { getSafeSDKAndImplementation } from '@/hooks/coreSDK/useInitSafeCoreSDK'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'

enum Field {
  name = 'name',
  address = 'address',
}

type FormData = {
  [Field.name]: string
  [Field.address]: string
}

const SetAddressStep = ({ data, onSubmit, onBack }: StepRenderProps<LoadSafeFormData>) => {
  const currentChainId = useChainId()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, currentChainId))
  const formMethods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      [Field.name]: data.name,
      [Field.address]: data.address,
    },
  })

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
  } = formMethods

  const safeAddress = watch(Field.address)

  const randomName = useMnemonicSafeName()
  const { ens, name, resolving } = useAddressResolver(safeAddress)

  const web3ReadOnly = useWeb3ReadOnly()

  // Address book, ENS, mnemonic
  const fallbackName = name || ens || randomName

  const validateSafeAddress = async (address: string) => {
    if (addedSafes && Object.keys(addedSafes).includes(address)) {
      return 'Safe Account is already added'
    }

    if (!web3ReadOnly) {
      return 'Web3 not available, please check your RPC URL.'
    }

    try {
      await getSafeSDKAndImplementation(web3ReadOnly, address, currentChainId)
    } catch (error: any) {
      return 'Address given is not a valid Safe Account address on the current network.'
    }
  }

  const onFormSubmit = handleSubmit((data: FormData) => {
    onSubmit({
      ...data,
      [Field.name]: data[Field.name] || fallbackName,
    })
  })

  const handleBack = () => {
    const formData = getValues()
    onBack({
      ...formData,
      [Field.name]: formData.name || fallbackName,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onFormSubmit}>
        <Box className={layoutCss.row}>
          <Grid container spacing={[3, 1]} mb={3} pr="40px">
            <Grid item xs={12} md>
              <NameInput
                name={Field.name}
                label={errors?.[Field.name]?.message || 'Name'}
                placeholder={fallbackName}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: resolving ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : (
                    <Tooltip
                      title="This name is stored locally and will never be shared with us or any third parties."
                      arrow
                      placement="top"
                    >
                      <InputAdornment position="end">
                        <SvgIcon component={InfoIcon} inheritViewBox />
                      </InputAdornment>
                    </Tooltip>
                  ),
                }}
              />
            </Grid>
            <Grid item order={[-1, 1]}>
              <Box className={css.select}>
                <NetworkSelector />
              </Box>
            </Grid>
          </Grid>

          <AddressInput label="Safe Account" validate={validateSafeAddress} name={Field.address} />

          <Typography mt={4}>
            By continuing, you agree to have read and understood the{' '}
            <Link href={AppRoutes.imprint} passHref legacyBehavior>
              <MUILink>legal imprint</MUILink>
            </Link>
            .
          </Typography>
        </Box>

        <Divider />

        <Box className={layoutCss.row}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
            <Button variant="outlined" size="small" onClick={handleBack} startIcon={<ArrowBackIcon fontSize="small" />}>
              Back
            </Button>
            <Button
              data-testid="load-safe-next-btn"
              type="submit"
              variant="contained"
              size="stretched"
              disabled={!isValid}
            >
              Next
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  )
}

export default SetAddressStep
