// Temporary stub for old Redux store imports
// This will be replaced with Zustand stores as we refactor
import { TOKEN_LISTS } from './settingsSlice'

export const useAppSelector = (selector: any) => {
  // Stub implementation
  if (selector.name === 'selectSettings') {
    return { tokenList: TOKEN_LISTS.TRUSTED }
  }
  if (selector.name === 'selectAllAddressBooks') {
    return {} as Record<string, string>
  }
  return {}
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
