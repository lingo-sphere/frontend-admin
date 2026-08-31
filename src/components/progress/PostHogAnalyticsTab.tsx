import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Video,
  Users,
  Eye,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Play,
  Clock,
  Laptop,
  BookOpen,
  GraduationCap,
  Brain,
  Headphones,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import type { PostHogAnalyticsData, PostHogSessionReplay, PostHogLiveEventItem } from '@/types/api.types'
import { CustomSelect } from '@/components/common/CustomSelect'
import { Pagination } from '@/components/common/Pagination'

interface PostHogAnalyticsTabProps {
  data: PostHogAnalyticsData | null
  isLoading: boolean
  onRefresh: () => void
  serverParams?: {
    page: number
    limit: number
    search: string
  }
  onParamsChange?: (newParams: Partial<{
    page: number
    limit: number
    search: string
  }>) => void
  onSearchSubmit?: (searchTerm: string) => void
}

export function PostHogAnalyticsTab({
  data,
  isLoading,
  onRefresh,
  serverParams,
  onParamsChange,
  onSearchSubmit,
}: PostHogAnalyticsTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [searchInput, setSearchInput] = useState<string>(serverParams?.search || '')

  const [replaysPage, setReplaysPage] = useState<number>(1)
  const [replaysPageSize, setReplaysPageSize] = useState<number>(6)

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

  const liveEvents = data?.live_events || []
  const pagination = data?.pagination || {
    total: liveEvents.length,
    page: serverParams?.page || 1,
    limit: serverParams?.limit || 10,
    totalPages: Math.max(1, Math.ceil(liveEvents.length / (serverParams?.limit || 10))),
  }

  const currentPage = serverParams?.page || pagination.page || 1
  const currentLimit = serverParams?.limit || pagination.limit || 10
  const totalPages = pagination.totalPages || 1
  const totalEvents = pagination.total || 0

  const replays = data?.recent_replays || []
  const totalReplayPages = Math.max(1, Math.ceil(replays.length / replaysPageSize))
  const paginatedReplays = useMemo(() => {
    const start = (replaysPage - 1) * replaysPageSize
    return replays.slice(start, start + replaysPageSize)
  }, [replays, replaysPage, replaysPageSize])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSearchSubmit) {
        onSearchSubmit(searchInput)
      } else if (onParamsChange) {
        onParamsChange({ search: searchInput, page: 1 })
      }
    }
  }

  return (
    <div className="space-y-6">
      {}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Project: Lingo Sphere Staging (ID: 585141)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isVi ? 'Phân Tích Trải Nghiệm Học Viên & Session Replay' : 'Learner Experience Analytics & Session Replay'}
            </h2>
            <p className="text-indigo-100/90 text-sm max-w-2xl">
              {isVi
                ? 'Theo dõi hành vi học viên trên Frontend Web, ghi hình trực quan toàn bộ phiên làm bài thi TOEIC, học từ vựng SRS và đo lường tỷ lệ hoàn thành khóa học.'
                : 'Real-time telemetry tracking learner interactions, session replays, and learning funnels powered by PostHog Cloud.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
            </button>

            <a
              href="https://us.posthog.com/project/585141"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-teal-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 transition-all cursor-pointer"
            >
              <span>{isVi ? 'Mở PostHog Cloud' : 'Open PostHog'}</span>
              <ExternalLink className="w-4 h-4 text-indigo-600" />
            </a>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold">
              <Eye className="w-4 h-4" />
              <span>{isVi ? 'Tổng lượt xem trang' : 'Total Pageviews'}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {data?.metrics?.total_pageviews ?? 0}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold">
              <Users className="w-4 h-4" />
              <span>{isVi ? 'Khách truy cập (Unique)' : 'Unique Visitors'}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {data?.metrics?.unique_visitors ?? 0}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold">
              <Video className="w-4 h-4" />
              <span>{isVi ? 'Video Session Replays' : 'Recorded Sessions'}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {data?.metrics?.total_session_replays ?? 0}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>{isVi ? 'Tương tác học tập' : 'Learning Events'}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {data?.metrics?.custom_learning_events ?? 0}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isVi ? 'Top Sự Kiện Thực Hiện Nhiều Nhất' : 'Top Triggered Events'}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">PostHog Live</span>
          </div>

          <div className="space-y-3">
            {(data?.top_events || []).map((ev, index) => {
              const maxCount = Math.max(...(data?.top_events?.map((e) => e.count) || [1]), 1)
              const percent = Math.min(100, Math.round((ev.count / maxCount) * 100))
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{ev.label}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                      {ev.count} {isVi ? 'lần' : 'times'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isVi ? 'Top Trang Được Truy Cập Nhiều Nhất' : 'Most Viewed Pages'}
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">Frontend Web</span>
          </div>

          <div className="space-y-3">
            {(data?.top_pages || []).map((pg, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {pg.path}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                  <span className="text-teal-600 dark:text-teal-400 font-mono">
                    {pg.views} {isVi ? 'views' : 'views'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    ({pg.unique_visitors} {isVi ? 'người' : 'users'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isVi ? 'Video Ghi Hình Thao Tác (Session Replays)' : 'Recent Session Replays'}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              ({replays.length} {isVi ? 'bản ghi' : 'replays'})
            </span>
          </div>

          <a
            href="https://us.posthog.com/project/585141/replay"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <span>{isVi ? 'Xem tất cả trên PostHog' : 'View all on PostHog'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {paginatedReplays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedReplays.map((rep: PostHogSessionReplay) => (
              <div
                key={rep.session_id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                      {rep.session_id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      REPLAY
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {rep.user_email}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.round(rep.duration_seconds / 60)} {isVi ? 'phút' : 'mins'}</span>
                    </div>
                    <span>•</span>
                    <span>{rep.events_count} events</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Laptop className="w-3.5 h-3.5" />
                    <span className="truncate">{rep.device}</span>
                  </div>
                </div>

                <a
                  href={rep.replay_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer group-hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isVi ? 'Xem lại thao tác' : 'Watch Replay'}</span>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            {isVi ? 'Chưa có bản ghi Session Replay nào' : 'No session replays found'}
          </div>
        )}

        {}
        {totalReplayPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs flex-wrap gap-3">
            <span className="text-slate-500">
              {isVi
                ? `Hiển thị ${(replaysPage - 1) * replaysPageSize + 1} - ${Math.min(
                    replaysPage * replaysPageSize,
                    replays.length
                  )} trên ${replays.length} bản ghi`
                : `Showing ${(replaysPage - 1) * replaysPageSize + 1} - ${Math.min(
                    replaysPage * replaysPageSize,
                    replays.length
                  )} of ${replays.length} replays`}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setReplaysPage((p) => Math.max(1, p - 1))}
                disabled={replaysPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {replaysPage} / {totalReplayPages}
              </span>
              <button
                onClick={() => setReplaysPage((p) => Math.min(totalReplayPages, p + 1))}
                disabled={replaysPage === totalReplayPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 relative">
        {}
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
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={isVi ? 'Gõ tìm kiếm & ấn Enter...' : 'Search events & press Enter...'}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    if (onSearchSubmit) onSearchSubmit('')
                    else if (onParamsChange) onParamsChange({ search: '', page: 1 })
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
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
                onChange={(val) => {
                  if (onParamsChange) {
                    onParamsChange({ limit: Number(val), page: 1 })
                  }
                }}
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
              onPageChange={(page) => {
                if (onParamsChange) {
                  onParamsChange({ page })
                }
              }}
              onPageSizeChange={(limit) => {
                if (onParamsChange) {
                  onParamsChange({ limit, page: 1 })
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
