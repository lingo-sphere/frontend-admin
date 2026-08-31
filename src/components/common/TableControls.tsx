import { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SlidersHorizontal,
  Columns,
  Check,
  RotateCcw,
  LayoutGrid,
  List,
  ChevronDown,
  Layers,
} from 'lucide-react'

export type TableDensity = 'compact' | 'middle' | 'comfortable'

export interface ColumnOption {
  key: string
  label: string
  visible: boolean
}

interface TableControlsProps {
  density: TableDensity
  onDensityChange: (density: TableDensity) => void
  columns?: ColumnOption[]
  onColumnsChange?: (columns: ColumnOption[]) => void
  viewMode?: 'table' | 'grid'
  onViewModeChange?: (mode: 'table' | 'grid') => void
  onResetFilters?: () => void
  totalCount?: number
}

export function TableControls({
  density,
  onDensityChange,
  columns,
  onColumnsChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalCount,
}: TableControlsProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [showDensityDropdown, setShowDensityDropdown] = useState(false)
  const [showColumnDropdown, setShowColumnDropdown] = useState(false)

  const densityRef = useRef<HTMLDivElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (densityRef.current && !densityRef.current.contains(event.target as Node)) {
        setShowDensityDropdown(false)
      }
      if (columnRef.current && !columnRef.current.contains(event.target as Node)) {
        setShowColumnDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleColumnVisibility = (key: string) => {
    if (!columns || !onColumnsChange) return
    const updated = columns.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col
    )
    onColumnsChange(updated)
  }

  const resetColumns = () => {
    if (!columns || !onColumnsChange) return
    const reset = columns.map((col) => ({ ...col, visible: true }))
    onColumnsChange(reset)
  }

  const visibleColumnCount = columns ? columns.filter((c) => c.visible).length : 0

  const densityOptions = useMemo(() => [
    { key: 'compact', label: isVi ? 'Nhỏ gọn' : 'Compact' },
    { key: 'middle', label: isVi ? 'Vừa' : 'Default' },
    { key: 'comfortable', label: isVi ? 'Thoải mái' : 'Spacious' },
  ] as const, [isVi])

  return (
    <div className="flex items-center gap-2">

      {viewMode && onViewModeChange && (
        <div className="flex items-center p-0.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isVi ? 'Dạng lưới thẻ' : 'Grid View'}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isVi ? 'Dạng danh sách bảng' : 'Table View'}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative" ref={densityRef}>
        <button
          type="button"
          onClick={() => setShowDensityDropdown(!showDensityDropdown)}
          className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            showDensityDropdown
              ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
          title={isVi ? 'Kích thước dòng bảng' : 'Row Density'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>
            {density === 'compact'
              ? (isVi ? 'Nhỏ gọn' : 'Compact')
              : density === 'comfortable'
              ? (isVi ? 'Thoải mái' : 'Spacious')
              : (isVi ? 'Vừa' : 'Default')}
          </span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {showDensityDropdown && (
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {isVi ? 'Kích thước bảng' : 'Density'}
            </div>
            {densityOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onDensityChange(opt.key)
                  setShowDensityDropdown(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                  density === opt.key
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{opt.label}</span>
                {density === opt.key && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {columns && onColumnsChange && (
        <div className="relative" ref={columnRef}>
          <button
            type="button"
            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showColumnDropdown
                ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Cài đặt hiển thị cột bảng"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Cột</span>
            {visibleColumnCount < columns.length && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px]">
                {visibleColumnCount}/{columns.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showColumnDropdown && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Hiển thị cột ({visibleColumnCount}/{columns.length})
                </span>
                <button
                  type="button"
                  onClick={resetColumns}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Hiện tất cả
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={col.visible}
                        onChange={() => toggleColumnVisibility(col.key)}
                        className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {col.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Đặt lại bộ lọc về mặc định"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Đặt lại</span>
        </button>
      )}
    </div>
  )
}
