/**
 * @file custom.select.tsx
 * @description Component giao diện CustomSelect phục vụ khu vực Quản trị Admin
 */

import { useState, useRef, useEffect, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Check, Search } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  badge?: string
  badgeClass?: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface CustomSelectProps {
  value: string
  onChange: (val: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showSearch?: boolean
  searchPlaceholder?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
  size = 'md',
  showSearch,
  searchPlaceholder,
}: CustomSelectProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const defaultPlaceholder = placeholder ?? (isVi ? 'Chọn...' : 'Select...')
  const defaultSearchPlaceholder = searchPlaceholder ?? (isVi ? 'Tìm kiếm...' : 'Search...')

  const [isOpen, setIsOpen] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const [alignRight, setAlignRight] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const selectedOption = options.find((opt) => opt.value === value)
  const enableSearch = showSearch ?? options.length >= 8

  const calculatePosition = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const estimatedHeight = Math.min(Math.max(options.length * 40 + 40, 120), 280)

    setPlacement(spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? 'top' : 'bottom')
    setAlignRight(rect.left + 240 > window.innerWidth)
  }

  const handleToggle = () => {
    if (disabled) return
    if (!isOpen) {
      calculatePosition()
      setSearchTerm('')
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && enableSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen, enableSearch])

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    const query = searchTerm.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(query))
  }, [options, searchTerm])

  const sizeClasses = {
    sm: 'h-8 px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
    md: 'h-11 px-3.5 py-2.5 text-xs rounded-xl gap-2',
    lg: 'h-12 px-4 py-2.5 text-sm rounded-2xl gap-2.5',
  }

  const hasWidthClass = className && /\bw-\S+/.test(className)

  return (
    <div
      ref={containerRef}
      className={`relative ${hasWidthClass ? '' : 'w-full'} ${className}`}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full ${sizeClasses[size]} border font-semibold flex items-center justify-between transition-all duration-200 cursor-pointer select-none text-left shadow-2xs ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900 dark:border-indigo-400 shadow-md'
            : 'border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {selectedOption.icon}
            </span>
          )}
          <span
            className={`truncate ${
              selectedOption
                ? 'text-slate-900 dark:text-slate-100 font-medium'
                : 'text-slate-400 dark:text-slate-500 font-normal'
            }`}
          >
            {selectedOption ? selectedOption.label : defaultPlaceholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                selectedOption.badgeClass ||
                'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-700/60'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${alignRight ? 'right-0' : 'left-0'} ${
            placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-50 min-w-full w-max max-w-[min(380px,calc(100vw-32px))] rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/70 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150`}
        >
          {enableSearch && (
            <div className="relative mb-1 px-1 pt-0.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={defaultSearchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7.5 pr-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value)
                        setIsOpen(false)
                      }
                    }}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-700/60 shadow-2xs'
                        : 'text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800/80 dark:hover:text-white'
                    } ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {option.icon && (
                        <span
                          className={`shrink-0 ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-slate-400'
                          }`}
                        >
                          {option.icon}
                        </span>
                      )}
                      <span className="whitespace-nowrap">{option.label}</span>
                      {option.badge && (
                        <span
                          className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            option.badgeClass ||
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 font-bold" />
                    )}
                  </button>
                )
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                {isVi ? 'Không có tùy chọn phù hợp' : 'No matching options'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
