import { useSyncExternalStore } from 'react'
import { createStore } from 'zustand/vanilla'
import { authService, type LoginCredentials } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import { API_CONFIG } from '@/config/api.config'
import type { AuthUser, UserProfile } from '@/types/api.types'

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  fetchCurrentUser: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>
  initAuth: () => Promise<void>
}

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
}

const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER)
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
  isAuthenticated: Boolean(getStoredToken()),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authService.login(credentials)
      const { user, access_token, refresh_token } = res

      if (typeof window !== 'undefined') {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, access_token)
        if (refresh_token) {
          localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
        }
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user))
      }

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      // Fetch full profile in background
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
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
      }
      set({
        user: null,
        profile: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  fetchCurrentUser: async () => {
    const token = get().token || getStoredToken()
    if (!token) return

    try {
      const user = await authService.getMe()
      const profile = await userService.getMyProfile()

      if (typeof window !== 'undefined') {
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user))
      }

      set({
        user,
        profile,
        isAuthenticated: true,
      })
    } catch (err) {
      console.warn('Failed to fetch current user profile:', err)
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
    }
  },
}))

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  return useSyncExternalStore(
    authStore.subscribe,
    () => selector(authStore.getState()),
    () => selector(authStore.getInitialState()),
  )
}
