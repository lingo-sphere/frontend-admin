// Component hiển thị nhật ký hoạt động người học gần đây trên trang Dashboard theo phong cách SaaS hiện đại.
import {
  Target,
  BookOpenCheck,
  Mic,
  Activity,
  GraduationCap,
  ChevronRight,
} from 'lucide-react'
import type { UserActivityLog } from '@/types/api.types'

interface DashboardRecentActivityProps {
  activities?: UserActivityLog[]
  onViewAll: () => void
  onSelectUser: (userId: string) => void
  isVietnamese: boolean
}

export function DashboardRecentActivity({
  activities = [],
  onViewAll,
  onSelectUser,
  isVietnamese,
}: DashboardRecentActivityProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'TOEIC_TEST':
        return Target
      case 'VOCAB_STUDY':
        return BookOpenCheck
      case 'AI_CHAT':
        return Mic
      case 'PREMIUM_UPGRADE':
        return Activity
      default:
        return GraduationCap
    }
  }

  const formatActivityTime = (timestamp: string | Date) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString(isVietnamese ? 'vi-VN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
    } catch {
      return String(timestamp)
    }
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {isVietnamese ? 'Nhật Ký Hoạt Động Gần Đây' : 'Recent Activity Logs'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isVietnamese
              ? 'Tiến trình học tập và làm bài của học viên trên toàn hệ thống'
              : 'Learning progress and test submissions across the platform'}
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isVietnamese ? 'Xem tất cả' : 'View all'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-200 font-bold text-[13px] tracking-wide">
                <th className="py-3 px-3.5 text-center">{isVietnamese ? 'Học viên' : 'Learner'}</th>
                <th className="py-3 px-3.5 text-center">{isVietnamese ? 'Hành động' : 'Action'}</th>
                <th className="py-3 px-3.5 text-center">{isVietnamese ? 'Điểm / XP' : 'Score / XP'}</th>
                <th className="py-3 px-3.5 text-center">{isVietnamese ? 'Thời gian' : 'Time'}</th>
                <th className="py-3 px-3.5 text-center">{isVietnamese ? 'Chi tiết' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-200">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    {isVietnamese ? 'Chưa có hoạt động nào được ghi nhận gần đây' : 'No recent activities recorded'}
                  </td>
                </tr>
              ) : (
                activities.slice(0, 6).map((log) => {
                  const EventIcon = getEventIcon(log.actionType)

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-3.5">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer"
                          onClick={() => onSelectUser(log.userId ? log.userId : log.id)}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-1 ring-black/5 dark:ring-white/10 shrink-0">
                            {log.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate">
                              {log.userName}
                            </p>
                            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 truncate">
                              {log.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/50 flex items-center justify-center shrink-0">
                            <EventIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {isVietnamese ? log.actionNameVi : log.actionNameEn}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-teal-600 dark:text-teal-400 font-mono">
                        {log.scoreOrXP ? log.scoreOrXP : '-'}
                      </td>
                      <td className="py-3 px-3.5 text-center text-slate-400 dark:text-slate-500 text-[11px] whitespace-nowrap">
                        {formatActivityTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => onSelectUser(log.userId ? log.userId : log.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer inline-flex items-center justify-center"
                          title={isVietnamese ? 'Xem chi tiết người dùng' : 'View user details'}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

