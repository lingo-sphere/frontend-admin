/**
 * @file posthog.live.events.table.tsx
 * @description Real-time PostHog live event telemetry stream table
 */

import React from 'react'
import {
  Sparkles,
  Search,
  Loader2,
  GraduationCap,
  BookOpen,
  Brain,
  Headphones,
} from 'lucide-react'
import type { PostHogLiveEventItem } from '@/types/api.types'
import { CustomSelect } from '@/components/common/custom.select'
import { Pagination } from '@/components/common/pagination'

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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs rounded-3xl z-20 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isVi ? 'Đang tải dữ liệu PostHog...' : 'Loading PostHog data...'}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isVi ? 'Luồng Sự Kiện Học Tập Thời Gian Thực (Server-side)' : 'Real-time Event Stream'}
            </h3>
            <span className="text-xs text-slate-500">
              ({totalEvents} {isVi ? 'sự kiện ghi nhận' : 'events'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={isVi ? 'Gõ tìm kiếm & ấn Enter...' : 'Search events & press Enter...'}
              className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={onSearchClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{isVi ? 'Số dòng:' : 'Page size:'}</span>
            <CustomSelect
              size="sm"
              value={String(currentLimit)}
              onChange={(val) => onPageSizeChange(Number(val))}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '50', label: '50' },
              ]}
              className="w-20"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">
              <th className="py-3 px-3.5 w-44">{isVi ? 'Loại Sự Kiện' : 'Event'}</th>
              <th className="py-3 px-3.5 w-48">{isVi ? 'Học Viên' : 'User'}</th>
              <th className="py-3 px-3.5">{isVi ? 'Dữ Liệu Thu Thập' : 'Properties'}</th>
              <th className="py-3 px-3.5 w-36">{isVi ? 'Thời Gian' : 'Timestamp'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {liveEvents.length > 0 ? (
              liveEvents.map((item: PostHogLiveEventItem) => {
                const badge = getEventBadge(item.event)
                const Icon = badge.icon

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border text-[11px] ${badge.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.user_email}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 max-w-md truncate">
                      {JSON.stringify(item.properties)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {new Date(item.timestamp).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                  {isVi ? 'Không tìm thấy sự kiện nào' : 'No events found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalEvents > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={currentLimit}
            pageSizeOptions={[10, 20, 50, 100]}
            totalItems={totalEvents}
            onPageChange={onPageChange}
            onPageSizeChange={(limit) => onPageSizeChange(limit)}
          />
        </div>
      )}
    </div>
  )
}
