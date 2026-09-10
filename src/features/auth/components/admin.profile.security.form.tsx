/**
 * @file admin.profile.security.form.tsx
 * @description Component giao diện AdminProfileSecurityForm phục vụ khu vực Quản trị Admin
 */

import { useState } from 'react'
import { KeyRound, Eye, EyeOff, Lock } from 'lucide-react'
import type { PasswordStrengthResult } from '@/features/auth/helpers/admin.profile.helper'

interface AdminProfileSecurityFormProps {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  passwordStrength: PasswordStrengthResult
  onCurrentPasswordChange: (val: string) => void
  onNewPasswordChange: (val: string) => void
  onConfirmPasswordChange: (val: string) => void
}

export function AdminProfileSecurityForm({
  currentPassword = '',
  newPassword = '',
  confirmPassword = '',
  passwordStrength,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
}: AdminProfileSecurityFormProps) {
  const [showOldPwd, setShowOldPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-rose-500" />
            <span>Bảo Mật & Mật Khẩu</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Thay đổi mật khẩu đăng nhập định kỳ để đảm bảo an toàn tối đa cho hệ thống
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showOldPwd ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại nếu muốn đổi..."
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
            <button
              type="button"
              onClick={() => setShowOldPwd(!showOldPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showNewPwd ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Tối thiểu 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt..."
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
            <button
              type="button"
              onClick={() => setShowNewPwd(!showNewPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {newPassword && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Độ mạnh mật khẩu:</span>
                <span
                  className={`font-bold ${
                    passwordStrength.score === 1
                      ? 'text-rose-500'
                      : passwordStrength.score === 2
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1.5">
                <div
                  className={`rounded-full transition-all ${
                    passwordStrength.score >= 1
                      ? passwordStrength.score === 1
                        ? 'bg-rose-500'
                        : passwordStrength.score === 2
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                <div
                  className={`rounded-full transition-all ${
                    passwordStrength.score >= 2
                      ? passwordStrength.score === 2
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                <div
                  className={`rounded-full transition-all ${
                    passwordStrength.score === 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <span
                  className={
                    passwordStrength.checks.length
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  ✓ Ít nhất 8 ký tự
                </span>
                <span
                  className={
                    passwordStrength.checks.mixedCase
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  ✓ Chữ hoa & chữ thường
                </span>
                <span
                  className={
                    passwordStrength.checks.number
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  ✓ Có ít nhất 1 số
                </span>
                <span
                  className={
                    passwordStrength.checks.special
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  ✓ Ký tự đặc biệt (!@#$...)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPwd ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
