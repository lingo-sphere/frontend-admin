/**
 * @file Pagination.tsx
 * @description Component giao diện Pagination phục vụ khu vực Quản trị Admin
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  totalItems?: number
  showTotal?: boolean
  goToText?: string
  pageText?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  totalItems,
  showTotal = false,
  goToText,
  pageText,
}: PaginationProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [jumpValue, setJumpValue] = useState('')

  const safeTotalPages = Math.max(1, totalPages)
  const defaultGoTo = goToText ?? (isVi ? 'Đến' : 'Go to')
  const defaultPage = pageText ?? (isVi ? 'Trang' : 'Page')

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && jumpValue) {
      const page = parseInt(jumpValue, 10)
      if (!isNaN(page) && page >= 1 && page <= safeTotalPages) {
        onPageChange(page)
      }
      setJumpValue('')
    }
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const delta = 2

    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (currentPage - delta > 2) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - delta)
    const end = Math.min(safeTotalPages - 1, currentPage + delta)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage + delta < safeTotalPages - 1) {
      pages.push('ellipsis')
    }

    pages.push(safeTotalPages)

    return pages
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 py-3 text-[13px] text-slate-600 dark:text-slate-300 select-none">
      {showTotal && totalItems !== undefined && (
        <div className="mr-auto text-xs text-slate-500 dark:text-slate-400">
          Hiển thị <strong>{totalItems}</strong> bản ghi
        </div>
      )}

      {}
      <ul className="flex items-center gap-1.5 list-none p-0 m-0">
        {}
        <li
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer ${
            currentPage <= 1
              ? 'opacity-35 pointer-events-none text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900/50'
              : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
        </li>

        {}
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <li
              key={`ellipsis-${index}`}
              className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs tracking-widest"
            >
              •••
            </li>
          ) : (
            <li
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-md text-[13px] transition-all cursor-pointer ${
                currentPage === page
                  ? 'border border-blue-500 dark:border-blue-500 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                  : 'border border-transparent bg-transparent text-slate-700 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {page}
            </li>
          )
        )}

        {}
        <li
          onClick={() => currentPage < safeTotalPages && onPageChange(currentPage + 1)}
          className={`w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer ${
            currentPage >= safeTotalPages
              ? 'opacity-35 pointer-events-none text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900/50'
              : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4 stroke-[1.75]" />
        </li>
      </ul>

      {onPageSizeChange && (
        <div className="w-28 shrink-0">
          <CustomSelect
            size="sm"
            value={String(pageSize)}
            onChange={(val) => onPageSizeChange(parseInt(val, 10))}
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: isVi ? `${size} / trang` : `${size} / page`,
            }))}
            className="w-full"
          />
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 shrink-0">
        <span>{defaultGoTo}</span>
        <input
          type="text"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={handleJump}
          className="w-11 h-8 px-1.5 text-center rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
        />
        <span>{defaultPage}</span>
      </div>
    </div>
  )
}

