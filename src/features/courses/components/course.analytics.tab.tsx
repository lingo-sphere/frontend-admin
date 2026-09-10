// Tab phân tích báo cáo học tập chuyên sâu, drop-off rate và đề xuất tối ưu.

import { useMemo } from 'react'
import { BarChart2 } from 'lucide-react'
import type { StudentProgressItem } from '@/features/progress/services/progress.service'
import { useCourseAnalytics, type CourseSimple } from '@/features/courses/hooks/use.course.analytics'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import { AnalyticsKpiCards } from '@/features/courses/components/analytics.kpi.cards'
import { AnalyticsFunnelView } from '@/features/courses/components/analytics.funnel.view'
import { AnalyticsRecommendationsView } from '@/features/courses/components/analytics.recommendations.view'

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

  const courseOptions: SelectOption[] = useMemo(() => [
    {
      value: 'ALL',
      label: isTeacher
        ? (isVi ? `Tất cả khóa học của tôi` : `My Courses`)
        : (isVi ? `Tất cả khóa học` : `All Courses`),
      badge: courses.length > 0 ? String(courses.length) : undefined,
    },
    ...courses.map((c) => ({
      value: c.id,
      label: c.title,
      badge: typeof c.students_count === 'number' && c.students_count > 0 ? `${c.students_count} HV` : undefined,
    })),
  ], [courses, isTeacher, isVi])

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

        <div className="w-64 sm:w-72">
          <CustomSelect
            value={selectedCourseId}
            onChange={onSelectCourseId}
            options={courseOptions}
            placeholder={isVi ? 'Chọn khóa học...' : 'Select course...'}
            showSearch={courses.length > 5}
          />
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
