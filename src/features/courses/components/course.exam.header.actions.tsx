// Các thao tác hành động trên header bảng: chọn khóa học và làm mới dữ liệu bài thi khóa học.

import { useMemo } from 'react'
import { RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { CustomSelect, type SelectOption } from '@/components/custom.select'

export interface CourseSelectItem {
  id: string
  title: string
  author_id?: string
  students_count?: number
}

interface CourseExamHeaderActionsProps {
  isVi: boolean
  isLoading: boolean
  courses: CourseSelectItem[]
  exams: ToeicExamItem[]
  selectedCourseId: string
  onSelectCourseId: (courseId: string) => void
  onRefresh: () => void
}

export function CourseExamHeaderActions({
  isVi,
  isLoading,
  courses,
  exams,
  selectedCourseId,
  onSelectCourseId,
  onRefresh,
}: CourseExamHeaderActionsProps) {
  const courseOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [
      {
        value: 'ALL',
        label: isVi
          ? `Tất cả khóa học (${exams.length} bài)`
          : `All Courses (${exams.length})`,
        badge: String(exams.length),
        badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      },
    ]

    courses.forEach((c) => {
      const count = exams.filter((e) => e.course_id === c.id).length
      list.push({
        value: c.id,
        label: c.title,
        badge: isVi ? `${count} bài` : `${count}`,
      })
    })

    return list
  }, [courses, exams, isVi])

  return (
    <>
      <div className="w-64 sm:w-72">
        <CustomSelect
          value={selectedCourseId}
          onChange={onSelectCourseId}
          options={courseOptions}
          size="md"
          showSearch={courses.length > 5}
          placeholder={isVi ? 'Chọn khóa học...' : 'Select course...'}
        />
      </div>

      <button
        type="button"
        onClick={onRefresh}
        title={isVi ? 'Làm mới dữ liệu' : 'Refresh Data'}
        className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
      >
        <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
      </button>

      <Link
        to="/practice/placement-tests"
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isVi ? 'Đề thi đầu vào' : 'Placement Tests'}</span>
      </Link>
    </>
  )
}
