// Component hiển thị lưới chỉ số thành tích học viên trang chi tiết theo phong cách SaaS hiện đại.
import { Flame, Star, Target, Clock, Award, BookOpen } from 'lucide-react'
import type { UserProfileData } from '@/features/users/components/learner.profile.header'

interface UserProfileStatsGridProps {
  profileData: UserProfileData
}

export function UserProfileStatsGrid({ profileData }: UserProfileStatsGridProps) {
  const statsList = [
    {
      label: 'Tổng XP',
      value: (profileData.total_xp ?? 0).toLocaleString(),
      icon: Star,
      strip: 'bg-amber-500',
      iconBox: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50',
    },
    {
      label: 'Streak Học',
      value: `${profileData.current_streak ?? 0} ngày`,
      icon: Flame,
      strip: 'bg-rose-500',
      iconBox: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/50',
    },
    {
      label: 'Mục Tiêu TOEIC',
      value: profileData.toeic_score ? `${profileData.toeic_score}+` : 'Chưa đặt',
      icon: Target,
      strip: 'bg-teal-500',
      iconBox: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/50',
    },
    {
      label: 'Cấp Độ',
      value: `Level ${profileData.level ?? 1}`,
      icon: Award,
      strip: 'bg-indigo-500',
      iconBox: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50',
    },
    {
      label: 'Từ Đã Học',
      value: (profileData.total_words_learned ?? 0).toLocaleString(),
      icon: BookOpen,
      strip: 'bg-blue-500',
      iconBox: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50',
    },
    {
      label: 'Bài Hoàn Thành',
      value: `${profileData.total_lessons_completed ?? 0} bài`,
      icon: Clock,
      strip: 'bg-purple-500',
      iconBox: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {statsList.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all p-3.5 pl-4 flex flex-col justify-between"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.strip} rounded-l-2xl`} />
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${item.iconBox}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {item.label}
              </span>
            </div>
            <p className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {item.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
