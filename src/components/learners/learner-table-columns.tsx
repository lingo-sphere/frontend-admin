import { Target, Zap, Flame, Crown, Ban, CheckCircle } from 'lucide-react'
import type { User } from '@/data/users-data'
import type { DataTableColumn } from '@/components/common/DataTable'

interface GetLearnerColumnsOptions {
  onViewDetails?: (userId: string) => void
  onViewProfile?: (userId: string) => void
  onOpenStatusModal: (user: User, action: 'ban' | 'unban') => void
}

export function getLearnerColumns({
  onViewDetails,
  onViewProfile,
  onOpenStatusModal,
}: GetLearnerColumnsOptions): DataTableColumn<User>[] {
  const handleView = onViewProfile || onViewDetails || (() => {})
  return [
    {
      key: 'user',
      title: 'Học viên',
      render: (u) => {
        const name = u.full_name || u.email.split('@')[0]
        return (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleView(u.id)}
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
      title: 'Mục tiêu & Trình độ',
      render: (u) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400">
            <Target className="w-3.5 h-3.5" />
            <span>Target {u.target_toeic_score || 650}+</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ước lượng: {u.current_estimated_score || 450}
          </p>
        </div>
      ),
    },
    {
      key: 'gamification',
      title: 'Gamification (XP & Streak)',
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
            {(u.total_xp || 0).toLocaleString()} XP
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-rose-500">
            <Flame className="w-3.5 h-3.5 fill-rose-500" />
            {u.current_streak || 0} ngày
          </span>
        </div>
      ),
    },
    {
      key: 'plan',
      title: 'Gói học',
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
            <span>{u.is_premium ? 'VIP Premium' : 'Miễn phí'}</span>
          </span>
        )
      },
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (u) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            u.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
          }`}
        >
          {u.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right',
      render: (u) => {
        const isActive = u.status === 'ACTIVE'
        return (
          <div className="flex items-center justify-end gap-1.5">
            {isActive ? (
              <button
                onClick={() => onOpenStatusModal(u, 'ban')}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors cursor-pointer"
                title="Khóa tài khoản học viên"
              >
                <Ban className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onOpenStatusModal(u, 'unban')}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 transition-colors cursor-pointer"
                title="Mở khóa tài khoản"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )
      },
    },
  ]
}
