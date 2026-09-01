/**
 * @file AdminUserAccountForm.tsx
 * @description Component giao diện AdminUserAccountForm phục vụ khu vực Quản trị Admin
 */

import { Mail, User, Lock, Eye, EyeOff } from 'lucide-react'

interface AdminUserAccountFormProps {
  formData: {
    email: string
    password: string
    full_name: string
  }
  isEditing: boolean
  showPassword: boolean
  errors: Record<string, string>
  onToggleShowPassword: () => void
  onChange: (field: string, value: string) => void
}

export function AdminUserAccountForm({
  formData,
  isEditing,
  showPassword,
  errors,
  onToggleShowPassword,
  onChange,
}: AdminUserAccountFormProps) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <User className="w-4 h-4 text-indigo-500" />
        <span>Thông Tin Tài Khoản</span>
      </h3>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => onChange('full_name', e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className={`w-full h-10 pl-10 pr-3.5 rounded-xl border ${
                errors.full_name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500`}
            />
          </div>
          {errors.full_name && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.full_name}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email đăng nhập <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              disabled={isEditing}
              placeholder="admin@lingosphere.edu.vn"
              className={`w-full h-10 pl-10 pr-3.5 rounded-xl border ${
                errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } ${
                isEditing
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
              } text-xs focus:outline-none focus:border-indigo-500`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isEditing ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu khởi tạo'} {!isEditing && <span className="text-rose-500">*</span>}
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder={isEditing ? '••••••••' : 'Tối thiểu 6 ký tự'}
              className={`w-full h-10 pl-10 pr-10 rounded-xl border ${
                errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500`}
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>
          )}
        </div>
      </div>
    </div>
  )
}
