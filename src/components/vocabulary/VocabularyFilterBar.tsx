import { Search, X } from 'lucide-react'

interface VocabularyFilterBarProps {
  searchWord: string
  onSearchChange: (val: string) => void
  filterLevel: string
  onLevelChange: (val: string) => void
}

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

      <select
        value={filterLevel}
        onChange={(e) => onLevelChange(e.target.value)}
        className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
      >
        <option value="ALL">Tất cả trình độ CEFR</option>
        <option value="A1">A1 - Sơ cấp cơ bản</option>
        <option value="A2">A2 - Sơ cấp nâng cao</option>
        <option value="B1">B1 - Trung cấp</option>
        <option value="B2">B2 - Trung cấp cao</option>
        <option value="C1">C1 - Cao cấp</option>
        <option value="C2">C2 - Thành thạo</option>
      </select>
    </>
  )
}
