// Temporary stub for chains config
export const getChainLogo = (chainId: string, logoUri?: string) => {
  return typeof logoUri === 'string' ? logoUri : ''
}

export const getBlockExplorerLink = (_chain: any, _address: string) => ''
