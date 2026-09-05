/**
 * @file course.form.header.tsx
 * @description Header trang tạo/chỉnh sửa khóa học kèm nút quay lại và tóm tắt số lượng bài học
 */

import { ChevronLeft, BookOpen } from 'lucide-react'

interface CourseFormHeaderProps {
  isEditMode: boolean
  isVi: boolean
  modulesCount: number
  totalLessons: number
  totalDuration: number
  onBack: () => void
}

export function CourseFormHeader({
  isEditMode,
  isVi,
  modulesCount,
  totalLessons,
  totalDuration,
  onBack,
}: CourseFormHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isVi ? 'Quay lại danh sách khóa học' : 'Back to courses'}</span>
        </button>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {modulesCount} {isVi ? 'chương' : 'chapters'} · {totalLessons} {isVi ? 'bài học' : 'lessons'} ({totalDuration} {isVi ? 'phút' : 'min'})
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>
              {isEditMode
                ? isVi
                  ? 'Chỉnh Sửa Khóa Học'
                  : 'Edit Course'
                : isVi
                ? 'Tạo Khóa Học Mới'
                : 'Create Course'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Quản lý giáo trình bài giảng video, các chương học (modules) và thời lượng bài học.'
              : 'Manage video curriculum, modules and lesson duration.'}
          </p>
        </div>
      </div>
    </div>
  )
}
