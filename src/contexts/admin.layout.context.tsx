// Quản lý trạng thái giao diện, theme và thu phóng thanh bên của trang quản trị
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export type ThemeMode = 'light' | 'dark'

interface AdminLayoutContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  mobileSidebarOpen: boolean
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
  if (typeof window === 'undefined') return 'light'
  const savedTheme = storage.get<ThemeMode>(STORAGE_KEYS.THEME)
  const theme = savedTheme === 'dark' ? 'dark' : 'light'
  applyThemeToDOM(theme)
  return theme
}

export const AdminLayoutContext = createContext<AdminLayoutContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  toggleSidebarCollapsed: () => {},
  mobileSidebarOpen: false,
  setMobileSidebarOpen: () => {},
})

export function useAdminLayout() {
  return useContext(AdminLayoutContext)
}

interface AdminLayoutProviderProps {
  children: ReactNode
}

export function AdminLayoutProvider({ children }: AdminLayoutProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    storage.set(STORAGE_KEYS.THEME, nextTheme)
    applyThemeToDOM(nextTheme)
    setThemeState(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark'
      storage.set(STORAGE_KEYS.THEME, next)
      applyThemeToDOM(next)
      return next
    })
  }, [])

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  return (
    <AdminLayoutContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  )
}
