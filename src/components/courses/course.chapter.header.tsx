/**
 * @file course.chapter.header.tsx
 * @description Thành phần tiêu đề chương học với thông tin thống kê số bài, thời lượng, bài kiểm tra và các nút điều hướng
 */

import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Film,
  Award,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react'
import type { CourseModule } from './course.basic.info.tab'

interface CourseChapterHeaderProps {
  module: CourseModule
  moduleIndex: number
  totalModules: number
  isExpanded: boolean
  isVi: boolean
  modDuration: number
  questionCount: number
  passingScore: number
  onToggleExpand: () => void
  onRemoveModule: () => void
  onAddLesson: () => void
  onMoveModuleUp?: () => void
  onMoveModuleDown?: () => void
}

export function CourseChapterHeader({
  module,
  moduleIndex,
  totalModules,
  isExpanded,
  isVi,
  modDuration,
  questionCount,
  passingScore,
  onToggleExpand,
  onRemoveModule,
  onAddLesson,
  onMoveModuleUp,
  onMoveModuleDown,
}: CourseChapterHeaderProps) {
  const isFirstChapter = moduleIndex === 0
  const isLastChapter = moduleIndex === totalModules - 1

  return (
    <div
      className={`p-3.5 sm:p-4.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
        isExpanded
          ? 'bg-gradient-to-r from-indigo-50/80 via-slate-50/50 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-b border-indigo-100 dark:border-indigo-950'
          : 'bg-white hover:bg-slate-50/70 dark:bg-slate-900 dark:hover:bg-slate-850'
      }`}
    >
      <div
        onClick={onToggleExpand}
        className="flex items-center gap-3 flex-1 min-w-[260px] cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-xs shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {isVi ? 'Chương' : 'Chapter'} {moduleIndex + 1}
            </span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {module.title || (
                <span className="italic text-slate-400 font-normal">
                  {isVi ? '(Chưa đặt tiêu đề chương học)' : '(Untitled chapter)'}
                </span>
              )}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Film className="w-3 h-3 text-indigo-500" />
              <span>
                {module.lessons.length} {isVi ? 'bài học video' : 'lessons'}
              </span>
              <span>·</span>
              <span>
                {modDuration} {isVi ? 'phút' : 'min'}
              </span>
            </span>

            {questionCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Award className="w-3 h-3 text-emerald-600" />
                <span>
                  {isVi ? 'Bài test' : 'Test'}: {questionCount} {isVi ? 'câu' : 'qs'} ({passingScore}%)
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <span>{isVi ? 'Chưa có bài test' : 'No test'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(onMoveModuleUp || onMoveModuleDown) && (
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={onMoveModuleUp}
              disabled={isFirstChapter}
              className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-25 disabled:cursor-not-allowed dark:hover:text-indigo-400 transition-colors"
              title={isVi ? 'Chuyển chương lên trước' : 'Move chapter up'}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveModuleDown}
              disabled={isLastChapter}
              className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-25 disabled:cursor-not-allowed dark:hover:text-indigo-400 transition-colors"
              title={isVi ? 'Chuyển chương xuống sau' : 'Move chapter down'}
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {!isExpanded && (
          <button
            type="button"
            onClick={onAddLesson}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isVi ? 'Thêm Video' : 'Add Video'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>
              <span className="hidden sm:inline">{isVi ? 'Thu gọn' : 'Collapse'}</span>
              <ChevronUp className="w-4 h-4 text-slate-500" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">{isVi ? 'Mở rộng' : 'Expand'}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onRemoveModule}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          title={isVi ? `Xóa Chương ${moduleIndex + 1}` : 'Delete chapter'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
