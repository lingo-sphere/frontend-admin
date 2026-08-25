import { useSyncExternalStore } from 'react'
import { createStore } from 'zustand/vanilla'
import { navItemToPath, pathToNavItem } from '@/utils/navigation'

type ThemeMode = 'light' | 'dark'

interface AdminStore {
  theme: ThemeMode
  activeNavItem: string
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setActiveNavItem: (activeNavItem: string) => void
  toggleSidebarCollapsed: () => void
  setMobileSidebarOpen: (open: boolean) => void
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'
  const savedTheme = window.localStorage.getItem('lingosphere-admin-theme')
  return savedTheme === 'light' ? 'light' : 'dark'
}

const getInitialNavItem = (): string => {
  if (typeof window === 'undefined') return 'dashboard'
  return pathToNavItem(window.location.pathname)
}

export const adminStore = createStore<AdminStore>()((set, get) => ({
  theme: getInitialTheme(),
  activeNavItem: getInitialNavItem(),
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('lingosphere-admin-theme', theme)
    set({ theme })
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'light' ? 'dark' : 'light'
    if (typeof window !== 'undefined') window.localStorage.setItem('lingosphere-admin-theme', nextTheme)
    set({ theme: nextTheme })
  },
  setActiveNavItem: (activeNavItem) => {
    if (typeof window !== 'undefined') {
      const targetPath = navItemToPath(activeNavItem)
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath)
      }
    }
    set({ activeNavItem })
  },
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
}))

// Listen to browser Back / Forward buttons
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const navItem = pathToNavItem(window.location.pathname)
    adminStore.setState({ activeNavItem: navItem })
  })
}

export function useAdminStore<T>(selector: (state: AdminStore) => T): T {
  return useSyncExternalStore(
    adminStore.subscribe,
    () => selector(adminStore.getState()),
    () => selector(adminStore.getInitialState()),
  )
}
