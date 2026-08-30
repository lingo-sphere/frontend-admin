import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Shield, KeyRound, UserCheck } from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { roleService } from '@/services/role.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { Role, Permission, UserProfile } from '@/types/api.types'
import { RolesListTab } from '@/pages/roles/RolesListTab'
import { PermissionsListTab } from '@/pages/roles/PermissionsListTab'
import { AssignRoleTab } from '@/pages/roles/AssignRoleTab'
import { RoleEditModal } from '@/pages/roles/RoleEditModal'
import { PermissionModal } from '@/pages/roles/PermissionModal'

type TabType = 'roles' | 'permissions' | 'assign'

export function RolesPage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const activeNavItem = useAdminStore((state) => state.activeNavItem)
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return activeNavItem === 'permissions' ? 'permissions' : 'roles'
  })

  useEffect(() => {
    if (activeNavItem === 'permissions') {
      setActiveTab('permissions')
    } else if (activeNavItem === 'roles') {
      setActiveTab('roles')
    }
  }, [activeNavItem])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)

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
      const [rolesRes, permsRes, usersRes] = await Promise.allSettled([
        roleService.getAllRoles(),
        roleService.getAllPermissions(),
        userService.getAllUsers({ limit: 50 }),
      ])

      if (rolesRes.status === 'fulfilled' && rolesRes.value) {
        setRoles(rolesRes.value)
      }
      if (permsRes.status === 'fulfilled' && permsRes.value) {
        setPermissions(permsRes.value)
      }
      if (usersRes.status === 'fulfilled' && usersRes.value) {
        const uList = usersRes.value.items || []
        setUsers(uList)
      }
    } catch (err) {
      console.warn('Error loading RBAC data:', err)
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
      const targetUserId = selectedUser._id || selectedUser.user_id || ''
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
    new Set(permissions.map((p) => (p.module || 'GENERAL').toUpperCase())),
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Phân Quyền & Vai Trò (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quản lý ma trận phân quyền động (Role-Based Access Control) cho Admin, Giảng viên và Học viên
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => {
            setActiveTab('roles')
            setActiveNavItem('roles')
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Danh sách Roles ({roles.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('permissions')
            setActiveNavItem('permissions')
          }}
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

      {/* Tab 1: Roles List (Screenshot 2) */}
      {activeTab === 'roles' && (
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
      )}

      {/* Tab 2: Permissions List (Screenshot 1) */}
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

      {/* Tab 3: Assign Role */}
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

      {/* Role Edit / Create Modal (Screenshots 3 & 4) */}
      <RoleEditModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        editingRole={editingRole}
        allPermissions={permissions}
        onSave={handleSaveRole}
        isSubmitting={isSubmitting}
      />

      {/* Permission Edit / Create Modal */}
      <PermissionModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        editingPerm={editingPerm}
        onSave={handleSavePerm}
        isSubmitting={isSubmitting}
        availableModules={availableModules}
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
