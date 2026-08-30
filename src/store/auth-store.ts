import { useSyncExternalStore } from 'react'
import { createStore } from 'zustand/vanilla'
import { authService, type LoginCredentials } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { API_CONFIG } from '@/config/api.config'
import type { AuthUser, PermissionItem, UserProfile } from '@/types/api.types'

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  token: string | null
  permissions: PermissionItem[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  clearLocalSession: () => void
  fetchCurrentUser: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>
  initAuth: () => Promise<void>
  hasPermission: (method: string, apiPath: string) => boolean
  hasModulePermission: (module: string) => boolean
}

const matchRoutePattern = (pattern: string, path: string): boolean => {
  if (!pattern || !path) return false
  if (pattern === path) return true
  const cleanPattern = pattern.replace(/\/+$/, '')
  const cleanPath = path.replace(/\/+$/, '')
  if (cleanPattern === cleanPath) return true
  const regexPattern = cleanPattern.replace(/:[a-zA-Z0-9_]+/g, '[^/]+')
  const regex = new RegExp(`^${regexPattern}$`)
  return regex.test(cleanPath)
}

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN) || sessionStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
}

const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER) || sessionStorage.getItem(API_CONFIG.STORAGE_KEYS.USER)
  if (!saved) return null
  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}

export const authStore = createStore<AuthState>()((set, get) => ({
  user: getStoredUser(),
  profile: null,
  token: getStoredToken(),
  permissions: getStoredUser()?.permissions || [],
  isAuthenticated: Boolean(getStoredToken()),
  isLoading: false,
  error: null,

  hasPermission: (method: string, apiPath: string) => {
    const { user, profile, permissions } = get()
    const role = (user?.role || profile?.role || '').toUpperCase()
    if (role === 'ADMIN') return true

    const targetMethod = method.toUpperCase()
    return permissions.some((p) => {
      const methodMatches = (p.method || 'GET').toUpperCase() === targetMethod
      const pathMatches = matchRoutePattern(p.api_path, apiPath)
      return methodMatches && pathMatches
    })
  },

  hasModulePermission: (module: string) => {
    const { user, profile, permissions } = get()
    const role = (user?.role || profile?.role || '').toUpperCase()
    if (role === 'ADMIN') return true

    const targetModule = module.toUpperCase()
    return permissions.some((p) => p.module?.toUpperCase() === targetModule)
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.login(credentials)
      const { user, access_token } = res

      let permissions: PermissionItem[] = user.permissions || []
      if (!permissions || permissions.length === 0) {
        try {
          permissions = await authService.getRolePermissions(user.role)
        } catch {
          permissions = []
        }
      }

      const updatedUser: AuthUser = { ...user, permissions }

      if (typeof window !== 'undefined') {
        const isRemember = credentials.rememberMe !== false
        const primaryStorage = isRemember ? localStorage : sessionStorage
        const secondaryStorage = isRemember ? sessionStorage : localStorage

        secondaryStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
        secondaryStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)

        primaryStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, access_token)
        primaryStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      }

      set({
        user: updatedUser,
        token: access_token,
        permissions,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      try {
        const profile = await userService.getMyProfile()
        set({ profile })
      } catch (profileErr) {
        console.warn('Could not fetch user profile immediately:', profileErr)
      }

      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập không thành công'
      set({ isLoading: false, error: msg })
      throw err
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
    } catch (err) {
      console.warn('Logout error (clearing local session anyway):', err)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
        sessionStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
        sessionStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
      }
      set({
        user: null,
        profile: null,
        token: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  clearLocalSession: () => {
    set({
      user: null,
      profile: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  fetchCurrentUser: async () => {
    const token = get().token || getStoredToken()
    if (!token) return

    try {
      const user = await authService.getMe()
      const profile = await userService.getMyProfile()

      let permissions: PermissionItem[] = user.permissions || []
      const roleName = user.role || profile.role
      if (roleName && roleName.toUpperCase() !== 'ADMIN') {
        try {
          const freshPermissions = await authService.getRolePermissions(roleName)
          if (Array.isArray(freshPermissions)) {
            permissions = freshPermissions
          }
        } catch {
        }
      }

      const updatedUser: AuthUser = { ...user, permissions }

      if (typeof window !== 'undefined') {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(updatedUser))
      }

      set({
        user: updatedUser,
        profile,
        permissions,
        isAuthenticated: true,
      })
    } catch (err) {
      console.warn('Failed to fetch current user profile (token expired), logging out:', err)
      await get().logout()
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const updated = await userService.updateMyProfile(data)
    set({ profile: updated })
    return updated
  },

  initAuth: async () => {
    const token = getStoredToken()
    if (token) {
      set({ isAuthenticated: true, token })
      await get().fetchCurrentUser()
    } else {
      set({ isAuthenticated: false, token: null, user: null, permissions: [] })
    }
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('lingosphere:unauthorized', () => {
    authStore.getState().logout()
  })
}

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  return useSyncExternalStore(
    authStore.subscribe,
    () => selector(authStore.getState()),
    () => selector(authStore.getInitialState()),
  )
}
