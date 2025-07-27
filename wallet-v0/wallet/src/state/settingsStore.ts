import create from 'zustand'

interface SettingsState {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  language: string
  setLanguage: (lang: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set(() => ({ theme })),
  language: 'en',
  setLanguage: (language) => set(() => ({ language })),
}))
