import { Activity, Search, ChevronRight, Target, BookOpenCheck, Mic, GraduationCap } from 'lucide-react'
import type { UserActivityLog } from '@/types/api.types'

interface ProgressActivityLogsTabProps {
  logs: UserActivityLog[]
  search: string
  actionFilter: string
  onSearchChange: (val: string) => void
  onActionFilterChange: (val: string) => void
}

export function ProgressActivityLogsTab({
  logs,
  search,
  actionFilter,
  onSearchChange,
  onActionFilterChange,
}: ProgressActivityLogsTabProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'TOEIC_TEST':
        return Target
      case 'VOCAB_STUDY':
        return BookOpenCheck
      case 'AI_CHAT':
        return Mic
      default:
        return GraduationCap
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      search === '' ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'ALL' || log.actionType === actionFilter
    return matchSearch && matchAction
  })

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên học viên, email..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => onActionFilterChange(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">Tất cả hành động</option>
          <option value="TOEIC_TEST">Làm bài thi TOEIC</option>
          <option value="VOCAB_STUDY">Học từ vựng Flashcard</option>
          <option value="AI_CHAT">Luyện nói với AI</option>
        </select>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="pb-3 px-3">Học viên</th>
                <th className="pb-3 px-3">Hành động</th>
                <th className="pb-3 px-3">Điểm / XP</th>
                <th className="pb-3 px-3">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Không có nhật ký hoạt động nào
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const Icon = getIcon(log.actionType)
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {log.userName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {log.userName}
                            </p>
                            <p className="text-[10px] text-slate-400">{log.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{log.actionNameVi}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-teal-600 dark:text-teal-400">
                        {log.scoreOrXP || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
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
