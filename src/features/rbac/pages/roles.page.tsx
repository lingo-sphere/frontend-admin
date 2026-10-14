// Trang quản trị các vai trò và quyền hạn RBAC trong giao diện Admin.
import { useState } from 'react'
import { Shield, Sparkles, Plus, RotateCcw } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { roleService } from '@/features/rbac/services/role.service'
import { toast } from '@/store/toast.store'
import type { Role } from '@/types/api.types'
import { RolesListTab } from '@/features/rbac/components/roles.list.tab'
import { RoleEditModal } from '@/features/rbac/components/role.edit.modal'
import {
  useAllPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/features/rbac/hooks/use.rbac.query'
import { rbacKeys } from '@/features/rbac/keys/rbac.keys'

export function RolesPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const queryClient = useQueryClient()
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)

  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(
    () => queryClient.invalidateQueries({ queryKey: rbacKeys.roles() })
  )

  const { data: allPermissions = [] } = useAllPermissionsQuery(isRoleModalOpen)

  const createRoleMutation = useCreateRoleMutation()
  const updateRoleMutation = useUpdateRoleMutation()
  const deleteRoleMutation = useDeleteRoleMutation()

  const isSubmitting = createRoleMutation.isPending || updateRoleMutation.isPending

  const handleSeedRBAC = async () => {
    setIsSeeding(true)
    try {
      await roleService.seedDefaultRolesAndPermissions()
      toast.success('Khởi tạo ma trận quyền hạn (RBAC) và vai trò mặc định thành công!')
      await queryClient.invalidateQueries({ queryKey: rbacKeys.all })
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
    try {
      if (editingRole) {
        await updateRoleMutation.mutateAsync({ id: editingRole._id, payload })
        toast.success(`Đã cập nhật vai trò ${payload.name} thành công!`)
      } else {
        await createRoleMutation.mutateAsync(payload)
        toast.success(`Đã tạo vai trò ${payload.name} mới thành công!`)
      }
      setIsRoleModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu vai trò thất bại'
      toast.error(msg)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRoleMutation.mutateAsync(roleId)
      toast.success('Đã xóa vai trò thành công!')
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSeedRBAC}
            disabled={isSeeding}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title={isVi ? 'Tự động khởi tạo quyền hạn mẫu' : 'Initialize default RBAC permissions'}
          >
            <Sparkles className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isVi ? 'Khởi tạo RBAC Mẫu' : 'Seed Default RBAC'}</span>
          </button>

          <button
            onClick={handleOpenCreateRole}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-sm shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Thêm mới' : 'Add New'}</span>
          </button>

          <button
            onClick={() => handleRefresh()}
            disabled={isRefreshing || isSeeding}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-colors cursor-pointer disabled:opacity-60"
            title={isVi ? 'Làm mới' : 'Refresh'}
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing || isSeeding ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      <RolesListTab
        onOpenEditRole={handleOpenEditRole}
        onDeleteRole={handleDeleteRole}
        isLoading={isSeeding || isRefreshing}
      />

      <RoleEditModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        editingRole={editingRole}
        allPermissions={allPermissions}
        onSave={handleSaveRole}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
