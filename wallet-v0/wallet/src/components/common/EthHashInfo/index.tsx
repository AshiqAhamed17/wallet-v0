import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import { selectSettings } from '@/store/settingsSlice'
import { getBlockExplorerLink } from '@/utils/chains'
import { type ReactElement } from 'react'
import SrcEthHashInfo, { type EthHashInfoProps } from './SrcEthHashInfo'

const EthHashInfo = ({
  showName = true,
  avatarSize = 40,
  ...props
}: EthHashInfoProps & { showName?: boolean }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const currentChainId = useChainId()
  const chain = useAppSelector((state: any) => selectChainById(state, props.chainId || currentChainId))
  const addressBook = useAddressBook()
  const link =
    chain && typeof chain === 'object' && 'chainId' in chain
      ? getBlockExplorerLink(chain as any, props.address)
      : undefined
  const name = showName ? (addressBook as Record<string, string>)[props.address] || props.name : undefined

  return (
    <SrcEthHashInfo
      prefix={typeof chain?.shortName === 'string' ? chain.shortName : undefined}
      showPrefix={typeof settings?.shortName === 'object' && settings?.shortName?.show}
      copyPrefix={typeof settings?.shortName === 'object' && settings?.shortName?.copy}
      {...props}
      name={name}
      customAvatar={props.customAvatar}
      ExplorerButtonProps={{ title: link?.title || '', href: link?.href || '' }}
      avatarSize={avatarSize}
    >
      {props.children}
    </SrcEthHashInfo>
  )
}

export default EthHashInfo
