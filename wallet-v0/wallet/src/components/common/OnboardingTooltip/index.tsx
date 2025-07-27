import type { ReactElement } from 'react'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { TooltipProps } from '@mui/material'
import { Box, Button, SvgIcon, Tooltip } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import { useDarkMode } from '@/hooks/useDarkMode'

/**
 * The OnboardingTooltip renders a sticky Tooltip with an arrow pointing towards the wrapped component.
 * This Tooltip contains a button to hide it. This decision will be stored in the local storage such that the OnboardingTooltip will only popup until clicked away once.
 * Also allows a post tooltip to be shown after the initial tooltip is hidden.
 */
export const OnboardingTooltip = ({
  children,
  widgetLocalStorageId,
  text,
  postText,
  initiallyShown = true,
  className,
  placement,
  open,
  onOpen,
  onClose,
}: {
  children: ReactElement // NB: this has to be an actual HTML element, otherwise the Tooltip will not work
  widgetLocalStorageId: string
  text: string | ReactElement
  postText?: string | ReactElement
  initiallyShown?: boolean
  className?: string
  placement?: TooltipProps['placement']
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
}): ReactElement => {
  const [widgetHidden = !initiallyShown, setWidgetHidden] = useLocalStorage<boolean>(widgetLocalStorageId)
  const isDarkMode = useDarkMode()

  if (widgetHidden && postText) {
    return (
      <Tooltip
        key="postTooltip"
        PopperProps={{
          className,
        }}
        title={postText}
        disableInteractive
        placement="top"
        open={open}
        onOpen={onOpen}
        onClose={onClose}
      >
        {children}
      </Tooltip>
    )
  }

  if (widgetHidden || !text) {
    return children
  }

  return (
    <Tooltip
      key="onboardingTooltip"
      PopperProps={{
        className,
      }}
      open
      placement={placement}
      arrow
      title={
        <Box display="flex" alignItems="center" gap={1} padding={1}>
          <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" />
          <span>{text}</span>
          <Button
            size="small"
            color={isDarkMode ? 'background' : 'secondary'}
            variant="text"
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() => setWidgetHidden(true)}
          >
            Got it!
          </Button>
        </Box>
      }
    >
      {children}
    </Tooltip>
  )
}
