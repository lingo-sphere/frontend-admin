// Từng hàng trong bảng điểm học viên hiển thị avatar, tiến độ, điểm các chương, điểm thi kết khóa
import { Target, FileCheck2, Award, CheckCircle2, Clock } from 'lucide-react'
import type { StudentProgressItem } from '@/services/progress.service'
import type { UserProfile } from '@/types/api.types'

interface StudentScoresTableRowProps {
  student: StudentProgressItem
  userProfile?: UserProfile
}

export function StudentScoresTableRow({
  student,
  userProfile,
}: StudentScoresTableRowProps) {
  const displayName: string = String(
    userProfile?.full_name ||
      student.full_name ||
      `Học viên #${student.user_id.slice(-6)}`
  )
  const displayEmail: string = String(
    userProfile?.email || student.email || 'Học viên đã đăng ký'
  )
  const avatarUrl: string | undefined =
    userProfile?.avatar_url || student.avatar_url
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase()

  const modules = student.modules_progress || []

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
              {displayName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
              {displayEmail}
            </div>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="space-y-1.5 min-w-[130px]">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-indigo-600 dark:text-indigo-400">
              {student.progress_percentage}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {student.completed_lessons}/{student.total_lessons} bài
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, student.progress_percentage))}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        {modules.length === 0 ? (
          <span className="text-[11px] text-slate-400 italic">Chưa thực hiện kiểm tra</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {modules.map((m, mIdx) => {
              const chNum = m.order_index || mIdx + 1
              const hasChallenge =
                (m.challenge_score || 0) > 0 || m.is_passed_by_challenge
              const hasPostMini = (m.post_mini_score || 0) > 0

              return (
                <div
                  key={m.module_id || mIdx}
                  className="px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1.5 text-[11px] shadow-2xs"
                >
                  <span className="font-extrabold text-slate-700 dark:text-slate-200">
                    C{chNum}:
                  </span>

                  {hasChallenge && (
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold px-1 rounded ${
                        m.is_passed_by_challenge
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                      title={`Thử thách đầu chương: ${m.challenge_score || 0}%`}
                    >
                      <Target className="w-2.5 h-2.5" />
                      <span>{m.challenge_score || 0}%</span>
                    </span>
                  )}

                  {hasPostMini ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold px-1 rounded ${
                        (m.post_mini_score || 0) >= 70
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                      title={`Kiểm tra cuối chương: ${m.post_mini_score}%`}
                    >
                      <FileCheck2 className="w-2.5 h-2.5" />
                      <span>{m.post_mini_score}%</span>
                    </span>
                  ) : !hasChallenge ? (
                    <span className="text-slate-400 text-[10px]">Chưa thi</span>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </td>

      <td className="py-3.5 px-4 text-center">
        {typeof student.final_test_score === 'number' && student.final_test_score > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>{student.final_test_score}%</span>
          </span>
        ) : (
          <span className="text-slate-400 text-[11px] font-medium">—</span>
        )}
      </td>

      <td className="py-3.5 px-4 text-center">
        {student.progress_percentage >= 100 || student.status === 'COMPLETED' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Hoàn thành</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Đang học</span>
          </span>
        )}
      </td>
    </tr>
  )
}
