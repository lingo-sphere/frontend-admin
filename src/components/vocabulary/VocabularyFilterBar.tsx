import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

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
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const levelOptions = useMemo(() => [
    { value: 'ALL', label: isVi ? 'Tất cả trình độ CEFR' : 'All CEFR Levels' },
    { value: 'A1', label: isVi ? 'A1 - Sơ cấp cơ bản' : 'A1 - Beginner' },
    { value: 'A2', label: isVi ? 'A2 - Sơ cấp nâng cao' : 'A2 - Elementary' },
    { value: 'B1', label: isVi ? 'B1 - Trung cấp' : 'B1 - Intermediate' },
    { value: 'B2', label: isVi ? 'B2 - Trung cấp cao' : 'B2 - Upper Intermediate' },
    { value: 'C1', label: isVi ? 'C1 - Cao cấp' : 'C1 - Advanced' },
    { value: 'C2', label: isVi ? 'C2 - Thành thạo' : 'C2 - Mastery' },
  ], [isVi])

  return (
    <>
      <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={searchWord}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={isVi ? 'Tìm từ vựng, từ loại...' : 'Search words, parts of speech...'}
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
