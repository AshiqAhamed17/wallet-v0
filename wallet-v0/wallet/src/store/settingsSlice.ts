import type { TOKEN_LISTS as TOKEN_LISTS_TYPE } from './settingsSlice'

export const selectSettings = (): { tokenList: TOKEN_LISTS_TYPE } => ({ tokenList: 'TRUSTED' as TOKEN_LISTS_TYPE })

export const selectCurrency = () => ({})

export const selectRpc = () => ({})

export const selectTenderly = () => ({})

export const setTokenList = (list: any) => ({})

export const setRpc = () => ({})

export const setIPFS = () => ({})

export const setTenderly = () => ({})

export const setTransactionExecution = () => ({})

export const setQrShortName = () => ({})

export const setDarkMode = () => ({})

export const TOKEN_LISTS = {
  TRUSTED: 'TRUSTED',
  ALL: 'ALL',
} as const

export type TOKEN_LISTS = (typeof TOKEN_LISTS)[keyof typeof TOKEN_LISTS]
