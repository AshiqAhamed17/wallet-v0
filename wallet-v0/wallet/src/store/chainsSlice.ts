// Temporary stub for chains slice
export const selectChainById = (state: any, id: string) => ({
  chainName: 'Test Chain',
  chainId: id,
  theme: {
    backgroundColor: '#1976d2',
    textColor: '#ffffff',
  },
  nativeCurrency: {
    logoUri: '', // must always be a string
  },
})

export const selectChains = () => ({ data: [] })
