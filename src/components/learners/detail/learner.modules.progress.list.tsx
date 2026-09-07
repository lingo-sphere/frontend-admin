// Hiển thị danh sách các chương học và điểm số các bài kiểm tra chặng của học viên trong khóa học.

import { BookOpen } from 'lucide-react'
import type { StudentModuleProgress } from '@/services/progress.service'

interface LearnerModulesProgressListProps {
  modules: StudentModuleProgress[]
}

export function LearnerModulesProgressList({ modules }: LearnerModulesProgressListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Cột mốc kiểm tra từng chương (Post-mini Tests & Challenges)</span>
        </h3>
        <span className="text-xs text-slate-400">{modules.length} chương</span>
      </div>

      {modules.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-6 text-center">
          Học viên chưa thực hiện bài kiểm tra chương nào trong khóa học này.
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {modules.map((m, idx) => {
            const modOrder = m.order_index || idx + 1
            const challengeScore = typeof m.challenge_score === 'number' ? m.challenge_score : -1
            const postMiniScore = typeof m.post_mini_score === 'number' ? m.post_mini_score : -1
            const hasChallenge = m.challenge_taken || m.is_passed_by_challenge || challengeScore > 0
            const hasPostMini = postMiniScore > 0 || (typeof m.post_mini_score === 'number' && m.post_mini_score >= 0 && !hasChallenge)
            const isPassed = m.status === 'COMPLETED' || m.is_passed_by_challenge || (challengeScore >= 70) || (postMiniScore >= 70)

            return (
              <div
                key={m.module_id || idx}
                className="p-3.5 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 shrink-0">
                    {modOrder}
                  </span>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {m.title || `Chương ${modOrder}`}
                    </div>
                    <div className="text-[11px] text-slate-400">Mã chương: {m.module_id}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-3 text-xs">
                    {hasChallenge ? (
                      <span className="text-slate-600 dark:text-slate-300">
                        Thử thách:{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {challengeScore >= 0 ? `${challengeScore}đ` : '-'}
                        </strong>
                      </span>
                    ) : null}
                    {hasPostMini ? (
                      <span className="text-slate-600 dark:text-slate-300">
                        Post-mini:{' '}
                        <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {postMiniScore >= 0 ? `${postMiniScore}đ` : '-'}
                        </strong>
                      </span>
                    ) : null}
                    {!hasChallenge && !hasPostMini ? (
                      <span className="text-slate-400 italic">Chưa làm test</span>
                    ) : null}
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isPassed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isPassed ? 'Đã vượt qua' : m.status === 'LOCKED' ? 'Đang khóa' : 'Đang học'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
