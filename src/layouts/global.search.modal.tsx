// Modal tìm kiếm nhanh toàn cục các trang quản trị, tính năng và thao tác hệ thống.

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { navItemToPath } from '@/routes/navigation'
import { NAVIGATION_INDEX } from '@/layouts/global.search.config'
import { GlobalSearchResultItem } from '@/layouts/global.search.result.item'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const localizedItems = useMemo(() => {
    return NAVIGATION_INDEX.map((item) => ({
      ...item,
      title: isVi ? item.titleVi : item.titleEn,
      subtitle: isVi ? item.subtitleVi : item.subtitleEn,
    }))
  }, [isVi])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return localizedItems
    const q = query.toLowerCase().trim()
    return localizedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    )
  }, [localizedItems, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems.length])

  const handleSelect = (navTarget: string) => {
    navigate(navItemToPath(navTarget))
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].navTarget)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isVi
                ? 'Tìm nhanh trang, tính năng, học viên, khóa học... (Gõ phím để tìm)'
                : 'Quick search pages, features, learners, courses... (Type to search)'
            }
            className="w-full bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
          />
          <div className="flex items-center gap-1 shrink-0">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title={isVi ? 'Xóa tìm kiếm' : 'Clear search'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isVi ? 'Đóng' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <p className="text-sm font-semibold">
                {isVi ? 'Không tìm thấy kết quả phù hợp' : 'No matching results found'}
              </p>
              <p className="text-xs">
                {isVi
                  ? 'Thử tìm với từ khóa khác như "Khóa học", "Từ vựng", "Học viên"...'
                  : 'Try searching with other keywords like "Courses", "Vocabulary", "Learners"...'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <GlobalSearchResultItem
                key={item.id}
                item={item}
                isSelected={index === selectedIndex}
                isVi={isVi}
                onSelect={() => handleSelect(item.navTarget)}
                onMouseEnter={() => setSelectedIndex(index)}
              />
            ))
          )}
        </div>

        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↓
              </kbd>{' '}
              {isVi ? 'để chuyển' : 'to navigate'}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              {isVi ? 'để chọn' : 'to select'}
            </span>
          </div>
          <span>
            {isVi ? 'Tìm kiếm toàn cục LingoSphere' : 'LingoSphere Global Search'}
          </span>
        </div>
      </div>
    </div>
  )
}
