import NumberField from '@/components/common/NumberField'
import { AutocompleteItem } from '@/components/tx-flow/flows/TokenTransfer/CreateTokenTransfer'
import { safeFormatUnits } from '@/utils/formatters'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import { type BigNumber } from '@ethersproject/bignumber'
import { Button, Divider, FormControl, InputLabel, MenuItem, TextField } from '@mui/material'
import { type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import classNames from 'classnames'
import { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'
import css from './styles.module.css'

export enum TokenAmountFields {
  tokenAddress = 'tokenAddress',
  amount = 'amount',
}

const TokenAmountInput = ({
  balances,
  selectedToken,
  maxAmount,
  validate,
}: {
  balances: SafeBalanceResponse['items']
  selectedToken: SafeBalanceResponse['items'][number] | undefined
  maxAmount?: BigNumber
  validate?: (value: string) => string | undefined
}) => {
  const {
    formState: { errors },
    register,
    resetField,
    watch,
    setValue,
  } = useFormContext<{ [TokenAmountFields.tokenAddress]: string; [TokenAmountFields.amount]: string }>()

  const tokenAddress = watch(TokenAmountFields.tokenAddress)
  const isAmountError = !!errors[TokenAmountFields.tokenAddress] || !!errors[TokenAmountFields.amount]

  const validateAmount = useCallback(
    (value: string) => {
      const decimals = selectedToken?.tokenInfo.decimals
      return (
        validateLimitedAmount(value, decimals ?? undefined, maxAmount?.toString()) ||
        validateDecimalLength(value, decimals ?? undefined)
      )
    },
    [maxAmount, selectedToken?.tokenInfo.decimals],
  )

  const onMaxAmountClick = useCallback(() => {
    if (!selectedToken || !maxAmount) return

    setValue(
      TokenAmountFields.amount,
      safeFormatUnits(maxAmount.toString(), selectedToken.tokenInfo.decimals ?? undefined),
      {
        shouldValidate: true,
      },
    )
  }, [maxAmount, selectedToken, setValue])

  return (
    <FormControl className={classNames(css.outline, { [css.error]: isAmountError })} fullWidth>
      <InputLabel shrink required className={css.label}>
        {errors[TokenAmountFields.tokenAddress]?.message || errors[TokenAmountFields.amount]?.message || 'Amount'}
      </InputLabel>
      <div className={css.inputs}>
        <NumberField
          variant="standard"
          InputProps={{
            disableUnderline: true,
            endAdornment: maxAmount && (
              <Button className={css.max} onClick={onMaxAmountClick}>
                Max
              </Button>
            ),
          }}
          className={css.amount}
          required
          placeholder="0"
          {...register(TokenAmountFields.amount, {
            required: true,
            validate: validate ?? validateAmount,
          })}
        />
        <Divider orientation="vertical" flexItem />
        <TextField
          select
          variant="standard"
          InputProps={{
            disableUnderline: true,
          }}
          className={css.select}
          {...register(TokenAmountFields.tokenAddress, {
            required: true,
            onChange: () => {
              resetField(TokenAmountFields.amount, { defaultValue: '' })
            },
          })}
          value={tokenAddress}
          required
        >
          {balances.map((item) => (
            <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
              <AutocompleteItem {...item} />
            </MenuItem>
          ))}
        </TextField>
      </div>
    </FormControl>
  )
}

export default TokenAmountInput
