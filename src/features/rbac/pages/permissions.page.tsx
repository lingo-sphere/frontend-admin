// Trang quản trị danh sách quyền hạn và gán quyền người dùng trong giao diện Admin.
import { useState } from 'react'
import { KeyRound, UserCheck } from 'lucide-react'
import { AdminTabs } from '@/components/admin.tabs'
import { toast } from '@/store/toast.store'
import type { Permission, UserProfile } from '@/types/api.types'
import { PermissionsListTab } from '@/features/rbac/components/permissions.list.tab'
import { AssignRoleTab } from '@/features/rbac/components/assign.role.tab'
import { PermissionModal } from '@/features/rbac/components/permission.modal'
import {
  useAllPermissionsQuery,
  useAllRolesQuery,
  useRbacUsersQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useAssignRoleMutation,
} from '@/features/rbac/hooks/use.rbac.query'

type PermTabType = 'permissions' | 'assign'

const RBAC_MODULES = [
  'AUTH',
  'USERS',
  'COURSES',
  'EXAMS',
  'PRACTICE',
  'PROGRESS',
  'COMMUNITY',
  'NOTIFICATIONS',
  'MEDIA',
  'AI',
  'ROLES',
  'PERMISSIONS',
]

export function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<PermTabType>('permissions')

  const { data: allRoles = [], isLoading: isRolesLoading, refetch: refetchRoles } = useAllRolesQuery(activeTab === 'assign')
  const { data: users = [], isLoading: isUsersLoading, refetch: refetchUsers } = useRbacUsersQuery(activeTab === 'assign')
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const { data: allPermissions = [] } = useAllPermissionsQuery(isPermModalOpen)

  const { mutateAsync: createPermMutate } = useCreatePermissionMutation()
  const { mutateAsync: updatePermMutate } = useUpdatePermissionMutation()
  const { mutateAsync: deletePermMutate } = useDeletePermissionMutation()
  const { mutateAsync: assignRoleMutate } = useAssignRoleMutation()

  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [assignRoleName, setAssignRoleName] = useState('ADMIN')
  const [isAssigning, setIsAssigning] = useState(false)

  const isLoading = activeTab === 'assign' ? (isRolesLoading || isUsersLoading) : false

  const handleRefresh = async () => {
    if (activeTab === 'assign') {
      await Promise.all([refetchRoles(), refetchUsers()])
    }
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
      </div>

      <AdminTabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as PermTabType)}
        items={[
          {
            key: 'permissions',
            label: 'Danh Sách Quyền Hạn',
            icon: KeyRound,
          },
          {
            key: 'assign',
            label: 'Gán quyền cho Thành viên',
            icon: UserCheck,
          },
        ]}
      />

      {activeTab === 'permissions' && (
        <PermissionsListTab
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
          roles={allRoles}
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
        availableModules={RBAC_MODULES}
        existingPermissions={allPermissions}
      />
    </div>
  )
}
