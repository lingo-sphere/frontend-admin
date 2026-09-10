/**
 * @file admin.user.helper.ts
 * @description Mã nguồn thành phần admin-user.helper.ts
 */

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'INSTRUCTOR'
  is_active: boolean
  avatar?: string
  created_at: string
  last_active: string
  phone?: string
}

export type FilterRole = 'ALL' | 'ADMIN' | 'INSTRUCTOR'
export type FilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE'

export interface AdminUserStats {
  total: number
  admins: number
  teachers: number
  active: number
}
