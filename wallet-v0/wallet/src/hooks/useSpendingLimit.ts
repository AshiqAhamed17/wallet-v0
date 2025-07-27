import { useSettingsStore } from '@/state/settingsStore'

export const useSpendingLimit = () => {
  const spendingLimits = useSettingsStore((state) => state.spendingLimits)
  return spendingLimits
}
