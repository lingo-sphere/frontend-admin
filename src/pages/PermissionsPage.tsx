import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyRound, UserCheck } from 'lucide-react'
import { roleService } from '@/services/role.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { Role, Permission, UserProfile } from '@/types/api.types'
import { PermissionsListTab } from '@/components/roles/PermissionsListTab'
import { AssignRoleTab } from '@/components/roles/AssignRoleTab'
import { PermissionModal } from '@/components/roles/PermissionModal'

type PermTabType = 'permissions' | 'assign'

export function PermissionsPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [activeTab, setActiveTab] = useState<PermTabType>('permissions')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Modals state
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [deletePermId, setDeletePermId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Assign user role state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [assignRoleName, setAssignRoleName] = useState('ADMIN')
  const [isAssigning, setIsAssigning] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [permsRes, rolesRes, usersRes] = await Promise.allSettled([
        roleService.getAllPermissions({ pageSize: 100 }),
        roleService.getAllRoles({ pageSize: 50 }),
        userService.getAllUsers({ limit: 50 }),
      ])

      if (permsRes.status === 'fulfilled' && permsRes.value) {
        const pVal = permsRes.value
        const items = Array.isArray(pVal) ? pVal : (pVal?.result || [])
        setPermissions(items)
      }
      if (rolesRes.status === 'fulfilled' && rolesRes.value) {
        const rVal = rolesRes.value
        const items = Array.isArray(rVal) ? rVal : (rVal?.result || [])
        setRoles(items)
      }
      if (usersRes.status === 'fulfilled' && usersRes.value) {
        const uVal = usersRes.value
        const uList = Array.isArray(uVal) ? uVal : (uVal?.result || [])
        setUsers(uList)
      }
    } catch (err) {
      console.warn('Error loading Permissions data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Permission CRUD Handlers
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
        await roleService.updatePermission(editingPerm._id, payload)
        toast.success(`Đã cập nhật quyền hạn ${payload.name} thành công!`)
      } else {
        await roleService.createPermission(payload)
        toast.success(`Đã tạo quyền hạn ${payload.name} mới thành công!`)
      }
      setIsPermModalOpen(false)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu quyền hạn thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePerm = async () => {
    if (!deletePermId) return
    setIsSubmitting(true)
    try {
      await roleService.deletePermission(deletePermId)
      toast.success('Đã xóa quyền hạn thành công!')
      setDeletePermId(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa quyền hạn thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Assign user role
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) {
      toast.error('Vui lòng chọn người dùng cần phân quyền')
      return
    }

    setIsAssigning(true)
    try {
      const targetUserId = selectedUser._id ? selectedUser._id : (selectedUser.user_id ? selectedUser.user_id : '')
      await roleService.assignUserRole(targetUserId, assignRoleName)
      toast.success(`Đã gán vai trò ${assignRoleName} cho người dùng ${selectedUser.email}!`)
      setSelectedUser(null)
      await loadData()
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
      {/* Top Header */}
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

      {/* Tabs Navigation (Tab 2 và Tab 3) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Danh sách Permissions ({permissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assign')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'assign'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Gán quyền cho Thành viên</span>
        </button>
      </div>

      {/* Tab 1: Permissions List (Screenshot 1) */}
      {activeTab === 'permissions' && (
        <PermissionsListTab
          permissions={permissions}
          onOpenCreatePerm={handleOpenCreatePerm}
          onOpenEditPerm={handleOpenEditPerm}
          onDeletePerm={(permId) => setDeletePermId(permId)}
          onRefresh={loadData}
          isLoading={isLoading}
        />
      )}

      {/* Tab 2: Assign Role */}
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

      {/* Permission Edit / Create Modal */}
      <PermissionModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        editingPerm={editingPerm}
        onSave={handleSavePerm}
        isSubmitting={isSubmitting}
        availableModules={availableModules}
      />

      {/* Confirm Delete Permission Modal */}
      <ConfirmModal
        isOpen={!!deletePermId}
        onClose={() => setDeletePermId(null)}
        onConfirm={handleDeletePerm}
        title="Xác nhận xóa quyền hạn"
        message="Bạn có chắc chắn muốn xóa quyền hạn API này khỏi hệ thống?"
        confirmText="Xóa quyền hạn"
        cancelText="Hủy"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  )
}
