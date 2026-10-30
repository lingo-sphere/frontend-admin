// Trang quản lý chấm điểm và phúc khảo bài kiểm tra khóa học.

import { FileCheck2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { CourseTestSessionsTab } from '@/features/submissions/components/course.test.sessions.tab'
import { useCourseLearnersData } from '@/features/courses/hooks/use.course.learners.data'

export function SubmissionsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    courses,
    selectedCourseId,
    isLoadingCourses,
    coursesError,
  } = useCourseLearnersData({
    loadProgress: false,
    loadSubmissions: false,
    courseId: searchParams.get('courseId') || 'ALL',
  })

  const selectCourse = (courseId: string) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      if (courseId === 'ALL') next.delete('courseId')
      else next.set('courseId', courseId)
      return next
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <FileCheck2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isVi ? 'Chấm điểm & Phúc khảo — Bài kiểm tra khóa học' : 'Submission Grading & Review'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Xem các lượt kiểm tra khóa học, bài làm và kết quả; theo dõi điểm challenge, kiểm tra chương và kết khóa.'
              : 'Inspect course test attempts, answers and results for challenge tests, chapter reviews and final exams.'}
          </p>
        </div>
      </div>

      <CourseTestSessionsTab
        key={selectedCourseId}
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourseId={selectCourse}
        isLoadingCourses={isLoadingCourses}
        coursesError={coursesError}
      />
    </div>
  )
}
