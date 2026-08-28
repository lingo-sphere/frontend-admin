import { api, apiClient } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { AuthUser, LoginResponse } from '@/types/api.types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  role?: string
}

export interface ChangePasswordPayload {
  old_password?: string
  current_password?: string
  new_password: string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return api.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials)
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    return api.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload)
  },

  async logout(): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.LOGOUT)
      return res.data
    } catch {
      return { message: 'Logged out successfully' }
    } finally {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
    }
  },

  async getMe(): Promise<AuthUser> {
    return api.get<AuthUser>(API_CONFIG.ENDPOINTS.AUTH.ME)
  },

  async changePassword(userId: string, payload: ChangePasswordPayload): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD(userId), payload)
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
