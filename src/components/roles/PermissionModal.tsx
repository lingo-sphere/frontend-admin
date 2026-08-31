import { useState, useEffect } from 'react'
import { X, KeyRound } from 'lucide-react'
import type { Permission } from '@/types/api.types'

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  editingPerm: Permission | null
  onSave: (payload: { name: string; api_path: string; method: string; module: string; description?: string }) => Promise<void>
  isSubmitting: boolean
  availableModules: string[]
}

export function PermissionModal({
  isOpen,
  onClose,
  editingPerm,
  onSave,
  isSubmitting,
  availableModules,
}: PermissionModalProps) {
  const [name, setName] = useState('')
  const [apiPath, setApiPath] = useState('')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET')
  const [module, setModule] = useState('COURSES')
  const [description, setDescription] = useState('')

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
  ]

  const allModuleOptions = Array.from(new Set([...defaultModules, ...availableModules])).sort()

  useEffect(() => {
    if (editingPerm) {
      setName(editingPerm.name || '')
      setApiPath(editingPerm.api_path || '')
      setMethod((editingPerm.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') || 'GET')
      setModule(editingPerm.module || 'COURSES')
      setDescription(editingPerm.description || '')
    } else {
      setName('')
      setApiPath('/api/v1/')
      setMethod('GET')
      setModule('COURSES')
      setDescription('')
    }
  }, [editingPerm, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        {}
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

        {}
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
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="GET">GET (Xem / Lấy dữ liệu)</option>
                <option value="POST">POST (Tạo mới dữ liệu)</option>
                <option value="PUT">PUT (Cập nhật toàn bộ)</option>
                <option value="PATCH">PATCH (Cập nhật một phần)</option>
                <option value="DELETE">DELETE (Xóa dữ liệu)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="text-rose-500">*</span> Phân hệ (Module)
              </label>
              <input
                type="text"
                list="modules-datalist"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="VD: COURSES, USERS"
                required
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-semibold uppercase text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <datalist id="modules-datalist">
                {allModuleOptions.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
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
              placeholder="VD: /courses hoặc /api/v1/users/:id"
              required
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

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

          {}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : editingPerm ? 'Cập nhật Permission' : 'Tạo mới Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
