// Trang quản trị danh sách quyền hạn và gán quyền người dùng trong giao diện Admin.
import { useState } from 'react'
import { KeyRound, UserCheck } from 'lucide-react'
import { toast } from '@/store/toast.store'
import type { Permission, UserProfile } from '@/types/api.types'
import { PermissionsListTab } from '@/features/rbac/components/permissions.list.tab'
import { AssignRoleTab } from '@/features/rbac/components/assign.role.tab'
import { PermissionModal } from '@/features/rbac/components/permission.modal'
import {
  usePermissionsQuery,
  useRolesQuery,
  useRbacUsersQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useAssignRoleMutation,
} from '@/features/rbac/hooks/use.rbac.query'

type PermTabType = 'permissions' | 'assign'

export function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<PermTabType>('permissions')

  const { data: permissions = [], isLoading: isPermsLoading, refetch: refetchPerms } = usePermissionsQuery()
  const { data: roles = [], isLoading: isRolesLoading, refetch: refetchRoles } = useRolesQuery()
  const { data: users = [], isLoading: isUsersLoading, refetch: refetchUsers } = useRbacUsersQuery()

  const { mutateAsync: createPermMutate } = useCreatePermissionMutation()
  const { mutateAsync: updatePermMutate } = useUpdatePermissionMutation()
  const { mutateAsync: deletePermMutate } = useDeletePermissionMutation()
  const { mutateAsync: assignRoleMutate } = useAssignRoleMutation()

  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [assignRoleName, setAssignRoleName] = useState('ADMIN')
  const [isAssigning, setIsAssigning] = useState(false)

  const isLoading = isPermsLoading || isRolesLoading || isUsersLoading

  const handleRefresh = async () => {
    await Promise.all([refetchPerms(), refetchRoles(), refetchUsers()])
  }

  const handleOpenCreatePerm = () => {
    setEditingPerm(null)
    setIsPermModalOpen(true)
  }

  const handleOpenEditPerm = (perm: Permission) => {
    setEditingPerm(perm)
    setIsPermModalOpen(true)
  }

  const handleSavePerm = async (payload: {
    name: string
    api_path: string
    method: string
    module: string
    description?: string
  }) => {
    setIsSubmitting(true)
    try {
      if (editingPerm) {
        await updatePermMutate({ id: editingPerm._id, payload })
        toast.success(`Đã cập nhật quyền ${payload.name} thành công!`)
      } else {
        await createPermMutate(payload)
        toast.success(`Đã tạo quyền ${payload.name} mới thành công!`)
      }
      setIsPermModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu quyền hạn thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePerm = async (permId: string) => {
    try {
      await deletePermMutate(permId)
      toast.success('Đã xóa quyền hạn thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa quyền hạn thất bại'
      toast.error(msg)
    }
  }

  const handleAssignRole = async () => {
    if (!selectedUser) {
      toast.error('Vui lòng chọn thành viên để gán vai trò')
      return
    }
    const targetUserId = selectedUser.user_id
    if (!targetUserId) {
      toast.error('Không tìm thấy ID thành viên')
      return
    }

    setIsAssigning(true)
    try {
      await assignRoleMutate({ userId: targetUserId, role: assignRoleName })
      toast.success(`Đã gán vai trò ${assignRoleName} cho ${selectedUser.full_name} thành công!`)
      setSelectedUser(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gán quyền thất bại'
      toast.error(msg)
    } finally {
      setIsAssigning(false)
    }
  }

  const availableModules = Array.from(
    new Set(permissions.map((p) => (p.module ? p.module : 'GENERAL').toUpperCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Quản Lý Quyền Hạn (Permissions)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý danh mục quyền hạn endpoint API và gán phân quyền cho từng thành viên hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'permissions' && (
            <button
              onClick={handleOpenCreatePerm}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Thêm Quyền Hạn</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 py-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Danh Sách Quyền Hạn ({permissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assign')}
          className={`flex items-center gap-2 py-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'assign'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Gán quyền cho Thành viên</span>
        </button>
      </div>

      {activeTab === 'permissions' && (
        <PermissionsListTab
          permissions={permissions}
          onOpenCreatePerm={handleOpenCreatePerm}
          onOpenEditPerm={handleOpenEditPerm}
          onDeletePerm={handleDeletePerm}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'assign' && (
        <AssignRoleTab
          users={users}
          userSearch={userSearch}
          onUserSearchChange={setUserSearch}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          roles={roles}
          assignRoleName={assignRoleName}
          onRoleNameChange={setAssignRoleName}
          onAssignRole={handleAssignRole}
          isAssigning={isAssigning}
        />
      )}

      <PermissionModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        editingPerm={editingPerm}
        onSave={handleSavePerm}
        isSubmitting={isSubmitting}
        availableModules={availableModules}
        existingPermissions={permissions}
      />
    </div>
  )
}
