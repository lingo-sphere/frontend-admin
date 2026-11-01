// Bộ chọn vai trò và trạng thái cho người dùng quản trị.

import { Shield, GraduationCap, CheckCircle2 } from 'lucide-react'

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
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Vai Trò & Trạng Thái Hoạt Động
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Xác định quyền truy cập các module quản lý và tình trạng tài khoản
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2.5">
            Chọn vai trò quản trị
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div
              onClick={() => onRoleChange('ADMIN')}
              className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {selectedRole === 'ADMIN' && (
                <div className="absolute top-3 right-3 text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 className="w-4 h-4 fill-indigo-100 dark:fill-indigo-950" />
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-1.5 pr-6">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Quản Trị Viên (ADMIN)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Toàn quyền truy cập tất cả module hệ thống, tài chính và cấu hình bảo mật.
              </p>
            </div>

            <div
              onClick={() => onRoleChange('INSTRUCTOR')}
              className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedRole === 'INSTRUCTOR'
                  ? 'bg-teal-50/50 dark:bg-teal-500/10 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {selectedRole === 'INSTRUCTOR' && (
                <div className="absolute top-3 right-3 text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="w-4 h-4 fill-teal-100 dark:fill-teal-950" />
                </div>
              )}
              <div className="flex items-center gap-2.5 mb-1.5 pr-6">
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Giảng Viên (INSTRUCTOR)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Quyền quản lý khóa học, đề thi TOEIC, kho từ vựng và chấm bài luyện tập.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2.5">
            Trạng thái tài khoản
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onStatusChange('ACTIVE')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedStatus === 'ACTIVE'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedStatus === 'ACTIVE'
                  ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {selectedStatus === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Hoạt động (Active)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Được phép đăng nhập và thao tác bình thường
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onStatusChange('BLOCKED')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedStatus === 'BLOCKED'
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/20 shadow-2xs'
                  : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedStatus === 'BLOCKED'
                  ? 'border-rose-600 bg-rose-600 dark:border-rose-500 dark:bg-rose-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {selectedStatus === 'BLOCKED' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  Tạm khóa (Blocked)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Chặn đăng nhập và vô hiệu hóa mọi phiên truy cập
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
