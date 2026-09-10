/**
 * @file permission.modal.tsx
 * @description Component giao diện PermissionModal phục vụ khu vực Quản trị Admin
 */

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X, KeyRound, AlertCircle } from 'lucide-react'
import { toast } from '@/store/toast.store'
import type { Permission } from '@/types/api.types'
import { CustomSelect } from '@/components/custom.select'

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  editingPerm: Permission | null
  onSave: (payload: { name: string; api_path: string; method: string; module: string; description?: string }) => Promise<void>
  isSubmitting: boolean
  availableModules: string[]
  existingPermissions?: Permission[]
}

export function PermissionModal({
  isOpen,
  onClose,
  editingPerm,
  onSave,
  isSubmitting,
  availableModules,
  existingPermissions = [],
}: PermissionModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [name, setName] = useState('')
  const [apiPath, setApiPath] = useState('')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET')
  const [module, setModule] = useState('COURSES')
  const [description, setDescription] = useState('')

  const methodOptions = useMemo(() => [
    { value: 'GET', label: isVi ? 'GET - Lấy dữ liệu' : 'GET - Read Data' },
    { value: 'POST', label: isVi ? 'POST - Tạo mới' : 'POST - Create' },
    { value: 'PUT', label: isVi ? 'PUT - Cập nhật' : 'PUT - Update Full' },
    { value: 'PATCH', label: isVi ? 'PATCH - Sửa một phần' : 'PATCH - Partial Edit' },
    { value: 'DELETE', label: isVi ? 'DELETE - Xóa' : 'DELETE - Remove' },
  ], [isVi])

  const defaultModules = [
    'COURSES',
    'VOCABULARY',
    'PRACTICE',
    'EXAMS',
    'USERS',
    'NOTIFICATIONS',
    'MEDIA',
    'AI',
    'ROLES',
    'PERMISSIONS',
    'PROGRESS',
    'COMMUNITY',
  ]

  const moduleOptions = useMemo(() => {
    const list = Array.from(new Set([...defaultModules, ...availableModules])).filter(Boolean).sort()
    return list.map((m) => ({
      value: m,
      label: isVi ? `Phân hệ ${m}` : `Module ${m}`,
    }))
  }, [availableModules, isVi])

  const duplicatePermission = useMemo(() => {
    const cleanPath = apiPath.trim().toLowerCase()
    const cleanMethod = method.toUpperCase()
    if (!cleanPath) return null

    return existingPermissions.find(
      (p) =>
        p._id !== editingPerm?._id &&
        (p.method || '').toUpperCase() === cleanMethod &&
        (p.api_path || '').trim().toLowerCase() === cleanPath
    )
  }, [apiPath, method, existingPermissions, editingPerm])

  useEffect(() => {
    if (editingPerm) {
      setName(editingPerm.name || '')
      setApiPath(editingPerm.api_path || '')
      setMethod((editingPerm.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') || 'GET')
      setModule(editingPerm.module || 'COURSES')
      setDescription(editingPerm.description || '')
    } else {
      setName('')
      setApiPath('')
      setMethod('GET')
      setModule('COURSES')
      setDescription('')
    }
  }, [editingPerm, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (duplicatePermission) {
      toast.error(
        isVi
          ? `Cặp Method [${method}] và Đường dẫn [${apiPath.trim()}] đã tồn tại ở quyền "${duplicatePermission.name}"!`
          : `Endpoint [${method} ${apiPath.trim()}] already exists for permission "${duplicatePermission.name}"!`
      )
      return
    }

    await onSave({
      name: name.trim(),
      api_path: apiPath.trim(),
      method,
      module: module.trim().toUpperCase(),
      description: description.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingPerm ? 'Cập nhật Permission' : 'Tạo mới Permission'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đăng ký endpoint API và hành động cần kiểm soát quyền truy cập
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span className="text-rose-500">*</span> Tên quyền hạn (Name)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Create a course, Get user by id"
              required
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="text-rose-500">*</span> Method
              </label>
              <CustomSelect
                value={method}
                onChange={(val) => setMethod(val as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')}
                options={methodOptions}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="text-rose-500">*</span> {isVi ? 'Phân hệ (Module)' : 'Module'}
              </label>
              <CustomSelect
                value={module}
                onChange={(val) => setModule(val)}
                options={moduleOptions}
                showSearch={true}
                searchPlaceholder={isVi ? 'Tìm kiếm module...' : 'Search module...'}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span className="text-rose-500">*</span> Đường dẫn API (Endpoint)
            </label>
            <input
              type="text"
              value={apiPath}
              onChange={(e) => setApiPath(e.target.value)}
              placeholder="VD: /courses, /users/:id, /ai/chat"
              required
              className={`w-full h-10 px-3.5 rounded-xl border bg-white dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none transition-all placeholder:text-slate-400 ${
                duplicatePermission
                  ? 'border-rose-500 ring-2 ring-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
              }`}
            />
          </div>

          {duplicatePermission && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {isVi
                    ? `Cặp [${method} ${apiPath.trim()}] đã tồn tại!`
                    : `Endpoint [${method} ${apiPath.trim()}] already exists!`}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {isVi
                    ? `Đang được sử dụng bởi quyền: "${duplicatePermission.name}". Mỗi method chỉ có thể đi cùng một đường dẫn duy nhất.`
                    : `Currently registered for: "${duplicatePermission.name}". Each HTTP method can only belong to one unique path.`}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Miêu tả chi tiết
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Miêu tả mục đích và phạm vi của API này"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!duplicatePermission}
              className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Đang lưu...' : editingPerm ? 'Cập nhật Permission' : 'Tạo mới Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
