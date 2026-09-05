/**
 * @file roles.page.tsx
 * @description Trang quản trị RolesPage trong giao diện Admin
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield } from 'lucide-react'
import { roleService } from '@/services/role.service'
import { toast } from '@/store/toast.store'
import type { Role, Permission } from '@/types/api.types'
import { RolesListTab } from '@/components/roles/roles.list.tab'
import { RoleEditModal } from '@/components/roles/role.edit.modal'

export function RolesPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.allSettled([
        roleService.getAllRoles({ pageSize: 50 }),
        roleService.getAllPermissions({ pageSize: 100 }),
      ])

      if (rolesRes.status === 'fulfilled' && rolesRes.value) {
        const rVal = rolesRes.value
        const items = Array.isArray(rVal) ? rVal : (rVal?.result || [])
        setRoles(items)
      }
      if (permsRes.status === 'fulfilled' && permsRes.value) {
        const pVal = permsRes.value
        const items = Array.isArray(pVal) ? pVal : (pVal?.result || [])
        setPermissions(items)
      }
    } catch (err) {
      console.warn('Error loading Roles data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSeedRBAC = async () => {
    setIsLoading(true)
    try {
      await roleService.seedDefaultRolesAndPermissions()
      toast.success('Khởi tạo ma trận quyền hạn (RBAC) và vai trò mặc định thành công!')
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khởi tạo thất bại'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenCreateRole = () => {
    setEditingRole(null)
    setIsRoleModalOpen(true)
  }

  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role)
    setIsRoleModalOpen(true)
  }

  const handleSaveRole = async (payload: {
    name: string
    description: string
    permissions: string[]
    is_active: boolean
  }) => {
    setIsSubmitting(true)
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole._id, payload)
        toast.success(`Đã cập nhật vai trò ${payload.name} thành công!`)
      } else {
        await roleService.createRole(payload)
        toast.success(`Đã tạo vai trò ${payload.name} mới thành công!`)
      }
      setIsRoleModalOpen(false)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu vai trò thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await roleService.deleteRole(roleId)
      toast.success('Đã xóa vai trò thành công!')
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa vai trò thất bại'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Quản Lý Vai Trò (Roles)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập danh mục các nhóm vai trò và phân bổ quyền hạn truy cập cho từng chức danh
          </p>
        </div>
      </div>

      <RolesListTab
        roles={roles}
        permissions={permissions}
        onOpenCreateRole={handleOpenCreateRole}
        onOpenEditRole={handleOpenEditRole}
        onDeleteRole={handleDeleteRole}
        onRefresh={loadData}
        onSeedDefaultRBAC={handleSeedRBAC}
        isLoading={isLoading}
      />

      <RoleEditModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        editingRole={editingRole}
        allPermissions={permissions}
        onSave={handleSaveRole}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
