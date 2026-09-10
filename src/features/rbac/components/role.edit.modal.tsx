/**
 * @file role.edit.modal.tsx
 * @description Modal tạo mới và chỉnh sửa vai trò người dùng (Role) cùng phân quyền hạn (RBAC Permissions)
 */

import { useState, useMemo, useEffect } from 'react'
import { X, Search, ShieldCheck } from 'lucide-react'
import type { Role, Permission } from '@/types/api.types'
import { RoleModulePermissionGroup } from '@/features/rbac/components/role.module.permission.group'

interface RoleEditModalProps {
  isOpen: boolean
  onClose: () => void
  editingRole: Role | null
  allPermissions: Permission[]
  onSave: (payload: {
    name: string
    description: string
    permissions: string[]
    is_active: boolean
  }) => Promise<void>
  isSubmitting: boolean
}

export function RoleEditModal({
  isOpen,
  onClose,
  editingRole,
  allPermissions,
  onSave,
  isSubmitting,
}: RoleEditModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([])
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
  const [permFilter, setPermFilter] = useState('')

  useEffect(() => {
    if (editingRole) {
      setName(editingRole.name || '')
      setDescription(editingRole.description || '')
      setIsActive(editingRole.is_active !== false)
      const ids = (editingRole.permissions || []).map((p) =>
        typeof p === 'string' ? p : p._id
      )
      setSelectedPermIds(ids)
    } else {
      setName('')
      setDescription('')
      setIsActive(true)
      setSelectedPermIds([])
    }
  }, [editingRole, isOpen])

  const groupedPermissions = useMemo(() => {
    const map: Record<string, Permission[]> = {}
    for (const perm of allPermissions) {
      const mod = (perm.module || 'GENERAL').toUpperCase()
      if (!map[mod]) map[mod] = []
      map[mod].push(perm)
    }
    return map
  }, [allPermissions])

  const moduleNames = useMemo(
    () => Object.keys(groupedPermissions).sort(),
    [groupedPermissions]
  )

  useEffect(() => {
    if (isOpen) {
      const initialExpanded: Record<string, boolean> = {}
      moduleNames.forEach((mod) => {
        initialExpanded[mod] = true
      })
      setExpandedModules(initialExpanded)
    }
  }, [isOpen, moduleNames])

  if (!isOpen) return null

  const toggleModuleExpand = (mod: string) => {
    setExpandedModules((prev) => ({ ...prev, [mod]: !prev[mod] }))
  }

  const handleTogglePerm = (permId: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    )
  }

  const handleToggleModuleAll = (mod: string, currentChecked: boolean) => {
    const modPerms = groupedPermissions[mod] || []
    const modPermIds = modPerms.map((p) => p._id)

    if (currentChecked) {
      setSelectedPermIds((prev) => prev.filter((id) => !modPermIds.includes(id)))
    } else {
      setSelectedPermIds((prev) => Array.from(new Set([...prev, ...modPermIds])))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      name: name.trim().toUpperCase(),
      description: description.trim(),
      permissions: selectedPermIds,
      is_active: isActive,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col h-[85vh] max-h-[850px] animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingRole ? `Cập nhật Role` : 'Tạo mới Role'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thiết lập thông tin vai trò và phân bổ quyền hạn theo từng phân hệ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span className="text-rose-500">*</span> Tên Role
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: HR, TEACHER, CONTENT_ADMIN"
                    required
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:normal-case"
                  />
                  {name && (
                    <button
                      type="button"
                      onClick={() => setName('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Trạng thái
                </label>
                <div className="flex items-center gap-3 h-10">
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span className="text-rose-500">*</span> Miêu tả
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Quản lý đăng tuyển, ứng viên và duyệt khóa học"
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Quyền hạn <span className="text-xs font-normal text-slate-500">Các quyền hạn được phép cho vai trò này</span>
                  </h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Đã chọn {selectedPermIds.length} / {allPermissions.length} quyền
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={permFilter}
                    onChange={(e) => setPermFilter(e.target.value)}
                    placeholder="Lọc nhanh quyền / API..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-950/40">
                {moduleNames.map((mod) => (
                  <RoleModulePermissionGroup
                    key={mod}
                    moduleName={mod}
                    modulePermissions={groupedPermissions[mod] || []}
                    selectedPermIds={selectedPermIds}
                    isExpanded={expandedModules[mod] !== false}
                    permFilter={permFilter}
                    onToggleExpand={() => toggleModuleExpand(mod)}
                    onToggleModuleAll={(currentChecked) =>
                      handleToggleModuleAll(mod, currentChecked)
                    }
                    onTogglePerm={handleTogglePerm}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-xs shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Đã chọn <strong className="text-blue-600 dark:text-blue-400">{selectedPermIds.length}</strong> / {allPermissions.length} quyền
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-9.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Đang lưu...' : editingRole ? 'Cập nhật Role' : 'Tạo mới Role'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
