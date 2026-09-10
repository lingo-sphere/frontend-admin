// Định nghĩa các cột hiển thị bảng tiến độ học viên trong trang quản trị tiến độ khóa học
import { BookOpen, TrendingUp, BarChart3 } from 'lucide-react'
import type { DataTableColumn } from '@/components/data.table'
import type { StudentProgressItem } from '@/features/progress/services/progress.service'

interface CreateCourseProgressColumnsParams {
  isVi: boolean
  usersMap: Map<string, { full_name?: string; email?: string; avatar_url?: string }>
  onSelectStudentDetail: (st: StudentProgressItem) => void
}

export function createCourseProgressColumns({
  isVi,
  usersMap,
  onSelectStudentDetail,
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

        return (
          <div className="flex items-center gap-3 min-w-[170px]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 overflow-hidden">
              {u?.avatar_url || st.avatar_url ? (
                <img
                  src={u?.avatar_url || st.avatar_url}
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
      key: 'actions',
      title: isVi ? 'Chi Tiết' : 'Action',
      align: 'right',
      render: (st) => (
        <button
          type="button"
          onClick={() => onSelectStudentDetail(st)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap ml-auto"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Xem tiến độ</span>
        </button>
      ),
    },
  ]
}
