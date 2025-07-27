import { useCallback, useEffect } from 'react'
import { showNotification, closeNotification } from '@/store/notificationsSlice'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from './useSafeInfo'
import { useAppDispatch } from '@/store'
import { isValidMasterCopy } from '@/services/contracts/safeContracts'
import { useRouter } from 'next/router'
import useIsSafeOwner from './useIsSafeOwner'
import { isValidSafeVersion } from './coreSDK/safeCoreSDK'
import useSafeAddress from '@/hooks/useSafeAddress'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { OFFICIAL_APP_URL, REPO_LATEST_RELEASE_URL } from '@/config/constants'

const REPO_LINK = {
  href: REPO_LATEST_RELEASE_URL,
  title: 'Check for Eternal Safe updates',
}

const OFFICIAL_LINK = {
  href: OFFICIAL_APP_URL,
  title: 'Safe{Wallet}',
}

type DismissedUpdateNotifications = {
  [chainId: string]: {
    [address: string]: number
  }
}

const DISMISS_NOTIFICATION_KEY = 'dismissUpdateSafe'
const OUTDATED_VERSION_KEY = 'safe-outdated-version'

const isUpdateSafeNotification = (groupKey: string) => {
  return groupKey === OUTDATED_VERSION_KEY
}

/**
 * General-purpose notifications relating to the entire Safe
 */
const useSafeNotifications = (): void => {
  const [dismissedUpdateNotifications, setDismissedUpdateNotifications] =
    useLocalStorage<DismissedUpdateNotifications>(DISMISS_NOTIFICATION_KEY)
  const dispatch = useAppDispatch()
  const { query } = useRouter()
  const { safe, safeAddress } = useSafeInfo()
  const { chainId, version, implementationVersionState } = safe
  const isOwner = useIsSafeOwner()
  const urlSafeAddress = useSafeAddress()

  const dismissUpdateNotification = useCallback(
    (groupKey: string) => {
      const EXPIRY_DAYS = 90

      if (!isUpdateSafeNotification(groupKey)) return

      const expiryDate = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000

      const newState = {
        ...dismissedUpdateNotifications,
        [safe.chainId]: {
          ...dismissedUpdateNotifications?.[safe.chainId],
          [safe.address.value]: expiryDate,
        },
      }

      setDismissedUpdateNotifications(newState)
    },
    [dismissedUpdateNotifications, safe.address.value, safe.chainId, setDismissedUpdateNotifications],
  )

  /**
   * Show a notification when the Safe version is out of date
   */

  useEffect(() => {
    if (safeAddress !== urlSafeAddress) return
    if (!isOwner) return

    const dismissedNotificationTimestamp = dismissedUpdateNotifications?.[chainId]?.[safeAddress]

    if (dismissedNotificationTimestamp) {
      if (Date.now() >= dismissedNotificationTimestamp) {
        const newState = { ...dismissedUpdateNotifications }
        delete newState?.[chainId]?.[safeAddress]

        setDismissedUpdateNotifications(newState)
      } else {
        return
      }
    }

    if (implementationVersionState !== ImplementationVersionState.OUTDATED) return

    const isUnsupported = !isValidSafeVersion(version)

    const id = dispatch(
      showNotification({
        variant: 'warning',
        groupKey: OUTDATED_VERSION_KEY,

        message: isUnsupported
          ? `Safe Account version ${version} is not supported by Eternal Safe. You can update your Safe Account in Safe{Wallet}.`
          : `Your Safe Account version ${version} is out of date. Please update it using Safe{Wallet}.`,

        link: OFFICIAL_LINK,

        onClose: () => dismissUpdateNotification(OUTDATED_VERSION_KEY),
      }),
    )

    return () => {
      dispatch(closeNotification({ id }))
    }
  }, [
    dispatch,
    implementationVersionState,
    version,
    query.safe,
    isOwner,
    safeAddress,
    urlSafeAddress,
    chainId,
    dismissedUpdateNotifications,
    setDismissedUpdateNotifications,
    dismissUpdateNotification,
  ])

  /**
   * Show a notification when the Safe master copy is not supported
   */

  useEffect(() => {
    if (isValidMasterCopy(safe.implementationVersionState)) return

    const id = dispatch(
      showNotification({
        variant: 'warning',
        message: `This Safe Account was created with an unsupported base contract.
            Eternal Safe may not work correctly, proceed at your own risk.`,
        groupKey: 'invalid-mastercopy',
        link: REPO_LINK,
      }),
    )

    return () => {
      dispatch(closeNotification({ id }))
    }
  }, [dispatch, safe.implementationVersionState])
}

export default useSafeNotifications
