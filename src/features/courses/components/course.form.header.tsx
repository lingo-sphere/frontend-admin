// Header trang tao/chinh sua khoa hoc kem nut quay lai, nut nhap thu muc va tom tat so luong bai hoc.

import { ChevronLeft, BookOpen, FolderUp } from 'lucide-react'

interface CourseFormHeaderProps {
  isEditMode: boolean
  isVi: boolean
  modulesCount: number
  totalLessons: number
  totalDuration: number
  onBack: () => void
  onOpenFolderImport?: () => void
}

export function CourseFormHeader({
  isEditMode,
  isVi,
  modulesCount,
  totalLessons,
  totalDuration,
  onBack,
  onOpenFolderImport,
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

        {onOpenFolderImport && (
          <button
            type="button"
            onClick={onOpenFolderImport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <FolderUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isVi ? 'Nhập Nhanh Từ Thư Mục' : 'Fast Import From Folder'}</span>
          </button>
        )}
      </div>
    </div>
  )
}

