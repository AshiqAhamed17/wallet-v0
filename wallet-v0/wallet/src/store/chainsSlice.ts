// Temporary stub for chains slice
export const selectChainById = (state: any, id: string) => ({
  chainName: 'Test Chain',
  chainId: id,
  theme: {
    backgroundColor: '#1976d2',
    textColor: '#ffffff',
  },
  nativeCurrency: {
    logoUri: '',
  },
})

export const selectChains = () => ({ data: [] })
