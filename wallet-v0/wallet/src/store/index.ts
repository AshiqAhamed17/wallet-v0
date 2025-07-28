// Temporary stub for old Redux store imports
// This will be replaced with Zustand stores as we refactor

export const useAppSelector = (selector: any) => {
  if (selector.name === 'selectSettings') {
    return {
      tokenList: 'TRUSTED',
      shortName: {
        show: false,
        copy: false,
      },
    }
  }
  if (selector.name === 'selectAllAddressBooks') {
    return {} as Record<string, string>
  }
  if (selector.name === 'selectChains') {
    return { data: [] }
  }
  return undefined
}

export const useAppDispatch = () => {
  // Stub implementation
  return (action: any) => {
    // Stub implementation - just return the action
    return action
  }
}

export const getPersistedState = () => {
  // Stub implementation
  return {}
}
