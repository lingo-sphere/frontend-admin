/**
 * @file course.exam.header.actions.tsx
 * @description Các thao tác hành động trên header bảng: chọn khóa học, làm mới dữ liệu và tạo bài thi mới
 */

import { BookOpen, RotateCcw, Plus } from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'

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
  return (
    <>
      <div className="flex items-center gap-2 min-w-[280px]">
        <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
        <select
          value={selectedCourseId}
          onChange={(e) => onSelectCourseId(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">
            {isVi
              ? `Tất cả bài thi (Khóa học & Toàn hệ thống - ${exams.length})`
              : `All Exams (${exams.length})`}
          </option>
          <option value="GLOBAL_SYSTEM">
            ⭐ {isVi ? 'Bài Test Năng Lực Đầu Vào Toàn Hệ Thống' : 'System Placement Tests'}
          </option>
          {courses.length > 0 && (
            <optgroup label={isVi ? 'Theo từng Khóa học' : 'By Course'}>
              {courses.map((c) => {
                const count = exams.filter((e) => e.course_id === c.id).length
                return (
                  <option key={c.id} value={c.id}>
                    {c.title} ({count} bài thi)
                  </option>
                )
              })}
            </optgroup>
          )}
        </select>
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
