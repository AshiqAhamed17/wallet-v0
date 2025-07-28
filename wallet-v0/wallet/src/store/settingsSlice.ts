// Temporary stub for settings slice

export const TOKEN_LISTS = {
  TRUSTED: 'TRUSTED',
  ALL: 'ALL',
} as const

export type TOKEN_LISTS = (typeof TOKEN_LISTS)[keyof typeof TOKEN_LISTS]

export const selectSettings = () => ({
  tokenList: 'TRUSTED' as TOKEN_LISTS,
  shortName: {
    show: false,
    copy: false,
  },
})

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
