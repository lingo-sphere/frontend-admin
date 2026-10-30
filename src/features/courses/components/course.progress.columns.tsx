// Định nghĩa các cột hiển thị bảng tiến độ học viên, lịch học và email nhắc nhở trong trang quản trị.
import { Button, Space, Tooltip } from 'antd'
import { BookOpen, TrendingUp, BarChart3, Mail, Clock, ShieldAlert, AlertTriangle } from 'lucide-react'
import type { DataTableColumn } from '@/components/data.table'
import type { StudentProgressItem } from '@/features/progress/services/progress.service'

interface CreateCourseProgressColumnsParams {
  isVi: boolean
  usersMap: Map<string, import('@/types/api.types').UserProfile | { full_name?: string | null; email?: string | null; avatar_url?: string | null }>
  onSelectStudentDetail: (st: StudentProgressItem) => void
  onSelectReminderHistory: (st: StudentProgressItem) => void
}

function formatScheduleDays(days: Array<number | string> = []): string {
  if (!days || days.length === 0) return 'Mặc định T7'
  const map: Record<string, string> = {
    '1': 'T2',
    '2': 'T3',
    '3': 'T4',
    '4': 'T5',
    '5': 'T6',
    '6': 'T7',
    '0': 'CN',
    'T2': 'T2',
    'T3': 'T3',
    'T4': 'T4',
    'T5': 'T5',
    'T6': 'T6',
    'T7': 'T7',
    'CN': 'CN',
  }
  return days.map((d) => map[String(d)] || String(d)).join(', ')
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
      align: 'left',
      width: '180px',
      minWidth: '160px',
      render: (st) => {
        const u = usersMap.get(st.user_id) || usersMap.get(String(st.user_id))
        const displayName = u?.full_name || st.full_name || ''
        const email = u?.email || st.email || ''
        const avatarSrc = u?.avatar_url || st.avatar_url || undefined

        return (
          <div className="flex items-center justify-start gap-2.5 w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 overflow-hidden">
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
            <div className="min-w-0 text-left">
              <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
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
      title: isVi ? 'Khóa Học' : 'Course',
      sortable: true,
      align: 'left',
      minWidth: 180,
      render: (st) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 whitespace-nowrap">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate min-w-0" title={st.course_title || 'Khóa học tiếng Anh'}>{st.course_title || 'Khóa học tiếng Anh'}</span>
        </span>
      ),
    },
    {
      key: 'progress',
      title: isVi ? 'Tiến Độ' : 'Progress',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (st) => {
        const progressPct = Math.min(100, Math.max(0, st.progress_percentage || 0))
        return (
          <div className="min-w-0 max-w-[120px]">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
              {progressPct}%
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-12 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
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
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {st.completed_lessons}/{st.total_lessons || 1} bài
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'pre_test',
      title: isVi ? 'Đầu Vào' : 'Baseline',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (st) =>
        typeof st.measurement_summary?.baseline_internal === 'number' ? (
          <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-nowrap">
            {st.measurement_summary?.baseline_internal}/100
          </span>
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    {
      key: 'modules',
      title: isVi ? 'KT Chương' : 'Modules',
      align: 'center',
      width: '130px',
      render: (st) => (
        <div className="flex items-center justify-center gap-1 flex-wrap max-w-[130px] mx-auto">
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
      title: isVi ? 'Kết Khóa' : 'Final',
      sortable: true,
      align: 'center',
      width: '120px',
      render: (st) =>
        st.final_test_score !== undefined ? (
          <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
            {st.final_test_score}
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Chưa thi</span>
        ),
    },
    {
      key: 'growth',
      title: isVi ? 'Tăng Trưởng' : 'Growth',
      sortable: true,
      align: 'center',
      width: '130px',
      render: (st) => {
        const growth = st.measurement_summary?.internal_delta
        if (typeof growth !== 'number') return <span className="text-xs text-slate-400">Chưa đủ căn cứ</span>
        return growth > 0 ? (
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
            <TrendingUp className="w-3 h-3" />+{growth}
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
      title: isVi ? 'Lịch Học' : 'Schedule',
      width: '140px',
      align: 'center',
      render: (st) => {
        const sched = st.schedule
        const lock = st.lock_state
        const isLocked = lock?.is_locked
        const missed = sched?.consecutive_missed_sessions || 0
        const time = sched?.reminder_time || '20:00'
        const daysText = formatScheduleDays(sched?.days_of_week)

        return (
          <div className="space-y-0.5 min-w-[125px] inline-flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{time} ({daysText})</span>
            </div>
            <div>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <ShieldAlert className="w-3 h-3" />
                  Khóa C{lock?.locked_chapter_order || ''}
                </span>
              ) : missed > 0 ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  Cảnh báo {missed}/5
                </span>
              ) : sched?.is_active ? (
                <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Đang bật
                </span>
              ) : (
                <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Tắt nhắc
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Actions',
      align: 'center',
      width: '100px',
      sticky: 'right',
      render: (st) => (
        <Space size={4}>
          <Tooltip title={isVi ? 'Xem lịch học và lịch sử gửi email nhắc nhở' : 'View schedule and reminder email history'}>
            <Button
              size="small"
              icon={<Mail className="w-3.5 h-3.5" />}
              onClick={() => onSelectReminderHistory(st)}
            />
          </Tooltip>
          <Tooltip title={isVi ? 'Xem chi tiết tiến độ các chương và bài thi' : 'View detailed chapter progress and test results'}>
            <Button
              size="small"
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              onClick={() => onSelectStudentDetail(st)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]
}
