import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/config/api.config'
import type { ApiResponse } from '@/types/api.types'

// Tạo instance axios chuẩn
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Gắn Bearer Token & Correlation ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      if (config.headers && !config.headers['x-correlation-id']) {
        config.headers['x-correlation-id'] = `trace_adm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: Xử lý Format dữ liệu và Bắt lỗi 401
apiClient.interceptors.response.use(
  (response) => {
    // Trả về dữ liệu từ response
    return response
  },
  async (error: AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
        if (refreshToken) {
          const res = await axios.post<ApiResponse<{ access_token: string }>>(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            { refresh_token: refreshToken },
          )
          const newAccessToken = res.data?.data?.access_token || (res.data as unknown as { access_token: string })?.access_token
          if (newAccessToken) {
            localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, newAccessToken)
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            }
            return apiClient(originalRequest)
          }
        }
      } catch (refreshErr) {
        console.warn('Session expired, logging out...', refreshErr)
        if (typeof window !== 'undefined') {
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
          localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER)
          window.dispatchEvent(new CustomEvent('lingosphere:unauthorized'))
        }
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối tới máy chủ'

    return Promise.reject(new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : String(errorMessage)))
  },
)

// Generic API Service wrapper
export const api = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await apiClient.get<ApiResponse<T> | T>(url, { params })
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    const res = await apiClient.post<ApiResponse<T> | T>(url, data)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async put<T>(url: string, data?: unknown): Promise<T> {
    const res = await apiClient.put<ApiResponse<T> | T>(url, data)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const res = await apiClient.patch<ApiResponse<T> | T>(url, data)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async delete<T>(url: string): Promise<T> {
    const res = await apiClient.delete<ApiResponse<T> | T>(url)
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },

  async upload<T>(url: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    if (additionalData) {
      Object.entries(additionalData).forEach(([k, v]) => formData.append(k, v))
    }
    const res = await apiClient.post<ApiResponse<T> | T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return (res.data as ApiResponse<T>)?.data !== undefined ? (res.data as ApiResponse<T>).data : (res.data as T)
  },
}
