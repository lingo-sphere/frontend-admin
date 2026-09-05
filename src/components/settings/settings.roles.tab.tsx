/**
 * @file settings.roles.tab.tsx
 * @description Component giao diện SettingsRolesTab phục vụ khu vực Quản trị Admin
 */

import { KeyRound } from 'lucide-react'

interface SettingsRolesTabProps {
  onSeedRBAC: () => void
}

export function SettingsRolesTab({ onSeedRBAC }: SettingsRolesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Phân Quyền & Vai Trò Hệ Thống (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý danh sách vai trò (Admin, Teacher, Learner) và khởi tạo ma trận bảo mật
          </p>
        </div>
        <button
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          onClick={onSeedRBAC}
        >
          <KeyRound className="w-4 h-4" />
          <span>Khởi tạo mặc định RBAC</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 mr-2">
              ADMIN
            </span>
            <span className="text-sm font-semibold text-slate-200">Quản trị viên tối cao</span>
            <p className="text-xs text-slate-400 mt-1">
              Toàn quyền truy cập quản lý người dùng, nội dung, doanh thu, cài đặt hệ thống và bảo mật.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono shrink-0">Quyền: ALL (*)</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mr-2">
              INSTRUCTOR
            </span>
            <span className="text-sm font-semibold text-slate-200">
              Giáo viên / Tác giả khóa học
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Quyền tạo khóa học, soạn thảo bài giảng, ngân hàng câu hỏi, tạo bộ thẻ và quản lý học viên khóa học.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono shrink-0">
            Quyền: courses:*, questions:*, vocabulary:*
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mr-2">
              STUDENT
            </span>
            <span className="text-sm font-semibold text-slate-200">
              Học viên / Người học
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Quyền học tập, làm bài kiểm tra, tham gia cộng đồng và lưu tiến trình cá nhân.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono shrink-0">
            Quyền: practice:read, exams:take, profile:write
          </span>
        </div>
      </div>
    </div>
  )
}
