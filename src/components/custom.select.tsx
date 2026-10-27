// Component CustomSelect chuẩn hóa cho toàn bộ LingoSphere Admin.

import { useState, useRef, useEffect, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Check, Search, X, Loader2 } from 'lucide-react'

export interface SelectOption {
  value?: string | number
  label?: React.ReactNode
  badge?: string
  badgeClass?: string
  icon?: React.ReactNode
  disabled?: boolean
  options?: SelectOption[]
}

export interface CustomSelectProps {
  id?: string
  value?: React.Key | React.Key[] | (string | number)[] | string | number
  defaultValue?: React.Key | React.Key[] | (string | number)[] | string | number
  onChange?: (val: any) => void
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  allowClear?: boolean
  className?: string
  style?: React.CSSProperties
  size?: 'sm' | 'md' | 'lg'
  showSearch?: boolean
  searchPlaceholder?: string
  mode?: 'single' | 'multiple' | 'tags'
  multiple?: boolean
  status?: 'error' | 'warning'
  searchValue?: string
  onSearch?: (search: string) => void
  onBlur?: () => void
  filterOption?: boolean | ((inputValue: string, option?: SelectOption) => boolean)
  notFoundContent?: React.ReactNode
  optionFilterProp?: string
  maxCount?: number
  labelRender?: (props: { value: any; label: React.ReactNode }) => React.ReactNode
  maxTagCount?: number
}

