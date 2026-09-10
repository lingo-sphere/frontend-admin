/**
 * @file use.permission.ts
 * @description Custom React hook use-permission trong ứng dụng Admin
 */

import { useAuthStore } from '@/features/auth/store/auth.store'

export function usePermission() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasModulePermission = useAuthStore((state) => state.hasModulePermission)
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const permissions = useAuthStore((state) => state.permissions)

  const role = (user?.role || profile?.role || '').toUpperCase()
  const isAdmin = role === 'ADMIN'

  const can = (method: string, apiPath: string): boolean => {
    if (isAdmin) return true
    return hasPermission(method, apiPath)
  }

  const canModule = (module: string): boolean => {
    if (isAdmin) return true
    return hasModulePermission(module)
  }

  return {
    can,
    canModule,
    isAdmin,
    permissions,
    role,
  }
}
