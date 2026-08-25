import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Shield,
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  Check,
  Search,
  RotateCcw,
  Sparkles,
  Lock,
  Layers,
  UserCheck,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react'
import { roleService } from '@/services/role.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import type { Role, Permission, UserProfile } from '@/types/api.types'

type TabType = 'roles' | 'permissions' | 'assign'

export function RolesPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const [activeTab, setActiveTab] = useState<TabType>('roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Role Form State
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  // Permission Form State
  const [permForm, setPermForm] = useState({
    name: '',
    api_path: '',
    method: 'GET' as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    module: 'COURSES',
  })

  // Permissions filter
  const [permSearch, setPermSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('ALL')

  // User Role Assignment Tab
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
        const uList = usersRes.value.items || (usersRes.value as any).users || []
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

  // Modules list for filtering
  const modulesList = useMemo(() => {
    const set = new Set(permissions.map((p) => p.module))
    return Array.from(set).filter(Boolean)
  }, [permissions])

  // Filtered permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
        (p.api_path || '').toLowerCase().includes(permSearch.toLowerCase())
      const matchModule = selectedModule === 'ALL' || p.module === selectedModule
      return matchSearch && matchModule
    })
  }, [permissions, permSearch, selectedModule])

  // Seed default roles & perms
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

  // Open Create / Edit Role Modal
  const openCreateRole = () => {
    setEditingRole(null)
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
    })
    setIsRoleModalOpen(true)
  }

  const openEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions?.map((p: any) => (typeof p === 'string' ? p : p._id || p.id)) || [],
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
        toast.success(`Đã cập nhật vai trò ${roleForm.name}!`)
      } else {
        await roleService.createRole({
          name: roleForm.name.toUpperCase().replace(/\s+/g, '_'),
          description: roleForm.description,
          permissions: roleForm.permissions,
        })
        toast.success(`Đã tạo vai trò mới ${roleForm.name}!`)
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

  // Permission Save
  const handleSavePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!permForm.name.trim() || !permForm.api_path.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin quyền hạn')
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

  // Assign user role
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) {
      toast.error('Vui lòng chọn người dùng cần phân quyền')
      return
    }

    setIsAssigning(true)
    try {
      const targetUserId = selectedUser._id || (selectedUser as any).id || (selectedUser as any).user_id
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
      {/* Top Header */}
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

      {/* Tabs Bar */}
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

      {/* TAB 1: ROLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const permCount = role.permissions?.length || 0

            return (
              <div
                key={role._id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        role.name === 'SUPER_ADMIN' || role.name === 'ADMIN'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : role.name === 'INSTRUCTOR'
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}
                    >
                      {role.name}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Hoạt động
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100">{role.description || role.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Vai trò kiểm soát các quyền truy cập tài nguyên thuộc hệ thống LingoSphere.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 my-4 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Số lượng quyền hạn:</span>
                      <span className="font-bold text-teal-300">
                        {role.name === 'SUPER_ADMIN' || role.name === 'ADMIN'
                          ? 'Toàn quyền (*)'
                          : `${permCount} Permissions`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">ID: {role._id.slice(-6)}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditRole(role)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Chỉnh sửa quyền hạn"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {role.name !== 'SUPER_ADMIN' && role.name !== 'ADMIN' && (
                      <button
                        onClick={() => setDeleteRoleId(role._id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Xóa vai trò"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 2: PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-indigo-500 transition-all">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc API Path..."
                  className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
                />
                {permSearch && (
                  <button onClick={() => setPermSearch('')} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">Tất cả phân hệ (Modules)</option>
                {modulesList.map((m) => (
                  <option key={m} value={m}>
                    Phân hệ: {m}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsPermModalOpen(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Permission Mới</span>
            </button>
          </div>

          {/* Permissions Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                    <th className="py-3.5 px-4">Tên quyền hạn</th>
                    <th className="py-3.5 px-4">Phân hệ (Module)</th>
                    <th className="py-3.5 px-4">Phương thức</th>
                    <th className="py-3.5 px-4">Đường dẫn API (Endpoint)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-200">
                  {filteredPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        Không tìm thấy quyền hạn nào phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredPermissions.map((perm) => (
                      <tr key={perm._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{perm.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {perm.module}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              perm.method === 'GET'
                                ? 'bg-teal-500/10 text-teal-400'
                                : perm.method === 'POST'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : perm.method === 'PUT' || perm.method === 'PATCH'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {perm.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{perm.api_path}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER ROLE ASSIGNMENT */}
      {activeTab === 'assign' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Selection List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2 w-full h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-indigo-500 transition-all">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm kiếm tài khoản thành viên theo email hoặc tên..."
                  className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden divide-y divide-slate-800/60 max-h-[520px] overflow-y-auto">
              {users
                .filter(
                  (u) =>
                    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map((u) => {
                  const isSelected = selectedUser?._id === u._id

                  return (
                    <div
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs shrink-0">
                          {u.full_name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-100">{u.full_name || u.email}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {u.role || 'STUDENT'}
                        </span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Role Assign Action Form */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 h-fit">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>Gán vai trò mới</span>
            </h3>

            {selectedUser ? (
              <form onSubmit={handleAssignRole} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <p className="text-[11px] text-slate-500">Tài khoản được chọn:</p>
                  <p className="text-sm font-bold text-slate-100">{selectedUser.full_name || selectedUser.email}</p>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                  <p className="text-[11px] text-teal-400 mt-1">Vai trò hiện tại: {selectedUser.role || 'STUDENT'}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Chọn vai trò mới cần cấp
                  </label>
                  <select
                    value={assignRoleName}
                    onChange={(e) => setAssignRoleName(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r._id} value={r.name}>
                        {r.name} - {r.description || r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAssigning}
                  className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isAssigning ? 'Đang cập nhật...' : 'Cấp quyền cho thành viên'}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
                <p>Vui lòng chọn một tài khoản từ danh sách bên trái để tiến hành phân quyền</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Create / Edit Modal */}
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

      {/* Permission Create Modal */}
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
                    onChange={(e) => setPermForm({ ...permForm, method: e.target.value as any })}
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

      {/* Delete Role Modal */}
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
