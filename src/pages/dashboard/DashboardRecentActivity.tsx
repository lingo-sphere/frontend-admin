import {
  Target,
  BookOpenCheck,
  Mic,
  Activity,
  GraduationCap,
  ChevronRight,
} from 'lucide-react'
import { recentUserActivityLogs } from '@/data/statistics-data'

interface DashboardRecentActivityProps {
  onViewAll: () => void
  onSelectUser: (userId: string) => void
  isVietnamese: boolean
}

export function DashboardRecentActivity({
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

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
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
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isVietnamese ? 'Xem tất cả' : 'View all'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="pb-3 px-3">{isVietnamese ? 'Học viên' : 'Learner'}</th>
              <th className="pb-3 px-3">{isVietnamese ? 'Hành động' : 'Action'}</th>
              <th className="pb-3 px-3">{isVietnamese ? 'Điểm / XP' : 'Score / XP'}</th>
              <th className="pb-3 px-3">{isVietnamese ? 'Thời gian' : 'Time'}</th>
              <th className="pb-3 px-3">{isVietnamese ? 'Trạng thái' : 'Status'}</th>
              <th className="pb-3 px-3 text-right">{isVietnamese ? 'Chi tiết' : 'Details'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-200">
            {recentUserActivityLogs.slice(0, 5).map((log) => {
              const EventIcon = getEventIcon(log.actionType)

              return (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer"
                      onClick={() => onSelectUser(log.userId)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {log.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                          {log.userName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {log.userEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        {isVietnamese ? log.actionNameVi : log.actionNameEn}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-teal-600 dark:text-teal-400">
                    {log.scoreOrXP}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{log.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectUser(log.userId)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
