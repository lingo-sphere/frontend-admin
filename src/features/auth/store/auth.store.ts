// Store quản lý trạng thái phiên đăng nhập, quyền hạn và thông tin quản trị viên
interface StoreApi<T> {
  getState: () => T
  getInitialState: () => T
  setState: (updater: Partial<T> | ((state: T) => Partial<T>)) => void
  subscribe: (listener: () => void) => () => void
}

function createStore<T>() {
  return (
    initializer: (
      set: (updater: Partial<T> | ((state: T) => Partial<T>)) => void,
      get: () => T,
    ) => T,
  ): StoreApi<T> => {
    let state: T
    const listeners = new Set<() => void>()
    const getState = () => state
    const setState = (updater: Partial<T> | ((state: T) => Partial<T>)) => {
      const next = typeof updater === 'function' ? updater(state) : updater
      state = { ...state, ...next }
      listeners.forEach((listener) => listener())
    }
    const subscribe = (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
    state = initializer(setState, getState)
    const initialState = state
    return {
      getState,
      getInitialState: () => initialState,
      setState,
      subscribe,
    }
  }
}

import { useSyncExternalStore } from 'react'
import { authService, type LoginCredentials } from '@/features/auth/services/auth.service'
import { userService } from '@/features/users/services/user.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
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
  return storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN) || storage.session.get<string>(STORAGE_KEYS.ACCESS_TOKEN)
}

const getStoredUser = (): AuthUser | null => {
  const user = storage.get<AuthUser>(STORAGE_KEYS.USER) || storage.session.get<AuthUser>(STORAGE_KEYS.USER)
  if (user) {
    const role = (user.role || '').toUpperCase()
    if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
      return null
    }
  }
  return user
}

export const authStore = createStore<AuthState>()((set, get) => ({
  user: getStoredUser(),
  profile: null,
  token: getStoredToken(),
  permissions: getStoredUser()?.permissions || [],
  isAuthenticated: false,
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
      const { user, access_token, refresh_token } = res
      const role = (user?.role || '').toUpperCase()
      if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
        throw new Error('Tài khoản học viên (USER/LEARNER) không có quyền truy cập trang quản trị Admin.')
      }

      let permissions: PermissionItem[] = user.permissions || []
      if (!permissions || permissions.length === 0) {
        try {
          permissions = await authService.getRolePermissions(user.role)
        } catch {
          permissions = []
        }
      }

      const updatedUser: AuthUser = { ...user, permissions }

      const isRemember = credentials.rememberMe !== false
      const primaryStorage = isRemember ? storage : storage.session
      const secondaryStorage = isRemember ? storage.session : storage

      secondaryStorage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      secondaryStorage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      secondaryStorage.remove(STORAGE_KEYS.USER)

      primaryStorage.set(STORAGE_KEYS.ACCESS_TOKEN, access_token)
      primaryStorage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      if (refresh_token) {
        storage.cookie.set(STORAGE_KEYS.REFRESH_TOKEN, refresh_token, { days: 7 })
      }
      primaryStorage.set(STORAGE_KEYS.USER, updatedUser)

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
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      storage.session.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.session.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.session.remove(STORAGE_KEYS.USER)
      storage.cookie.remove(STORAGE_KEYS.REFRESH_TOKEN)
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
      const role = (user?.role || '').toUpperCase()
      if (role !== 'ADMIN' && role !== 'INSTRUCTOR') {
        await get().logout()
        return
      }
      let profile: UserProfile | null = null
      try {
        profile = await userService.getMyProfile()
      } catch (profileErr) {
        console.warn('Profile not found or not yet created, skipping profile load:', profileErr)
      }

      let permissions: PermissionItem[] = user.permissions || []
      const roleName = user.role || profile?.role
      if (roleName && roleName.toUpperCase() !== 'ADMIN') {
        try {
          const freshPermissions = await authService.getRolePermissions(roleName)
          if (Array.isArray(freshPermissions)) {
            permissions = freshPermissions
          }
        } catch {}
      }

      const updatedUser: AuthUser = { ...user, permissions }

      if (storage.has(STORAGE_KEYS.USER)) {
        storage.set(STORAGE_KEYS.USER, updatedUser)
      } else {
        storage.session.set(STORAGE_KEYS.USER, updatedUser)
      }

      set({
        user: updatedUser,
        profile,
        permissions,
        isAuthenticated: true,
      })
    } catch (err) {
      console.warn('Backend authentication failed or unavailable. Logging out admin:', err)
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
      set({ token })
      await get().fetchCurrentUser()
    } else {
      await get().logout()
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
