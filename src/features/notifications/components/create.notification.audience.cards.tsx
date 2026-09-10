// Component hiển thị các thẻ lựa chọn nhóm đối tượng học viên nhận thông báo.

import { Users, Crown, Sparkles, UserCheck } from 'lucide-react'
import type { TargetAudience } from '@/features/notifications/hooks/use.create.notification.form'

interface CreateNotificationAudienceCardsProps {
  targetAudience: TargetAudience
  onChange: (audience: TargetAudience) => void
}

export function CreateNotificationAudienceCards({
  targetAudience,
  onChange,
}: CreateNotificationAudienceCardsProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
        <Users className="w-4 h-4 text-indigo-500" />
        <span>Đối Tượng Học Viên Nhận Thông Báo</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => onChange('ALL_USERS')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            targetAudience === 'ALL_USERS'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Toàn bộ học viên</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('FREE_USERS')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            targetAudience === 'FREE_USERS'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Gói Miễn phí</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('PREMIUM_USERS')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            targetAudience === 'PREMIUM_USERS'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Gói VIP Premium</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('SPECIFIC_USER')}
          className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            targetAudience === 'SPECIFIC_USER'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Đích danh cá nhân</span>
        </button>
      </div>
    </div>
  )
}
