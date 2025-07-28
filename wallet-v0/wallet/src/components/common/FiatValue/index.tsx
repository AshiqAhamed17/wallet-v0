import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'
import { formatCurrency } from '@/utils/formatNumber'
import type { ReactElement } from 'react'
import { useMemo } from 'react'

const FiatValue = ({ value }: { value: string | number }): ReactElement => {
  const currency = useAppSelector(selectCurrency)

  const fiat = useMemo(() => {
    return formatCurrency(value, typeof currency === 'string' ? currency : '')
  }, [value, currency])

  return <span suppressHydrationWarning>{fiat}</span>
}

export default FiatValue
