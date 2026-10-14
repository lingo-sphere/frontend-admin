// Service xử lý các logic nghiệp vụ xác thực tài khoản quản trị viên
import { api, apiClient } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import {
  AuthUserSchema,
  LoginResponseSchema,
  RegisterResponseSchema,
  type AuthUser,
  type LoginResponse,
  type RegisterResponse,
} from '@/features/users/schemas/user.schema'

export type { AuthUser, LoginResponse, RegisterResponse }

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  role?: string
}

export interface ChangePasswordPayload {
  old_password: string
  new_password: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return api.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        ...credentials,
        remember_me: credentials.rememberMe !== false,
      },
      LoginResponseSchema
    )
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return api.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      payload,
      RegisterResponseSchema
    )
  },

  async logout(): Promise<{ message: string }> {
    try {
      const refreshToken = storage.cookie.get(STORAGE_KEYS.REFRESH_TOKEN)
      const res = await apiClient.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          headers: refreshToken ? { 'x-refresh-token': refreshToken } : undefined,
        },
      )
      return res.data
    } catch {
      return { message: 'Logged out successfully' }
    } finally {
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.remove(STORAGE_KEYS.USER)
      storage.session.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.session.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.session.remove(STORAGE_KEYS.USER)
      storage.cookie.remove(STORAGE_KEYS.ACCESS_TOKEN)
      storage.cookie.remove(STORAGE_KEYS.REFRESH_TOKEN)
      storage.cookie.remove(STORAGE_KEYS.USER)
    }
  },

  async getMe(): Promise<AuthUser> {
    return api.get<AuthUser>(API_CONFIG.ENDPOINTS.AUTH.ME, undefined, AuthUserSchema)
  },

  async getRolePermissions(roleIdOrName: string): Promise<import('@/types/api.types').PermissionItem[]> {
    return api.get<import('@/types/api.types').PermissionItem[]>(`/roles/${encodeURIComponent(roleIdOrName)}/permissions`)
  },

  async changePassword(userId: string, payload: ChangePasswordPayload): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD(userId), {
      old_password: payload.old_password,
      new_password: payload.new_password,
    })
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      new_password: newPassword,
    })
  },
}
