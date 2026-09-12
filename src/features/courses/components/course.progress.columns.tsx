// Định nghĩa các cột hiển thị bảng tiến độ học viên, lịch học và email nhắc nhở trong trang quản trị.
import { BookOpen, TrendingUp, BarChart3, Mail, Clock, ShieldAlert, AlertTriangle } from 'lucide-react'
import type { DataTableColumn } from '@/components/data.table'
import type { StudentProgressItem } from '@/features/progress/services/progress.service'

interface CreateCourseProgressColumnsParams {
  isVi: boolean
  usersMap: Map<string, import('@/types/api.types').UserProfile | { full_name?: string | null; email?: string | null; avatar_url?: string | null }>
  onSelectStudentDetail: (st: StudentProgressItem) => void
  onSelectReminderHistory: (st: StudentProgressItem) => void
}

function formatScheduleDays(days: number[] = []): string {
  if (!days || days.length === 0) return 'Mặc định T7'
  const map: Record<number, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' }
  return days.map((d) => map[d] || `T${d}`).join(', ')
}

export function createCourseProgressColumns({
  isVi,
  usersMap,
  onSelectStudentDetail,
  onSelectReminderHistory,
}: CreateCourseProgressColumnsParams): DataTableColumn<StudentProgressItem>[] {
  return [
    {
      key: 'learner',
      title: isVi ? 'Học Viên' : 'Student',
      sortable: true,
      render: (st) => {
        const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
        const displayName = u?.full_name || st.full_name || 'Học viên ẩn danh'
        const email = u?.email || st.email || 'Chưa cập nhật email'
        const avatarSrc = (u?.avatar_url || st.avatar_url) || undefined

        return (
          <div className="flex items-center gap-3 min-w-[170px]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 overflow-hidden">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{email}</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'course',
      title: isVi ? 'Khóa Học Đang Học' : 'Enrolled Course',
      sortable: true,
      render: (st) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 whitespace-nowrap">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate max-w-[190px]">{st.course_title || 'Khóa học tiếng Anh'}</span>
        </span>
      ),
    },
    {
      key: 'progress',
      title: isVi ? 'Tiến Độ Học' : 'Progress',
      sortable: true,
      render: (st) => {
        const progressPct = Math.min(100, Math.max(0, st.progress_percentage || 0))
        return (
          <div className="space-y-1 min-w-[130px]">
            <div className="flex items-center justify-between text-[11px] whitespace-nowrap">
              <span className="font-bold text-slate-700 dark:text-slate-300">{progressPct}%</span>
              <span className="text-slate-400">
                {st.completed_lessons}/{st.total_lessons || 1} bài
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPct >= 100
                    ? 'bg-emerald-500'
                    : progressPct >= 50
                    ? 'bg-indigo-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'pre_test',
      title: isVi ? 'Đầu Vào (Pre-test)' : 'Baseline',
      align: 'center',
      sortable: true,
      render: (st) =>
        st.baseline_score !== undefined ? (
          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-nowrap">
            {st.baseline_score}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    {
      key: 'modules',
      title: isVi ? 'Kiểm Tra Chương' : 'Module Tests',
      align: 'center',
      render: (st) => (
        <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[200px] mx-auto">
          {st.modules_progress && st.modules_progress.length > 0 ? (
            st.modules_progress.map((m, idx) => {
              const challenge = typeof m.challenge_score === 'number' ? m.challenge_score : -1
              const postMini = typeof m.post_mini_score === 'number' ? m.post_mini_score : -1
              const maxScore = Math.max(challenge, postMini)
              const score = maxScore >= 0 ? maxScore : m.best_score
              const passed = m.status === 'COMPLETED' || m.is_passed_by_challenge || (score !== undefined && score >= 70)
              const modOrder = m.order_index || idx + 1
              const modName = m.title || `Chương ${modOrder}`
              return (
                <span
                  key={m.module_id || idx}
                  title={`${modName}: ${score !== undefined ? score + ' điểm' : m.status}`}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                    passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  C{modOrder}: {score !== undefined ? score : '-'}
                </span>
              )
            })
          ) : (
            <span className="text-slate-400 text-xs">Chưa test</span>
          )}
        </div>
      ),
    },
    {
      key: 'final_test',
      title: isVi ? 'Kết Khóa (Final)' : 'Final Test',
      align: 'center',
      sortable: true,
      render: (st) =>
        st.final_test_score !== undefined ? (
          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
            {st.final_test_score}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Chưa thi</span>
        ),
    },
    {
      key: 'growth',
      title: isVi ? 'Tăng Trưởng' : 'Growth',
      align: 'center',
      sortable: true,
      render: (st) => {
        const growth = st.total_score_growth ?? ((st.final_test_score || 0) - (st.baseline_score || 0))
        return growth > 0 ? (
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <TrendingUp className="w-3.5 h-3.5" />+{growth}
          </span>
        ) : growth < 0 ? (
          <span className="text-xs font-bold text-rose-500 whitespace-nowrap">{growth}</span>
        ) : (
          <span className="text-slate-400 text-xs whitespace-nowrap">0</span>
        )
      },
    },
    {
      key: 'schedule',
      title: isVi ? 'Lịch Học & Chuyên Cần' : 'Schedule & Attendance',
      render: (st) => {
        const sched = st.schedule
        const lock = st.lock_state
        const isLocked = lock?.is_locked
        const missed = sched?.consecutive_missed_sessions || 0
        const time = sched?.reminder_time || '19:30'
        const daysText = formatScheduleDays(sched?.days_of_week)

        return (
          <div className="space-y-1 min-w-[140px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{time} ({daysText})</span>
            </div>
            <div>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <ShieldAlert className="w-3 h-3" />
                  Khóa C{lock?.locked_chapter_order || ''}
                </span>
              ) : missed > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  Cảnh báo {missed}/5
                </span>
              ) : sched?.is_active ? (
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Đúng lịch
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Mặc định T7
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Action',
      align: 'right',
      render: (st) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onSelectReminderHistory(st)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Xem lịch học và lịch sử gửi email nhắc nhở"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Lịch & Email</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectStudentDetail(st)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
            title="Xem chi tiết tiến độ các chương và bài thi"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tiến độ</span>
          </button>
        </div>
      ),
    },
  ]
}
