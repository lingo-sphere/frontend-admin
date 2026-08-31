import { Search, X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface VocabularyFilterBarProps {
  searchWord: string
  onSearchChange: (val: string) => void
  filterLevel: string
  onLevelChange: (val: string) => void
}

const levelOptions = [
  { value: 'ALL', label: 'Tất cả trình độ CEFR' },
  { value: 'A1', label: 'A1 - Sơ cấp cơ bản', badge: 'A1', badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { value: 'A2', label: 'A2 - Sơ cấp nâng cao', badge: 'A2', badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
  { value: 'B1', label: 'B1 - Trung cấp', badge: 'B1', badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
  { value: 'B2', label: 'B2 - Trung cấp cao', badge: 'B2', badgeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
  { value: 'C1', label: 'C1 - Cao cấp', badge: 'C1', badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' },
  { value: 'C2', label: 'C2 - Thành thạo', badge: 'C2', badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' },
]

export function VocabularyFilterBar({
  searchWord,
  onSearchChange,
  filterLevel,
  onLevelChange,
}: VocabularyFilterBarProps) {
  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchWord}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm từ vựng, từ loại..."
          className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
        />
        {searchWord && (
          <button
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <CustomSelect
        value={filterLevel}
        onChange={onLevelChange}
        options={levelOptions}
        className="w-56"
      />
    </>
  )
}
