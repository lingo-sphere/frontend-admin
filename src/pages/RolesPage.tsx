import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  KeyRound,
  Plus,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { roleService } from '@/services/role.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { Role, Permission, UserProfile } from '@/types/api.types'
import { RolesListTab } from '@/pages/roles/RolesListTab'
import { PermissionsListTab } from '@/pages/roles/PermissionsListTab'
import { AssignRoleTab } from '@/pages/roles/AssignRoleTab'

type TabType = 'roles' | 'permissions' | 'assign'

export function RolesPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [activeTab, setActiveTab] = useState<TabType>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  const [permForm, setPermForm] = useState({
    name: '',
    api_path: '',
    method: 'GET' as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    module: 'COURSES',
  })

  const [permSearch, setPermSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('ALL')

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
      console.warn('Using cached roles data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const modulesList = useMemo(() => {
    const set = new Set(permissions.map((p) => p.module))
    return Array.from(set).filter(Boolean)
  }, [permissions])

  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
        (p.api_path || '').toLowerCase().includes(permSearch.toLowerCase())
      const matchModule = selectedModule === 'ALL' || p.module === selectedModule
      return matchSearch && matchModule
    })
  }, [permissions, permSearch, selectedModule])

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

  const openCreateRole = () => {
    setEditingRole(null)
    setRoleForm({ name: '', description: '', permissions: [] })
    setIsRoleModalOpen(true)
  }

  const openEditRole = (role: Role) => {
    setEditingRole(role)
    const permIds = (role.permissions || []).map((p) => (typeof p === 'string' ? p : p._id))
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: permIds,
    })
    setIsRoleModalOpen(true)
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleForm.name.trim()) {
      toast.error('Vui lòng nhập tên vai trò')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole._id, {
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions,
        })
        toast.success(`Đã cập nhật vai trò ${roleForm.name} thành công!`)
      } else {
        await roleService.createRole({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions,
        })
        toast.success(`Đã tạo vai trò ${roleForm.name} mới thành công!`)
      }
      setIsRoleModalOpen(false)
      loadData()
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
      loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa vai trò thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!permForm.name.trim() || !permForm.api_path.trim()) {
      toast.error('Vui lòng điền đủ thông tin quyền hạn')
      return
    }

    setIsSubmitting(true)
    try {
      await roleService.createPermission({
        name: permForm.name,
        api_path: permForm.api_path,
        method: permForm.method,
        module: permForm.module,
      })
      toast.success('Đã tạo endpoint permission mới thành công!')
      setIsPermModalOpen(false)
      loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo permission thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

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
      loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gán quyền thất bại'
      toast.error(msg)
    } finally {
      setIsAssigning(false)
    }
  }

  const togglePermSelection = (permId: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-indigo-400" />
            <span>Phân Quyền & Vai Trò (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý ma trận phân quyền dựa trên vai trò (Role-Based Access Control) cho Admin, Giảng viên và Học viên
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={handleSeedRBAC}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Khởi tạo RBAC mẫu</span>
          </button>
          <button
            onClick={openCreateRole}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Vai Trò Mới</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Danh sách Vai trò ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Danh mục Quyền hạn ({permissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assign')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'assign'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Gán quyền cho Thành viên</span>
        </button>
      </div>

      {activeTab === 'roles' && (
        <RolesListTab
          roles={roles}
          permissions={permissions}
          onOpenEditRole={openEditRole}
          onDeleteRole={(roleId) => setDeleteRoleId(roleId)}
        />
      )}

      {activeTab === 'permissions' && (
        <PermissionsListTab
          permissions={filteredPermissions}
          permSearch={permSearch}
          onSearchChange={setPermSearch}
          selectedModule={selectedModule}
          onModuleChange={setSelectedModule}
          modulesList={modulesList}
          onOpenCreatePerm={() => setIsPermModalOpen(true)}
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

      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {editingRole ? `Chỉnh Sửa Vai Trò: ${editingRole.name}` : 'Tạo Vai Trò Mới'}
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Tên vai trò (ROLE CODE) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="VD: CONTENT_EDITOR hoặc REVIEWER"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Mô tả vai trò
                </label>
                <input
                  type="text"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="VD: Chuyên viên duyệt bài viết và ngữ pháp"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Gán danh mục quyền hạn ({roleForm.permissions.length} đã chọn)
                </label>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-60 overflow-y-auto space-y-2">
                  {permissions.map((p) => {
                    const isChecked = roleForm.permissions.includes(p._id)

                    return (
                      <label
                        key={p._id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermSelection(p._id)}
                            className="w-4 h-4 accent-indigo-600 rounded"
                          />
                          <span className="font-semibold text-slate-200">{p.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          [{p.method}] {p.api_path}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
                >
                  Lưu vai trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Thêm Quyền Hạn (Permission)</h3>
              <button onClick={() => setIsPermModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePermission} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Tên quyền hạn <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={permForm.name}
                  onChange={(e) => setPermForm({ ...permForm, name: e.target.value })}
                  placeholder="VD: Xem báo cáo doanh thu"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    HTTP Method
                  </label>
                  <select
                    value={permForm.method}
                    onChange={(e) => setPermForm({ ...permForm, method: e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' })}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Phân hệ (Module)
                  </label>
                  <input
                    type="text"
                    value={permForm.module}
                    onChange={(e) => setPermForm({ ...permForm, module: e.target.value.toUpperCase() })}
                    placeholder="VD: COURSES"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  API Path Endpoint <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={permForm.api_path}
                  onChange={(e) => setPermForm({ ...permForm, api_path: e.target.value })}
                  placeholder="/analytics/revenue"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPermModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30"
                >
                  Lưu Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteRoleId)}
        onClose={() => setDeleteRoleId(null)}
        onConfirm={handleDeleteRole}
        title="Xóa vai trò này?"
        description="Vai trò này sẽ bị gỡ bỏ khỏi hệ thống. Các tài khoản đang thuộc vai trò này sẽ trở về quyền mặc định."
        confirmText="Xóa vai trò"
        cancelText="Hủy"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  )
}
