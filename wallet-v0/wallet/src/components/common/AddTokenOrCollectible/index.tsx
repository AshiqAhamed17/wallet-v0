import { type BaseSyntheticEvent, type ReactElement, useEffect } from 'react'
import React, { useState } from 'react'
import Box from '@mui/material/Box'
import PlusIcon from '@/public/images/common/plus.svg'

import css from './styles.module.css'
import {
  Button,
  CircularProgress,
  Collapse,
  DialogActions,
  DialogContent,
  Grid,
  InputAdornment,
  SvgIcon,
  Typography,
} from '@mui/material'
import AddressInput from '@/components/common/AddressInput'
import { FormProvider, useForm } from 'react-hook-form'
import { useToken } from '@/hooks/useToken'
import NameInput from '@/components/common/NameInput'
import NumberInput from '@/components/common/NumberInput'
import { useAppDispatch } from '@/store'
import { add as addToken } from '@/store/customTokensSlice'
import { add as addCollectible } from '@/store/customCollectiblesSlice'
import { TokenType } from '@safe-global/safe-apps-sdk'
import { useCurrentChain } from '@/hooks/useChains'
import { getAddress } from 'ethers/lib/utils'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useCollectible } from '@/hooks/useCollectible'
import { isERC20Data, isERC721Data } from '@/utils/tokens'

export type TokenEntry = {
  address: string
  name: string
  symbol: string
  decimals: number | undefined
}

export type CollectibleEntry = {
  address: string
  name: string
  symbol: string
}

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const AddTokenOrCollectible = ({
  variant = 'token',
  defaultValues = {
    address: '',
    name: '',
    symbol: '',
    decimals: undefined,
  },
}: {
  variant?: 'token' | 'collectible'
  defaultValues?: TokenEntry
}): ReactElement => {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()

  const [showAddToken, setShowAddToken] = useState<boolean>(false)
  const [addTokenError, setAddTokenError] = useState<Error | undefined>()

  const handleClickAddToken = () => {
    setShowAddToken(!showAddToken)
  }

  const methods = useForm<TokenEntry>({
    defaultValues,
    mode: 'onChange',
  })

  const { handleSubmit, formState, watch, reset, setValue } = methods

  const submitCallback = handleSubmit((inputData: TokenEntry) => {
    try {
      if (!chain) throw new Error('No chain selected')

      if (variant === 'collectible' && isERC721Data(data)) {
        const collectible = {
          address: getAddress(inputData.address),
          name: inputData.name || '',
          symbol: inputData.symbol || '',
        }
        dispatch(addCollectible([chain.chainId, collectible]))
      } else if (isERC20Data(data)) {
        const token = {
          chainId: parseInt(chain.chainId),
          address: getAddress(inputData.address),
          name: inputData.name || data?.name || '',
          symbol: inputData.symbol || data?.symbol || '',
          decimals: inputData.decimals || data?.decimals || 18,
          logoUri: '',
          type: TokenType.ERC20,
        }
        dispatch(addToken([chain.chainId, token]))
      }

      reset()
      setShowAddToken(false)
    } catch (error) {
      if (error instanceof Error) {
        setAddTokenError(error)
      } else {
        setAddTokenError(new Error(`Unknown error when adding ${variant}.`))
      }
    }
  })

  const onSubmit = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
    submitCallback(e)
  }

  const useTokenOrCollectible: typeof useCollectible | typeof useToken =
    variant === 'collectible' ? useCollectible : useToken

  const [data, error, loading] = useTokenOrCollectible(watch('address'))

  useEffect(() => {
    if (data) {
      setValue('name', data.name, { shouldValidate: true })
      setValue('symbol', data.symbol, { shouldValidate: true })
      if (isERC20Data(data) && variant === 'token') setValue('decimals', data.decimals, { shouldValidate: true })
    }
  }, [data, setValue, variant])

  const variantCapitalized = capitalizeFirstLetter(variant)

  return (
    <>
      <div className={css.addToken} onClick={handleClickAddToken}>
        <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ ml: 1 }} />

        <Typography>Add {variantCapitalized}</Typography>
      </div>
      <Collapse in={showAddToken}>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <DialogContent>
              <Box>
                <AddressInput
                  name="address"
                  label={`${variantCapitalized} Address`}
                  variant="outlined"
                  autoFocus
                  fullWidth
                  required
                />
              </Box>
            </DialogContent>

            <Collapse in={!!data}>
              <DialogContent>
                <Grid
                  container
                  spacing={3}
                  alignItems="center"
                  marginBottom={3}
                  flexWrap={['wrap', undefined, 'nowrap']}
                >
                  <Grid item xs={12}>
                    <NameInput
                      name="name"
                      label="Token name"
                      required
                      InputLabelProps={{ shrink: true }}
                      placeholder="Token name"
                      InputProps={{
                        endAdornment: loading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <NameInput
                      name="symbol"
                      label="Token symbol"
                      required
                      InputLabelProps={{ shrink: true }}
                      placeholder="Token symbol"
                      InputProps={{
                        endAdornment: loading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  </Grid>
                  {variant === 'token' && isERC20Data(data) && (
                    <Grid item xs={6}>
                      <NumberInput
                        name="decimals"
                        label="Token decimals"
                        InputLabelProps={{ shrink: true }}
                        placeholder="Token decimals"
                        InputProps={{
                          endAdornment: loading ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
            </Collapse>

            <Collapse in={!!error || !!addTokenError}>
              <DialogContent>
                {error && (
                  <ErrorMessage error={error}>
                    Error loading {variant} information, please double check the address.
                  </ErrorMessage>
                )}
                {addTokenError && <ErrorMessage>{addTokenError.message}</ErrorMessage>}
              </DialogContent>
            </Collapse>

            <DialogActions>
              <Button type="submit" variant="contained" disabled={!formState.isValid || !data} disableElevation>
                Add
              </Button>
            </DialogActions>
          </form>
        </FormProvider>
      </Collapse>
    </>
  )
}

export default AddTokenOrCollectible
