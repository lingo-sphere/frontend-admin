// Component giao diện tìm kiếm và chọn danh sách học viên cho thông báo đích danh.

import { Search, CheckSquare, Square, Loader2 } from 'lucide-react'
import type { UserProfile } from '@/features/users/schemas/user.schema'

interface CreateNotificationLearnerPickerProps {
  filteredLearners: UserProfile[]
  selectedLearnerIds: string[]
  learnerSearchTerm: string
  isLoadingLearners: boolean
  isAllFilteredSelected: boolean
  onSearchChange: (value: string) => void
  onToggleSelectAll: () => void
  onToggleSelectLearner: (userId: string) => void
}

export function CreateNotificationLearnerPicker({
  filteredLearners,
  selectedLearnerIds,
  learnerSearchTerm,
  isLoadingLearners,
  isAllFilteredSelected,
  onSearchChange,
  onToggleSelectAll,
  onToggleSelectLearner,
}: CreateNotificationLearnerPickerProps) {
  return (
    <div className="pt-3 space-y-3 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            {isAllFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {isAllFilteredSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${filteredLearners.length})`}
            </span>
          </button>
        </div>

        {selectedLearnerIds.length > 0 && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Đã chọn: {selectedLearnerIds.length} học viên
          </span>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên học viên, email hoặc User ID..."
          value={learnerSearchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
        {isLoadingLearners ? (
          <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Đang tải danh sách học viên...</span>
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            Không tìm thấy học viên nào phù hợp
          </div>
        ) : (
          filteredLearners.map((learner) => {
            const uid = learner.user_id || learner.id || ''
            const isSelected = selectedLearnerIds.includes(uid)
            return (
              <div
                key={uid}
                onClick={() => onToggleSelectLearner(uid)}
                className={`w-full p-2.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                  isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/40' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectLearner(uid)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                  />
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                    {learner.avatar_url ? (
                      <img
                        src={learner.avatar_url}
                        alt={learner.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (learner.full_name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {learner.full_name}
                      </p>
                      {learner.is_premium && (
                        <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {learner.email}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {uid}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
