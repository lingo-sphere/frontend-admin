/**
 * @file course.curriculum.outline.tsx
 * @description Thanh điều hướng nhanh đến từng chương học trong cây chương trình
 */

import { Compass } from 'lucide-react'
import type { CourseModule } from '@/features/courses/components/course.basic.info.tab'

interface CourseCurriculumOutlineProps {
  isVi: boolean
  modules: CourseModule[]
  expandedModules: string[]
  onScrollToChapter: (moduleId: string) => void
}

export function CourseCurriculumOutline({
  isVi,
  modules,
  expandedModules,
  onScrollToChapter,
}: CourseCurriculumOutlineProps) {
  if (modules.length < 2) return null

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
        <Compass className="w-3.5 h-3.5" />
        <span>{isVi ? 'Danh mục nhanh:' : 'Outline:'}</span>
      </span>
      <div className="flex items-center gap-1.5">
        {modules.map((mod, idx) => {
          const isCurrentExpanded = expandedModules.includes(mod.id)
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onScrollToChapter(mod.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isCurrentExpanded
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span>Chương {idx + 1}</span>
              {mod.title && (
                <span className="max-w-[120px] truncate font-medium text-[11px] opacity-90">
                  : {mod.title}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
