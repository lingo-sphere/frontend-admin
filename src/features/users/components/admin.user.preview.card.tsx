// Component hiển thị thẻ xem trước trực quan tài khoản quản trị viên và bảng quyền hạn tương ứng.

import { Shield, GraduationCap, CheckCircle2, Ban, Mail, Check, Sparkles, UserCheck } from 'lucide-react'

interface AdminUserPreviewCardProps {
  fullName: string
  email: string
  role: 'ADMIN' | 'INSTRUCTOR'
  status: 'ACTIVE' | 'BLOCKED'
  editUserId?: string
  isEditing: boolean
}

export function AdminUserPreviewCard({
  fullName,
  email,
  role,
  status,
  editUserId,
  isEditing,
}: AdminUserPreviewCardProps) {
  const isAdmin = role === 'ADMIN'
  const isActive = status === 'ACTIVE'

  const displayName = fullName.trim() || (isEditing ? 'LingoSphere Admin' : 'Chưa nhập tên')
  const displayEmail = email.trim() || 'admin@lingosphere.local'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('') || 'AD'

  const adminPermissions = [
    'Toàn quyền quản trị hệ thống và cấu hình RBAC',
    'Quản lý danh sách học viên và quản trị viên',
    'Soạn thảo, xuất bản và phân phối khóa học',
    'Quản lý ngân hàng đề thi và thiết lập điểm chuẩn',
    'Phân tích học tập và thống kê doanh thu toàn sàn',
  ]

  const instructorPermissions = [
    'Quản lý khóa học, bài học và tài liệu giảng dạy',
    'Soạn đề thi TOEIC, đề kiểm tra định kỳ',
    'Chấm điểm và phản hồi bài Speaking & Writing',
    'Quản lý kho từ vựng và bộ thẻ công khai',
    'Theo dõi tiến độ học viên trong các khóa phụ trách',
  ]

  const permissions = isAdmin ? adminPermissions : instructorPermissions

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Xem Trước Hồ Sơ
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 font-mono">
            {isEditing ? (editUserId ? `ID: ${editUserId.slice(-8)}` : 'Đang cập nhật') : 'Hồ sơ mới'}
          </span>
        </div>

        <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-950/70 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md transition-all ${
            isAdmin
              ? 'bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 shadow-indigo-500/20'
              : 'bg-gradient-to-tr from-teal-500 via-emerald-600 to-teal-700 shadow-teal-500/20'
          }`}>
            {initials}
          </div>

          <div className="space-y-1 w-full min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate" title={displayName}>
              {displayName}
            </h4>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate" title={displayEmail}>
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{displayEmail}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
              isAdmin
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
            }`}>
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              )}
              <span>{isAdmin ? 'Quản Trị Viên' : 'Giảng Viên'}</span>
            </span>

            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {isActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Hoạt động</span>
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Tạm khóa</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Phạm vi quyền hạn ({isAdmin ? 'ADMIN' : 'INSTRUCTOR'})</span>
            </p>
          </div>

          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800">
            {permissions.map((perm, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="leading-tight">{perm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 space-y-2">
        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Lưu ý bảo mật quản trị</span>
        </h4>
        <p className="text-[11px] text-amber-700/90 dark:text-amber-400 leading-relaxed">
          Tài khoản quản trị viên và giảng viên có quyền can thiệp vào tài nguyên học tập và kết quả của học viên. Vui lòng kiểm tra kỹ vai trò và cấp quyền đúng thẩm quyền trước khi lưu.
        </p>
      </div>
    </div>
  )
}

