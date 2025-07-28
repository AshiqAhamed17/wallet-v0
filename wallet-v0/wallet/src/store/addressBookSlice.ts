// Temporary stub for address book slice
export type AddressBookState = Record<string, string>

export const selectAllAddressBooks = () => ({} as Record<string, string>)

export const selectAddressBookByChain = () => ({} as Record<string, string>)

export const upsertAddressBookEntry = (data: any) => ({})

export const removeAddressBookEntry = (data: { chainId: string; address: string }) => ({})
