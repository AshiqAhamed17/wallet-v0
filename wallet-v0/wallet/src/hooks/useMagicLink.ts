import { useParams } from 'next/navigation'
import { parse, type ParsedUrlQuery } from 'querystring'
import { prefixedAddressRe } from '@/utils/url'
import { decodeTransactionMagicLink, encodeTransactionMagicLink, transactionKey } from '@/services/tx/txMagicLink'
import { useEffect, useState, useCallback } from 'react'
import { addOrUpdateTx } from '@/store/addedTxsSlice'
import { useAppDispatch } from '@/store'
import useChainId from './useChainId'
import useSafeAddress from './useSafeAddress'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { asError } from '@/services/exceptions/utils'
import { showNotification } from '@/store/notificationsSlice'
import { trackError } from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { useSafeSDK } from './coreSDK/safeCoreSDK'

// Use the location object directly because Next.js's router.query is available only on mount
const getLocationQuery = (): ParsedUrlQuery => {
  if (typeof location === 'undefined') return {}

  const query = parse(location.search.slice(1))

  if (!query.safe) {
    const pathParam = location.pathname.split('/')[1]
    const safeParam = prefixedAddressRe.test(pathParam) ? pathParam : ''

    // Path param -> query param
    if (prefixedAddressRe.test(pathParam)) {
      query.safe = safeParam
    }
  }

  return query
}

export const useTransactionMagicLink = (): { tx: SafeTransaction | undefined; txKey: string | undefined } => {
  const queryParams = useParams()
  const dispatch = useAppDispatch()
  const safeCoreSDK = useSafeSDK()

  // Dynamic query params
  const query = queryParams && queryParams.tx ? queryParams : getLocationQuery()
  const encodedTx = query.tx?.toString() ?? undefined

  const [tx, setTx] = useState<SafeTransaction | undefined>()
  const [txKey, setTxKey] = useState<string | undefined>()

  useEffect(() => {
    if (encodedTx) {
      setTx(decodeTransactionMagicLink(encodedTx))
    } else {
      setTx(undefined)
    }
  }, [encodedTx])

  useEffect(() => {
    if (tx && safeCoreSDK) {
      transactionKey(tx)
        .then(setTxKey)
        .catch((_e) => {
          setTxKey(undefined)

          const e = asError(_e)
          dispatch(
            showNotification({
              message: 'Could not load smart link, please check the URL and try again.',
              groupKey: 'smart-link-error',
              variant: 'error',
              detailedMessage: e.message,
            }),
          )
          trackError(ErrorCodes._105, e.message)
        })
    } else {
      setTxKey(undefined)
    }
  }, [tx, safeCoreSDK, dispatch])

  return { tx, txKey }
}

export const useShareMagicLink = (tx: SafeTransaction | undefined): string | undefined => {
  const [encodedTx, setEncodedTx] = useState<string | undefined>()

  useEffect(() => {
    if (tx) {
      setEncodedTx(encodeTransactionMagicLink(tx))
    } else {
      setEncodedTx(undefined)
    }
  }, [tx])

  return encodedTx
}

export const useMagicLink = () => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  const { tx, txKey } = useTransactionMagicLink()

  useEffect(() => {
    if (chainId && safeAddress && tx && txKey) {
      dispatch(addOrUpdateTx({ chainId, safeAddress, tx, txKey }))
    }
  }, [chainId, safeAddress, tx, txKey, dispatch])
}

export const useAddOrUpdateTx = () => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const safeCoreSDK = useSafeSDK()

  const addOrUpdate = useCallback(
    async (tx: SafeTransaction) => {
      if (!safeCoreSDK) return
      const txKey = await transactionKey(tx)
      dispatch(addOrUpdateTx({ chainId, safeAddress, tx, txKey }))

      return txKey
    },
    [dispatch, chainId, safeAddress, safeCoreSDK],
  )

  return addOrUpdate
}
