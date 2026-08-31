import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Role, Permission, PaginatedResult } from '@/types/api.types'

export const roleService = {

  async getAllRoles(params?: {
    current?: number
    pageSize?: number
    page?: number
    limit?: number
    name?: string
    search?: string
    is_active?: boolean | string
  }): Promise<PaginatedResult<Role>> {
    return api.get<PaginatedResult<Role>>(API_CONFIG.ENDPOINTS.ROLES.LIST, params)
  },

  async getRoleById(id: string): Promise<Role> {
    return api.get<Role>(API_CONFIG.ENDPOINTS.ROLES.BY_ID(id))
  },

  async createRole(payload: { name: string; description?: string; permissions?: string[]; is_active?: boolean }): Promise<Role> {
    return api.post<Role>(API_CONFIG.ENDPOINTS.ROLES.LIST, payload)
  },

  async updateRole(id: string, payload: { name?: string; description?: string; permissions?: string[]; is_active?: boolean }): Promise<Role> {
    return api.put<Role>(API_CONFIG.ENDPOINTS.ROLES.BY_ID(id), payload)
  },

  async deleteRole(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.ROLES.BY_ID(id))
  },

  async assignUserRole(userId: string, role: string): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.ROLES.ASSIGN(userId), { role })
  },

  async seedDefaultRolesAndPermissions(): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_CONFIG.ENDPOINTS.ROLES.SEED_DEFAULT)
  },

  async getAllPermissions(params?: {
    module?: string
    current?: number
    pageSize?: number
    page?: number
    limit?: number
    search?: string
  } | string): Promise<PaginatedResult<Permission>> {
    const query = typeof params === 'string' ? { module: params } : params
    return api.get<PaginatedResult<Permission>>(API_CONFIG.ENDPOINTS.PERMISSIONS.LIST, query)
  },

  async getPermissionById(id: string): Promise<Permission> {
    return api.get<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.BY_ID(id))
  },

  async createPermission(payload: Partial<Permission>): Promise<Permission> {
    return api.post<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.LIST, payload)
  },

  async updatePermission(id: string, payload: Partial<Permission>): Promise<Permission> {
    return api.put<Permission>(API_CONFIG.ENDPOINTS.PERMISSIONS.BY_ID(id), payload)
  },

  async deletePermission(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(API_CONFIG.ENDPOINTS.PERMISSIONS.BY_ID(id))
  },
}
