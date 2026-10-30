// Bảng hiển thị luồng sự kiện học tập thời gian thực từ PostHog telemetry stream.

import React, { useState } from 'react'
import {
  Sparkles,
  Search,
  Loader2,
  GraduationCap,
  BookOpen,
  Brain,
  Headphones,
  SlidersHorizontal,
  Columns3,
  ChevronDown,
  RotateCcw,
  X,
} from 'lucide-react'
import { Dropdown, Checkbox } from 'antd'
import type { PostHogLiveEventItem } from '@/types/api.types'
import { Pagination } from '@/components/pagination'

interface PostHogLiveEventsTableProps {
  liveEvents: PostHogLiveEventItem[]
  isLoading: boolean
  totalEvents: number
  currentPage: number
  totalPages: number
  currentLimit: number
  searchInput: string
  onSearchInputChange: (val: string) => void
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSearchClear: () => void
  onPageChange: (page: number) => void
  onPageSizeChange: (limit: number) => void
  isVi: boolean
}

const DENSITY_LABELS: Record<'compact' | 'normal' | 'comfortable', string> = {
  compact: 'Gọn',
  normal: 'Vừa',
  comfortable: 'Rộng',
}

const DENSITY_PADDING: Record<'compact' | 'normal' | 'comfortable', string> = {
  compact: 'py-2 px-3.5',
  normal: 'py-3 px-3.5',
  comfortable: 'py-4 px-3.5',
}

export function PostHogLiveEventsTable({
  liveEvents,
  isLoading,
  totalEvents,
  currentPage,
  totalPages,
  currentLimit,
  searchInput,
  onSearchInputChange,
  onSearchKeyDown,
  onSearchClear,
  onPageChange,
  onPageSizeChange,
  isVi,
}: PostHogLiveEventsTableProps) {
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal')
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'event',
    'user',
    'properties',
    'timestamp',
  ])

  const columnOptions = [
    { label: isVi ? 'Loại sự kiện' : 'Event', value: 'event' },
    { label: isVi ? 'Học viên' : 'User', value: 'user' },
    { label: isVi ? 'Dữ liệu thu thập' : 'Properties', value: 'properties' },
    { label: isVi ? 'Thời gian' : 'Timestamp', value: 'timestamp' },
  ]

  const getEventBadge = (eventName: string) => {
    switch (eventName) {
      case 'exam_submitted':
        return {
          icon: GraduationCap,
          label: isVi ? 'Thi TOEIC' : 'TOEIC Exam',
          color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        }
      case 'vocab_session_completed':
        return {
          icon: BookOpen,
          label: isVi ? 'Từ Vựng SRS' : 'SRS Vocab',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        }
      case 'ai_tutor_asked':
        return {
          icon: Brain,
          label: isVi ? 'Gia Sư AI' : 'AI Tutor',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        }
      case 'dictation_completed':
        return {
          icon: Headphones,
          label: isVi ? 'Luyện Nghe' : 'Dictation',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        }
      default:
        return {
          icon: Sparkles,
          label: eventName,
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        }
    }
  }

  const paddingClass = DENSITY_PADDING[density]

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-80 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={isVi ? 'Gõ tìm kiếm & ấn Enter...' : 'Search events & press Enter...'}
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchInput && (
              <button
                type="button"
                onClick={onSearchClear}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'compact', label: 'Gọn' },
                { key: 'normal', label: 'Vừa' },
                { key: 'comfortable', label: 'Rộng' },
              ],
              selectedKeys: [density],
              onClick: ({ key }) => setDensity(key as 'compact' | 'normal' | 'comfortable'),
            }}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{DENSITY_LABELS[density]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </Dropdown>

          <button
            type="button"
            onClick={onSearchClear}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Đặt lại' : 'Reset'}</span>
          </button>

          <Dropdown
            trigger={['click']}
            popupRender={() => (
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-3 shadow-xl backdrop-blur-xl">
                <Checkbox.Group
                  value={visibleColumns}
                  options={columnOptions}
                  onChange={(values) => setVisibleColumns(values.map(String))}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                />
              </div>
            )}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>{isVi ? 'Cột' : 'Columns'}</span>
            </button>
          </Dropdown>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isVi ? 'Đang tải dữ liệu PostHog...' : 'Loading PostHog data...'}</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <tr className="text-slate-700 dark:text-slate-300 font-bold text-[12.5px]">
                {visibleColumns.includes('event') && (
                  <th className="py-3 px-3.5 w-44 text-center whitespace-nowrap">{isVi ? 'Loại sự kiện' : 'Event'}</th>
                )}
                {visibleColumns.includes('user') && (
                  <th className="py-3 px-3.5 w-48 text-center whitespace-nowrap">{isVi ? 'Học viên' : 'User'}</th>
                )}
                {visibleColumns.includes('properties') && (
                  <th className="py-3 px-3.5 text-center whitespace-nowrap">{isVi ? 'Dữ liệu thu thập' : 'Properties'}</th>
                )}
                {visibleColumns.includes('timestamp') && (
                  <th className="py-3 px-3.5 w-40 text-center whitespace-nowrap">{isVi ? 'Thời gian' : 'Timestamp'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {liveEvents.length > 0 ? (
                liveEvents.map((item: PostHogLiveEventItem) => {
                  const badge = getEventBadge(item.event)
                  const Icon = badge.icon

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {visibleColumns.includes('event') && (
                        <td className={`${paddingClass} whitespace-nowrap text-center`}>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border text-[11px] ${badge.color}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes('user') && (
                        <td className={`${paddingClass} font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap text-center`}>
                          {item.user_email}
                        </td>
                      )}
                      {visibleColumns.includes('properties') && (
                        <td className={`${paddingClass} font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-md truncate`}>
                          {JSON.stringify(item.properties)}
                        </td>
                      )}
                      {visibleColumns.includes('timestamp') && (
                        <td className={`${paddingClass} text-slate-400 whitespace-nowrap font-mono text-[11px] text-center`}>
                          {new Date(item.timestamp).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length} className="text-center py-10 text-slate-400 text-xs">
                    {isVi ? 'Không tìm thấy sự kiện nào' : 'No events found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalEvents > 0 && (
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={currentLimit}
            pageSizeOptions={[10, 20, 50, 100]}
            totalItems={totalEvents}
            showTotal={true}
            onPageChange={onPageChange}
            onPageSizeChange={(limit) => onPageSizeChange(limit)}
          />
        </div>
      )}
    </div>
  )
}
