// Trang quan tri RolesPage trong giao dien Admin.

import { useState } from 'react'
import { Shield } from 'lucide-react'
import { roleService } from '@/features/rbac/services/role.service'
import { toast } from '@/store/toast.store'
import type { Role, Permission } from '@/types/api.types'
import { RolesListTab } from '@/features/rbac/components/roles.list.tab'
import { RoleEditModal } from '@/features/rbac/components/role.edit.modal'
import { useRolesQuery, usePermissionsQuery } from '@/features/rbac/hooks/use.rbac.query'

export function RolesPage() {
  const { data: roles = [], isLoading: isRolesLoading, refetch: refetchRoles } = useRolesQuery()
  const { data: permissions = [], isLoading: isPermsLoading, refetch: refetchPerms } = usePermissionsQuery()
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const isLoading = isRolesLoading || isPermsLoading || isSeeding

  const loadData = async () => {
    await Promise.all([refetchRoles(), refetchPerms()])
  }

  const handleSeedRBAC = async () => {
    setIsSeeding(true)
    try {
      await roleService.seedDefaultRolesAndPermissions()
      toast.success('Khởi tạo ma trận quyền hạn (RBAC) và vai trò mặc định thành công!')
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Khởi tạo thất bại'
      toast.error(msg)
    } finally {
      setIsSeeding(false)
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
