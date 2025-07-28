// Temporary stub for notifications slice
export type Notification = {
  link?: any
  title?: string
  message?: string
  detailedMessage?: string
  id?: string
  isDismissed?: boolean
  onClose?: () => void
  groupKey?: string
  variant: any
}

export const selectNotifications = () => [
  {
    id: 'stub',
    title: 'Stub Notification',
    message: 'This is a stub notification.',
    detailedMessage: 'Details here.',
    isDismissed: false,
    groupKey: 'default',
    onClose: () => {},
    link: { href: '' },
    variant: 'info',
  },
]
export const closeNotification = (data?: any) => ({})
export const readNotification = (data?: any) => ({})
