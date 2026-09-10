/**
 * @file global.search.result.item.tsx
 * @description Thành phần hiển thị từng kết quả tìm kiếm trong GlobalSearchModal
 */

import { ArrowRight } from 'lucide-react'
import type { NavSearchItem } from '@/layouts/global.search.config'

interface LocalizedSearchItem extends NavSearchItem {
  title: string
  subtitle: string
}

interface GlobalSearchResultItemProps {
  item: LocalizedSearchItem
  isSelected: boolean
  isVi: boolean
  onSelect: () => void
  onMouseEnter: () => void
}

export function GlobalSearchResultItem({
  item,
  isSelected,
  isVi,
  onSelect,
  onMouseEnter,
}: GlobalSearchResultItemProps) {
  const Icon = item.icon

  return (
    <div
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isSelected
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
            {item.title}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {item.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
          {item.category === 'ACTION'
            ? isVi
              ? 'Thao tác'
              : 'Action'
            : isVi
            ? 'Điều hướng'
            : 'Navigate'}
        </span>
        <ArrowRight
          className={`w-4 h-4 transition-transform ${
            isSelected
              ? 'translate-x-0.5 text-indigo-600 dark:text-indigo-400'
              : 'opacity-0'
          }`}
        />
      </div>
    </div>
  )
}
