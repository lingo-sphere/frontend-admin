// Định nghĩa các cột hiển thị bảng danh sách học viên trong trang quản trị
import { Target, Sparkles, Flame, Crown, Ban, CheckCircle, RotateCcw, Trophy, Bell } from 'lucide-react'
import type { User } from '@/features/users/types/learner.types'
import type { DataTableColumn } from '@/components/data.table'
import { Popconfirm } from '@/components/popconfirm'

interface GetLearnerColumnsOptions {
  isVi?: boolean
  onViewDetails?: (userId: string) => void
  onViewProfile?: (userId: string) => void
  onOpenStatusModal: (user: User, action: 'ban' | 'unban') => Promise<void> | void
  onOpenAiQuotaModal?: (user: User) => void
  onResetData?: (user: User) => Promise<void> | void
  onRemindLearner?: (user: User) => void
}

export function getLearnerColumns({
  isVi = true,
  onViewDetails,
  onViewProfile,
  onOpenStatusModal,
  onOpenAiQuotaModal,
  onResetData,
  onRemindLearner,
}: GetLearnerColumnsOptions): DataTableColumn<User>[] {
  const handleView = onViewProfile || onViewDetails || (() => {})
  return [
    {
      key: 'user',
      title: isVi ? 'Học viên' : 'Learner',
      sortable: true,
      render: (u) => {
        const name = u.full_name || u.email.split('@')[0]
        return (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleView(u.user_id)}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {u.avatar_url ? (
                <img
                  src={u.avatar_url}
                  alt={name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'target',
      title: isVi ? 'Mục tiêu & Trình độ' : 'Target & Level',
      render: (u) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
            <Target className="w-3.5 h-3.5" />
            <span>Target {u.target_toeic_score ? `${u.target_toeic_score}+` : 0}</span>
          </div>
          {u.placement_test_score !== undefined && u.placement_test_score > 0 ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <Trophy className="w-3 h-3 text-blue-500" />
              <span>Test đầu vào: {u.placement_test_score}đ</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
              {isVi ? 'Chưa test đầu vào' : 'No placement test'}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'gamification',
      title: 'Gamification (XP & Streak)',
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
            {(u.total_xp ?? 0).toLocaleString()} XP
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-rose-500">
            <Flame className="w-3.5 h-3.5 fill-rose-500" />
            {u.current_streak ?? 0} {isVi ? 'ngày' : 'days'}
          </span>
        </div>
      ),
    },
    {
      key: 'plan',
      title: isVi ? 'Gói học' : 'Plan',
      render: (u) => {
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              u.is_premium
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {u.is_premium && <Crown className="w-3 h-3 text-amber-500" />}
            <span>{u.is_premium ? 'VIP Premium' : (isVi ? 'Miễn phí' : 'Free')}</span>
          </span>
        )
      },
    },
    {
      key: 'status',
      title: isVi ? 'Trạng thái' : 'Status',
      render: (u) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            u.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}
        >
          {u.status === 'ACTIVE' ? (isVi ? 'Hoạt động' : 'Active') : (isVi ? 'Tạm khóa' : 'Blocked')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao tác' : 'Actions',
      align: 'right',
      render: (u) => {
        const isActive = u.status === 'ACTIVE'
        return (
          <div className="flex items-center justify-end gap-1.5">
            {onRemindLearner && (
              <button
                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                title={isVi ? 'Nhắc nhở học tập' : 'Send study reminder'}
                type="button"
                onClick={() => onRemindLearner(u)}
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenAiQuotaModal && (
              <button
                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 transition-colors cursor-pointer"
                title={isVi ? 'Hạn mức & Reset AI' : 'AI Quota & Reset'}
                type="button"
                onClick={() => onOpenAiQuotaModal(u)}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
            {isActive ? (
              <Popconfirm
                title={isVi ? 'Khóa tài khoản học viên này?' : 'Block this learner account?'}
                description={
                  isVi
                    ? 'Học viên này sẽ bị tạm dừng truy cập vào hệ thống.'
                    : 'This learner will be suspended from accessing the system.'
                }
                okText={isVi ? 'Khóa tài khoản' : 'Block'}
                cancelText={isVi ? 'Hủy' : 'Cancel'}
                okType="danger"
                placement="topRight"
                onConfirm={() => onOpenStatusModal(u, 'ban')}
              >
                <button
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                  title={isVi ? 'Khóa tài khoản học viên' : 'Block learner account'}
                  type="button"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title={isVi ? 'Mở khóa tài khoản học viên?' : 'Unblock this learner account?'}
                description={
                  isVi
                    ? 'Học viên này sẽ có thể đăng nhập lại vào hệ thống.'
                    : 'This learner will be able to log into the platform again.'
                }
                okText={isVi ? 'Mở khóa' : 'Unblock'}
                cancelText={isVi ? 'Hủy' : 'Cancel'}
                okType="primary"
                placement="topRight"
                onConfirm={() => onOpenStatusModal(u, 'unban')}
              >
                <button
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                  title={isVi ? 'Mở khóa tài khoản' : 'Unblock learner account'}
                  type="button"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              </Popconfirm>
            )}
            {onResetData && (
              <Popconfirm
                title={isVi ? 'Khởi tạo lại dữ liệu học tập?' : 'Reset learner learning data?'}
                description={
                  isVi
                    ? 'Hủy đăng ký khóa học, xóa tiến độ bài học, bài nộp và điểm thi của học viên này. Tài khoản đăng nhập vẫn được giữ nguyên.'
                    : 'Clear course enrollments, lesson progress, submissions, and test scores. Login credentials remain intact.'
                }
                okText={isVi ? 'Khởi tạo lại' : 'Reset'}
                cancelText={isVi ? 'Hủy' : 'Cancel'}
                okType="danger"
                placement="topRight"
                onConfirm={() => onResetData(u)}
              >
                <button
                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                  title={isVi ? 'Khởi tạo lại toàn bộ dữ liệu học tập' : 'Reset learner data'}
                  type="button"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </Popconfirm>
            )}
          </div>
        )
      },
    },
  ]
}
