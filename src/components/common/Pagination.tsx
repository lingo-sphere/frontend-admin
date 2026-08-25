// Updated: 2026-08-22
// Pagination component - đồng bộ UI với Ant Design Pro Table

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

  const getShowingText = () => {
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalItems)
    return `${start} - ${end} / ${totalItems}`
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const delta = 2

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    if (currentPage - delta > 2) {
      pages.push('ellipsis')
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage + delta < totalPages - 1) {
      pages.push('ellipsis')
    }

    // Always show last page
    pages.push(totalPages)

    return pages
  }

  return (
    <div className="ant-pagination">
      {showTotal && (
        <div className="ant-pagination-total-text">
          Tổng <strong>{totalItems}</strong> mục
        </div>
      )}

      {onPageSizeChange && (
        <div className="ant-pagination-options">
          <div className="ant-pagination-options-size-changer ant-select">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="ant-select-selector"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="ant-pagination-options">
        <div className="ant-pagination-options-quick-jumper">
          Đến
          <input
            type="text"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={handleJump}
            className="ant-input"
          />
          <button type="button" onClick={() => handleJump({ key: 'Enter' } as React.KeyboardEvent)}>
            OK
          </button>
        </div>
      </div>

      <ul className="ant-pagination-list">
        <li
          className={`ant-pagination-item ant-pagination-item-prev${currentPage === 1 ? ' ant-pagination-item-disabled' : ''}`}
          onClick={() => currentPage > 1 && onPageChange(1)}
        >
          <ChevronsLeft />
        </li>
        <li
          className={`ant-pagination-item ant-pagination-item-prev${currentPage === 1 ? ' ant-pagination-item-disabled' : ''}`}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </li>

        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} className="ant-pagination-item ant-pagination-item-ellipsis">
              •••
            </li>
          ) : (
            <li
              key={page}
              className={`ant-pagination-item${currentPage === page ? ' ant-pagination-item-active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </li>
          )
        )}

        <li
          className={`ant-pagination-item ant-pagination-item-next${currentPage === totalPages ? ' ant-pagination-item-disabled' : ''}`}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        >
          <ChevronRight />
        </li>
        <li
          className={`ant-pagination-item ant-pagination-item-next${currentPage === totalPages ? ' ant-pagination-item-disabled' : ''}`}
          onClick={() => currentPage < totalPages && onPageChange(totalPages)}
        >
          <ChevronsRight />
        </li>
      </ul>
    </div>
  )
}
