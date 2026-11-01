// Biểu mẫu thông tin tài khoản người dùng quản trị.

import { Mail, User, Lock, Eye, EyeOff, KeyRound } from 'lucide-react'

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
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <User className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Thông Tin Tài Khoản
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Thông tin định danh và thông tin xác thực đăng nhập
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Họ và tên <span className="text-rose-500">*</span></span>
            <span className="text-[11px] text-slate-400">Tên hiển thị công khai</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => onChange('full_name', e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className={`w-full h-11 pl-10 pr-3.5 rounded-2xl border transition-colors ${
                errors.full_name
                  ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950'
              } text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20`}
            />
          </div>
          {errors.full_name && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.full_name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Email đăng nhập <span className="text-rose-500">*</span></span>
            {isEditing && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Cố định không thay đổi
              </span>
            )}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              disabled={isEditing}
              placeholder="admin@lingosphere.edu.vn"
              className={`w-full h-11 pl-10 pr-3.5 rounded-2xl border transition-colors ${
                errors.email
                  ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-700/80'
              } ${
                isEditing
                  ? 'bg-slate-100 dark:bg-slate-950/40 text-slate-400 cursor-not-allowed border-dashed'
                  : 'bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20'
              } text-xs`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>
              {isEditing ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu khởi tạo'}
              {!isEditing && <span className="text-rose-500 ml-1">*</span>}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>Tối thiểu 6 ký tự</span>
            </span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder={isEditing ? '••••••••' : 'Nhập mật khẩu an toàn'}
              className={`w-full h-11 pl-10 pr-10 rounded-2xl border transition-colors ${
                errors.password
                  ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-950'
              } text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20`}
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium pl-1">{errors.password}</p>
          )}
        </div>
      </div>
    </div>
  )
}