export function CustomSelect({
  id: propId,
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  loading = false,
  allowClear = false,
  className = '',
  style,
  size = 'md',
  showSearch,
  searchPlaceholder,
  mode = 'single',
  multiple = false,
  status,
  searchValue,
  onSearch,
  onBlur,
  filterOption,
  notFoundContent,
  maxCount,
  labelRender,
  maxTagCount,
}: CustomSelectProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const defaultPlaceholder = placeholder ?? (isVi ? 'Chọn...' : 'Select...')
  const defaultSearchPlaceholder = searchPlaceholder ?? (isVi ? 'Tìm kiếm...' : 'Search...')

  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')
  const [alignRight, setAlignRight] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const generatedId = useId()
  const selectId = propId || generatedId

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      const frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
      return () => cancelAnimationFrame(frameId)
    } else {
      setVisible(false)
      const timer = setTimeout(() => {
        setMounted(false)
      }, 190)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const isMultiple = mode === 'multiple' || multiple === true

  const selectedValues = useMemo(() => {
    if (isMultiple) {
      if (Array.isArray(value)) return value
      if (value !== undefined && value !== null && value !== '') return [value]
      if (Array.isArray(defaultValue)) return defaultValue
      return []
    }
    return []
  }, [isMultiple, value, defaultValue])

  const singleValue = useMemo(() => {
    if (!isMultiple) {
      if (value !== undefined && value !== null) return value
      if (defaultValue !== undefined && defaultValue !== null) return defaultValue
    }
    return ''
  }, [isMultiple, value, defaultValue])

  const flatOptions = useMemo(() => {
    const list: SelectOption[] = []
    const traverse = (items: SelectOption[]) => {
      for (const item of items) {
        if (item.options && Array.isArray(item.options)) {
          traverse(item.options)
        }
        if (item.value !== undefined) {
          list.push(item)
        }
      }
    }
    traverse(options)
    return list
  }, [options])

  const selectedSingleOption = useMemo(() => {
    return flatOptions.find((opt) => opt.value !== undefined && String(opt.value) === String(singleValue))
  }, [flatOptions, singleValue])

  const enableSearch = showSearch ?? (flatOptions.length >= 8)

  const calculatePosition = () => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const estimatedHeight = Math.min(Math.max(flatOptions.length * 40 + 40, 120), 280)

    setPlacement(spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? 'top' : 'bottom')
    setAlignRight(rect.left + 240 > window.innerWidth)
  }

  const handleToggle = () => {
    if (disabled || loading) return
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

  const currentSearchTerm = searchValue !== undefined ? searchValue : searchTerm

  const filteredOptions = useMemo(() => {
    if (filterOption === false) return options
    const query = currentSearchTerm.toLowerCase()
    if (!query) return options

    return options.reduce<SelectOption[]>((acc, opt) => {
      if (opt.options && Array.isArray(opt.options)) {
        const matchingChildren = opt.options.filter((child) => {
          if (typeof filterOption === 'function') {
            return filterOption(currentSearchTerm, child)
          }
          const labelStr = typeof child.label === 'string' ? child.label : String(child.value)
          return labelStr.toLowerCase().includes(query)
        })
        if (matchingChildren.length > 0) {
          acc.push({ ...opt, options: matchingChildren })
        }
      } else {
        if (typeof filterOption === 'function') {
          if (filterOption(currentSearchTerm, opt)) {
            acc.push(opt)
          }
        } else {
          const labelStr = typeof opt.label === 'string' ? opt.label : String(opt.value)
          if (labelStr.toLowerCase().includes(query)) {
            acc.push(opt)
          }
        }
      }
      return acc
    }, [])
  }, [options, currentSearchTerm, filterOption])

  const hasSelectedValue = isMultiple
    ? selectedValues.length > 0
    : singleValue !== '' && singleValue !== undefined && singleValue !== null

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMultiple) {
      onChange?.([])
    } else {
      onChange?.('')
    }
  }

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return

    if (isMultiple) {
      const exists = selectedValues.some((v) => String(v) === String(option.value))
      if (!exists && maxCount && selectedValues.length >= maxCount) return
      const nextValues = exists
        ? selectedValues.filter((v) => String(v) !== String(option.value))
        : [...selectedValues, option.value]
      onChange?.(nextValues)
    } else {
      onChange?.(option.value)
      setIsOpen(false)
    }
  }

  const renderTriggerLabel = () => {
    if (labelRender) {
      return labelRender({ value, label: selectedSingleOption?.label })
    }
    if (isMultiple) {
      if (selectedValues.length === 0) {
        return (
          <span className="truncate text-slate-400 dark:text-slate-500 font-normal">
            {defaultPlaceholder}
          </span>
        )
      }

      const visibleValues = maxTagCount !== undefined && maxTagCount > 0
        ? selectedValues.slice(0, maxTagCount)
        : selectedValues
      const hiddenCount = selectedValues.length - visibleValues.length

      return (
        <>
          {visibleValues.map((val) => {
            const match = flatOptions.find((opt) => opt.value !== undefined && String(opt.value) === String(val))
            let labelText: React.ReactNode = match?.label
            if (!labelText) {
              if (loading) {
                labelText = isVi ? 'Đang tải...' : 'Loading...'
              } else {
                const strVal = String(val)
                if (/^[0-9a-fA-F]{24}$/.test(strVal)) {
                  labelText = defaultPlaceholder || (isVi ? 'Chủ đề' : 'Context')
                } else {
                  labelText = strVal
                }
              }
            }

            return (
              <span
                key={String(val)}
                className={`inline-flex items-center max-w-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs group/chip transition-colors ${chipSizeClasses[size]}`}
              >
                {match?.icon && <span className="shrink-0 text-slate-500 dark:text-slate-400">{match.icon}</span>}
                <span
                  className="truncate min-w-0 max-w-[160px] leading-tight"
                  title={typeof labelText === 'string' ? labelText : undefined}
                >
                  {labelText}
                </span>
                {!disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Xóa ${typeof labelText === 'string' ? labelText : String(val)}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      const nextValues = selectedValues.filter((v) => String(v) !== String(val))
                      onChange?.(nextValues)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        const nextValues = selectedValues.filter((v) => String(v) !== String(val))
                        onChange?.(nextValues)
                      }
                    }}
                    className="p-0.5 -mr-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-2.5 h-2.5" />
                  </span>
                )}
              </span>
            )
          })}
          {hiddenCount > 0 && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-700/60 shadow-2xs">
              +{hiddenCount}
            </span>
          )}
        </>
      )
    }

    if (selectedSingleOption) {
      return (
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {selectedSingleOption.icon && (
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {selectedSingleOption.icon}
            </span>
          )}
          <span className="truncate text-slate-900 dark:text-slate-100 font-medium">
            {selectedSingleOption.label ?? String(selectedSingleOption.value)}
          </span>
          {selectedSingleOption.badge && (
            <span
              className={`shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                selectedSingleOption.badgeClass ||
                'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-700/60'
              }`}
            >
              {selectedSingleOption.badge}
            </span>
          )}
        </div>
      )
    }

    if (singleValue !== '' && singleValue !== undefined && singleValue !== null) {
      const strVal = String(singleValue)
      if (loading) {
        return (
          <span className="truncate text-slate-400 dark:text-slate-500 font-normal">
            {isVi ? 'Đang tải...' : 'Loading...'}
          </span>
        )
      }
      if (/^[0-9a-fA-F]{24}$/.test(strVal)) {
        return (
          <span className="truncate text-slate-400 dark:text-slate-500 font-normal">
            {defaultPlaceholder}
          </span>
        )
      }
      return (
        <span className="truncate text-slate-900 dark:text-slate-100 font-medium">
          {strVal}
        </span>
      )
    }

    return (
      <span className="truncate text-slate-400 dark:text-slate-500 font-normal">
        {defaultPlaceholder}
      </span>
    )
  }

  const renderOptionItem = (option: SelectOption) => {
    const isSelected = option.value !== undefined && (isMultiple
      ? selectedValues.some((v) => String(v) === String(option.value))
      : String(singleValue) === String(option.value))

    return (
      <button
        key={String(option.value)}
        type="button"
        disabled={option.disabled}
        onClick={() => handleOptionSelect(option)}
        className={`group w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-colors duration-150 cursor-pointer text-left border ${
          isSelected
            ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border-indigo-200/70 dark:border-indigo-800/60 shadow-2xs'
            : 'border-transparent text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/80 dark:hover:text-white'
        } ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isMultiple ? (
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ease-out ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-600'
              }`}
            >
              <Check
                className={`w-3 h-3 stroke-[3] transition-all duration-200 ease-out transform ${
                  isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              />
            </div>
          ) : null}

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
          <span className="truncate">{option.label ?? String(option.value)}</span>
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

        {!isMultiple && isSelected && (
          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 font-bold" />
        )}
      </button>
    )
  }

  const chipSizeClasses = {
    sm: 'px-1.5 py-0.5 rounded-md text-[10px] gap-1',
    md: 'px-2 py-0.5 rounded-lg text-[11px] gap-1',
    lg: 'px-2.5 py-1 rounded-lg text-xs gap-1.5',
  }

  const sizeClasses = {
    sm: 'min-h-[32px] h-auto px-2 py-1 text-[11px] rounded-lg gap-1.5',
    md: 'min-h-[40px] h-auto px-2.5 py-1.5 text-xs rounded-xl gap-2',
    lg: 'min-h-[48px] h-auto px-3.5 py-2 text-sm rounded-2xl gap-2.5',
  }

  const hasExplicitWidth = Boolean(
    (className && /\b(w|min-w|max-w)-\S+/.test(className)) ||
    (style && (style.width !== undefined || style.minWidth !== undefined))
  )

  return (
    <div
      ref={containerRef}
      style={style}
      className={`relative ${hasExplicitWidth ? 'shrink-0' : 'w-full'} ${className}`}
    >
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full ${sizeClasses[size]} border font-semibold flex items-center justify-between transition-all duration-200 cursor-pointer select-none text-left shadow-2xs ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-900 dark:border-indigo-400 shadow-md'
            : status === 'error'
            ? 'border-rose-400 ring-2 ring-rose-500/10 bg-white dark:bg-slate-900'
            : 'border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div
          className={`min-w-0 flex-1 ${
            isMultiple && selectedValues.length > 0
              ? 'flex flex-wrap items-center gap-1.5 py-0.5'
              : 'flex items-center gap-1.5 truncate'
          }`}
        >
          {renderTriggerLabel()}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1.5 self-center">
          {allowClear && !disabled && hasSelectedValue && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </span>
          )}

          {loading ? (
            <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
          ) : (
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 shrink-0 transition-transform duration-250 ease-out ${
                isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
              }`}
            />
          )}
        </div>
      </button>

      {mounted && (
        <div
          className={`absolute ${alignRight ? 'right-0' : 'left-0'} ${
            placement === 'top' ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
          } z-50 min-w-[max(100%,148px)] w-max max-w-[min(420px,calc(100vw-32px))] rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/70 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xl transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            visible
              ? 'opacity-100 scale-100 translate-y-0'
              : `opacity-0 scale-[0.98] pointer-events-none ${placement === 'top' ? 'translate-y-1' : '-translate-y-1'}`
          }`}
        >
          {enableSearch && (
            <div className="relative mb-1 px-1 pt-0.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={defaultSearchPlaceholder}
                value={currentSearchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  onSearch?.(e.target.value)
                }}
                onBlur={onBlur}
                className="w-full pl-7.5 pr-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, idx) => {
                if (item.options && Array.isArray(item.options)) {
                  if (item.options.length === 0) return null
                  return (
                    <div key={`group-${idx}`} className="space-y-0.5 pt-1 first:pt-0">
                      <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                        <span>{item.label}</span>
                      </div>
                      {item.options.map((opt) => renderOptionItem(opt))}
                    </div>
                  )
                }
                return renderOptionItem(item)
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                {notFoundContent ?? (isVi ? 'Không có tùy chọn phù hợp' : 'No matching options')}
              </div>
            )}
          </div>

          {isMultiple && selectedValues.length > 0 && (
            <div className="flex items-center justify-between px-2.5 py-1.5 mt-1 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] transition-all duration-150">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {isVi ? 'Đã chọn' : 'Selected'}:{' '}
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {selectedValues.length}
                </strong>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.([])
                }}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                {isVi ? 'Bỏ chọn' : 'Clear all'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
