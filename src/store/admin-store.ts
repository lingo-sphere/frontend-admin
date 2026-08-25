import { create } from 'zustand'
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

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark'
  const savedTheme = window.localStorage.getItem('lingosphere-admin-theme')
  const theme = savedTheme === 'light' ? 'light' : 'dark'
  applyThemeToDOM(theme)
  return theme
}

const getInitialNavItem = (): string => {
  if (typeof window === 'undefined') return 'dashboard'
  return pathToNavItem(window.location.pathname)
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  theme: getInitialTheme(),
  activeNavItem: getInitialNavItem(),
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lingosphere-admin-theme', theme)
      applyThemeToDOM(theme)
    }
    set({ theme })
  },
  toggleTheme: () => {
    const current = get().theme
    const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lingosphere-admin-theme', nextTheme)
      applyThemeToDOM(nextTheme)
    }
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

export const adminStore = useAdminStore

// Listen to browser Back / Forward buttons
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const navItem = pathToNavItem(window.location.pathname)
    useAdminStore.setState({ activeNavItem: navItem })
  })
}
