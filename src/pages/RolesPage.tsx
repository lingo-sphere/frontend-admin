import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield } from 'lucide-react'
import { roleService } from '@/services/role.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { Role, Permission } from '@/types/api.types'
import { RolesListTab } from '@/pages/roles/RolesListTab'
import { RoleEditModal } from '@/pages/roles/RoleEditModal'

export function RolesPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [rolesRes, permsRes] = await Promise.allSettled([
        roleService.getAllRoles(),
        roleService.getAllPermissions(),
      ])

      if (rolesRes.status === 'fulfilled' && rolesRes.value) {
        setRoles(rolesRes.value)
      }
      if (permsRes.status === 'fulfilled' && permsRes.value) {
        setPermissions(permsRes.value)
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

  // Role CRUD Handlers
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

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return
    setIsSubmitting(true)
    try {
      await roleService.deleteRole(deleteRoleId)
      toast.success('Đã xóa vai trò thành công!')
      setDeleteRoleId(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa vai trò thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
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

      {/* Roles List Table (Screenshot 2) */}
      <RolesListTab
        roles={roles}
        permissions={permissions}
        onOpenCreateRole={handleOpenCreateRole}
        onOpenEditRole={handleOpenEditRole}
        onDeleteRole={(roleId) => setDeleteRoleId(roleId)}
        onRefresh={loadData}
        onSeedDefaultRBAC={handleSeedRBAC}
        isLoading={isLoading}
      />

      {/* Role Edit / Create Modal (Screenshots 3 & 4) */}
      <RoleEditModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        editingRole={editingRole}
        allPermissions={permissions}
        onSave={handleSaveRole}
        isSubmitting={isSubmitting}
      />

      {/* Confirm Delete Role Modal */}
      <ConfirmModal
        isOpen={!!deleteRoleId}
        onClose={() => setDeleteRoleId(null)}
        onConfirm={handleDeleteRole}
        title="Xác nhận xóa vai trò"
        message="Bạn có chắc chắn muốn xóa vai trò này? Người dùng đang gắn vai trò này sẽ mất các quyền hạn tương ứng."
        confirmText="Xóa vai trò"
        cancelText="Hủy"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  )
}
