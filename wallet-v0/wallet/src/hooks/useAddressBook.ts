import { useAppSelector } from '@/store'
import { selectAddressBookByChain } from '@/store/addressBookSlice'
import useChainId from './useChainId'

const useAddressBook = () => {
  const chainId = useChainId()
  const result = useAppSelector((state) => selectAddressBookByChain(state, chainId))
  return result || {}
}

export default useAddressBook
