// Updated: 2026-08-22
// Store chính của admin dashboard, quản lý:
// - theme: light/dark mode (persist localStorage)
// - activeNavItem: navigation state
// - sidebarCollapsed: thu gọn/mở rộng sidebar (252px ↔ 72px)
// - mobileSidebarOpen: toggle sidebar trên mobile

import { useSyncExternalStore } from 'react'
import { createStore } from 'zustand/vanilla'

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
  if (typeof window === 'undefined') return 'light'
  const savedTheme = window.localStorage.getItem('lingosphere-admin-theme')
  return savedTheme === 'dark' ? 'dark' : 'light'
}

export const adminStore = createStore<AdminStore>()((set, get) => ({
  theme: getInitialTheme(),
  activeNavItem: 'dashboard',
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
  setActiveNavItem: (activeNavItem) => set({ activeNavItem }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
}))

export function useAdminStore<T>(selector: (state: AdminStore) => T): T {
  return useSyncExternalStore(
    adminStore.subscribe,
    () => selector(adminStore.getState()),
    () => selector(adminStore.getInitialState()),
  )
}
