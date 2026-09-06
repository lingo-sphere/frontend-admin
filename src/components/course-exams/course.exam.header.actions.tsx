/**
 * @file course.exam.header.actions.tsx
 * @description Các thao tác hành động trên header bảng: chọn khóa học, làm mới dữ liệu và tạo bài thi mới
 */

import { useMemo } from 'react'
import { RotateCcw, Plus } from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'
import { CustomSelect, type SelectOption } from '@/components/common/custom.select'

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
  onOpenCreateModal: () => void
}

export function CourseExamHeaderActions({
  isVi,
  isLoading,
  courses,
  exams,
  selectedCourseId,
  onSelectCourseId,
  onRefresh,
  onOpenCreateModal,
}: CourseExamHeaderActionsProps) {
  const courseOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [
      {
        value: 'ALL',
        label: isVi
          ? `Tất cả bài thi (Khóa học & Hệ thống)`
          : `All Exams (${exams.length})`,
        badge: String(exams.length),
        badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      },
      {
        value: 'GLOBAL_SYSTEM',
        label: isVi ? 'Bài Test Năng Lực Đầu Vào' : 'System Placement Tests',
        badge: isVi ? 'Hệ thống' : 'System',
        badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
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
          placeholder={isVi ? 'Chọn khóa học / bài thi...' : 'Select course...'}
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

      <button
        type="button"
        onClick={onOpenCreateModal}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>{isVi ? 'Tạo bài thi mới' : 'Add New Exam'}</span>
      </button>
    </>
  )
}
