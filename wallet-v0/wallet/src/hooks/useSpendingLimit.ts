import { useSettingsStore } from '@/state/settingsStore'

const useSpendingLimit = (tokenInfo?: any) => {
  const spendingLimits = useSettingsStore((state) => state.spendingLimits)
  return spendingLimits
}

export default useSpendingLimit
