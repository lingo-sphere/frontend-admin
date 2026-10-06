// Bộ lọc tìm kiếm và phân loại đề thi TOEIC cho bảng danh sách đề thi.

import { Search, Headphones, Sparkles, LayoutGrid } from 'lucide-react'

interface ExamTableFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedSkill?: string
  onSkillChange?: (val: string) => void
  isVi: boolean
}

export function ExamTableFilters({
  searchQuery,
  onSearchChange,
  selectedSkill = 'ALL',
  onSkillChange,
  isVi,
}: ExamTableFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          placeholder={isVi ? 'Tìm kiếm đề thi theo tên hoặc mã...' : 'Search exams by title or code...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {onSkillChange && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onSkillChange('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedSkill === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{isVi ? 'Tất cả kỹ năng' : 'All Skills'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSkillChange('2SKILLS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedSkill === '2SKILLS'
                ? 'bg-blue-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isVi ? '2 Kỹ Năng (LR)' : '2 Skills (LR)'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSkillChange('4SKILLS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedSkill === '4SKILLS'
                ? 'bg-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isVi ? '4 Kỹ Năng (LRSW)' : '4 Skills (LRSW)'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
