/**
 * @file course.analytics.tab.tsx
 * @description Tab phân tích báo cáo học tập chuyên sâu dành cho Giảng viên và Quản trị viên (Drop-off Rate, Funnel, Độ khó bài thi & Gợi ý sư phạm AI)
 */

import { BarChart2, BookOpen } from 'lucide-react'
import type { StudentProgressItem } from '@/services/progress.service'
import { useCourseAnalytics, type CourseSimple } from '@/hooks/use.course.analytics'
import { AnalyticsKpiCards } from '@/components/learners/analytics/analytics.kpi.cards'
import { AnalyticsFunnelView } from '@/components/learners/analytics/analytics.funnel.view'
import { AnalyticsRecommendationsView } from '@/components/learners/analytics/analytics.recommendations.view'

export type { CourseSimple }

interface CourseAnalyticsTabProps {
  allStudentsProgress: StudentProgressItem[]
  courses: CourseSimple[]
  selectedCourseId: string
  onSelectCourseId: (courseId: string) => void
  isVi?: boolean
  isTeacher?: boolean
}

export function CourseAnalyticsTab({
  allStudentsProgress,
  courses,
  selectedCourseId,
  onSelectCourseId,
  isVi = true,
  isTeacher = false,
}: CourseAnalyticsTabProps) {
  const { analyticsSummary, chapterFunnel, worstChapter } = useCourseAnalytics(
    allStudentsProgress,
    courses,
    selectedCourseId
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {isVi
                  ? 'Báo Cáo Phân Tích Học Tập & Điểm Rơi (Learning Analytics)'
                  : 'Learning Analytics & Retention'}
              </span>
            </h3>
            {isTeacher ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Giảng viên
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Admin Analytics
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Theo dõi phễu hoàn thành bài học, tỷ lệ học viên dừng lại (Drop-off rate), độ khó bài test và gợi ý sư phạm tối ưu bài giảng.'
              : 'Track completion funnel, drop-off hotspots, assessment difficulty, and pedagogical AI insights.'}
          </p>
        </div>

        <div className="flex items-center gap-2 min-w-[260px]">
          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCourseId}
            onChange={(e) => onSelectCourseId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="ALL">
              {isTeacher
                ? `Tất cả khóa học của tôi (${courses.length})`
                : `Tất cả khóa học (${courses.length})`}
            </option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnalyticsKpiCards analyticsSummary={analyticsSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsFunnelView chapterFunnel={chapterFunnel} worstChapter={worstChapter} />
        </div>
        <div>
          <AnalyticsRecommendationsView />
        </div>
      </div>
    </div>
  )
}
