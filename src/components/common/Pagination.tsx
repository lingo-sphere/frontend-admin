import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  totalItems: number
  showTotal?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  totalItems,
  showTotal = true,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('')

  if (totalPages <= 0) return null

  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && jumpValue) {
      const page = parseInt(jumpValue)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page)
      }
      setJumpValue('')
    }
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const delta = 2

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (currentPage - delta > 2) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage + delta < totalPages - 1) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)

    return pages
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-2 text-xs text-slate-400">
      {showTotal && (
        <div className="text-slate-400 font-medium">
          Tổng cộng <span className="font-bold text-slate-200">{totalItems}</span> bản ghi
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
            className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1.5">
          <span>Đến</span>
          <input
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={handleJump}
            className="w-12 h-8 px-2 text-center rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <ul className="flex items-center gap-1">
          <li
            className={`w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 1
                ? 'opacity-40 pointer-events-none text-slate-600 bg-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900'
            }`}
            onClick={() => currentPage > 1 && onPageChange(1)}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </li>
          <li
            className={`w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === 1
                ? 'opacity-40 pointer-events-none text-slate-600 bg-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900'
            }`}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </li>

          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <li
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-slate-500 font-bold"
              >
                •••
              </li>
            ) : (
              <li
                key={page}
                className={`w-8 h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </li>
            )
          )}

          <li
            className={`w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === totalPages
                ? 'opacity-40 pointer-events-none text-slate-600 bg-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900'
            }`}
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li
            className={`w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center transition-colors cursor-pointer ${
              currentPage === totalPages
                ? 'opacity-40 pointer-events-none text-slate-600 bg-slate-950'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900'
            }`}
            onClick={() => currentPage < totalPages && onPageChange(totalPages)}
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </li>
        </ul>
      </div>
    </div>
  )
}
