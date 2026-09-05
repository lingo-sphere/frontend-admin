/**
 * @file course.curriculum.header.tsx
 * @description Header điều khiển chương trình học với thống kê số lượng chương, bài học, thời lượng video và bài kiểm tra
 */

import { Video, Plus, Film, Layers, Clock, Award, ChevronsUpDown, ChevronsDownUp } from 'lucide-react'

interface CourseCurriculumHeaderProps {
  isVi: boolean
  modulesCount: number
  totalLessons: number
  totalMinutes: number
  totalTests: number
  areAllExpanded: boolean
  onToggleExpandAll: () => void
  onAddModule: () => void
}

export function CourseCurriculumHeader({
  isVi,
  modulesCount,
  totalLessons,
  totalMinutes,
  totalTests,
  areAllExpanded,
  onToggleExpandAll,
  onAddModule,
}: CourseCurriculumHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-500/10">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              {isVi
                ? '3. Chương trình giảng dạy & Lộ trình học tập'
                : '3. Curriculum & Chapter Learning Path'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Thiết kế các chương học, gắn bài học video và bài test đánh giá để học viên mở khóa từng chặng.'
                : 'Structure chapters, upload lesson videos and configure chapter tests.'}
            </p>
          </div>
        </div>

        {modulesCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-800/80">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {modulesCount} {isVi ? 'chương học' : 'chapters'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-bold border border-teal-100 dark:border-teal-800/80">
              <Film className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {totalLessons} {isVi ? 'video bài giảng' : 'lessons'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold border border-amber-100 dark:border-amber-800/80">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {totalMinutes} {isVi ? 'phút bài giảng' : 'min'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold border border-purple-100 dark:border-purple-800/80">
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {totalTests}/{modulesCount} {isVi ? 'chương có bài test' : 'tests ready'}
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {modulesCount > 0 && (
          <button
            type="button"
            onClick={onToggleExpandAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            {areAllExpanded ? (
              <>
                <ChevronsDownUp className="w-4 h-4 text-slate-500" />
                <span>{isVi ? 'Thu gọn tất cả' : 'Collapse all'}</span>
              </>
            ) : (
              <>
                <ChevronsUpDown className="w-4 h-4 text-slate-500" />
                <span>{isVi ? 'Mở rộng tất cả' : 'Expand all'}</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onAddModule}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isVi ? 'Thêm Chương Mới' : 'Add Chapter'}</span>
        </button>
      </div>
    </div>
  )
}
