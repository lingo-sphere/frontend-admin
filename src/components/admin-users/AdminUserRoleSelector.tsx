/**
 * @file AdminUserRoleSelector.tsx
 * @description Component giao diện AdminUserRoleSelector phục vụ khu vực Quản trị Admin
 */

import { Shield, GraduationCap } from 'lucide-react'

interface AdminUserRoleSelectorProps {
  selectedRole: 'ADMIN' | 'INSTRUCTOR'
  selectedStatus: 'ACTIVE' | 'BLOCKED'
  onRoleChange: (role: 'ADMIN' | 'INSTRUCTOR') => void
  onStatusChange: (status: 'ACTIVE' | 'BLOCKED') => void
}

export function AdminUserRoleSelector({
  selectedRole,
  selectedStatus,
  onRoleChange,
  onStatusChange,
}: AdminUserRoleSelectorProps) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <Shield className="w-4 h-4 text-indigo-500" />
        <span>Vai Trò & Trạng Thái Hoạt Động</span>
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Chọn vai trò quản trị
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => onRoleChange('ADMIN')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Quản Trị Viên (ADMIN)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Toàn quyền truy cập tất cả module hệ thống, tài chính và cấu hình bảo mật.
              </p>
            </div>

            <div
              onClick={() => onRoleChange('INSTRUCTOR')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedRole === 'INSTRUCTOR'
                  ? 'bg-teal-50/50 dark:bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Giảng Viên (INSTRUCTOR)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Quyền quản lý khóa học, đề thi TOEIC, kho từ vựng và chấm bài luyện tập.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Trạng thái tài khoản
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="ACTIVE"
                checked={selectedStatus === 'ACTIVE'}
                onChange={() => onStatusChange('ACTIVE')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Hoạt động (Active)
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="BLOCKED"
                checked={selectedStatus === 'BLOCKED'}
                onChange={() => onStatusChange('BLOCKED')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                Tạm khóa (Blocked)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
