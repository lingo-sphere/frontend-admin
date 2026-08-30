import { useState } from 'react'
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
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Brain,
  Headphones,
  Search,
} from 'lucide-react'
import type { PostHogAnalyticsData, PostHogSessionReplay, PostHogLiveEventItem } from '@/types/api.types'

interface PostHogAnalyticsTabProps {
  data: PostHogAnalyticsData | null
  isLoading: boolean
  onRefresh: () => void
}

export function PostHogAnalyticsTab({
  data,
  isLoading,
  onRefresh,
}: PostHogAnalyticsTabProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [eventSearch, setEventSearch] = useState('')

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
  const filteredEvents = liveEvents.filter(
    (e) =>
      e.event.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.user_email.toLowerCase().includes(eventSearch.toLowerCase()),
  )

  const replays = data?.recent_replays || []

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
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
                : 'Track student behavior on Frontend Web, record video replays of TOEIC exams & SRS vocab sessions, and measure course completion funnels.'}
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 transition-all cursor-pointer"
            >
              <span>{isVi ? 'Mở PostHog Staging' : 'Open PostHog'}</span>
              <ExternalLink className="w-4 h-4 text-indigo-600" />
            </a>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold">
              <Eye className="w-4 h-4" />
              <span>{isVi ? 'Lượt xem trang ($Pageviews)' : 'Total Pageviews'}</span>
            </div>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">
              {data?.metrics.total_pageviews.toLocaleString() ?? '0'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold">
              <Users className="w-4 h-4" />
              <span>{isVi ? 'Người dùng định danh' : 'Identified Users'}</span>
            </div>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">
              {data?.metrics.identified_users.toLocaleString() ?? '0'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>{isVi ? 'Sự kiện học tập (Events)' : 'Custom Events'}</span>
            </div>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">
              {data?.metrics.custom_learning_events.toLocaleString() ?? '0'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold">
              <Video className="w-4 h-4" />
              <span>{isVi ? 'Video ghi hình Replay' : 'Session Replays'}</span>
            </div>
            <p className="text-lg sm:text-2xl font-black text-white mt-1">
              {data?.metrics.total_session_replays ?? 0} {isVi ? 'phiên' : 'replays'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Events & Top Pages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Learning Events */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isVi ? 'Sự Kiện Nổi Bật (Top Events)' : 'Top Events'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">PostHog Track</span>
          </div>

          <div className="space-y-3">
            {data?.top_events.map((ev) => {
              const maxCount = Math.max(...(data.top_events.map((e) => e.count) || [1]), 1)
              const percentage = Math.round((ev.count / maxCount) * 100)
              const badge = getEventBadge(ev.event_name)
              const Icon = badge.icon

              return (
                <div key={ev.event_name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{ev.label}</span>
                        <span className="text-xs text-slate-400 font-mono ml-2">({ev.event_name})</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {ev.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Visited Pages */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isVi ? 'Trang Được Truy Cập Nhiều Nhất' : 'Top Visited Pages'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">$pageview</span>
          </div>

          <div className="space-y-3">
            {data?.top_pages.map((p) => (
              <div
                key={p.path}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                    {p.path}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-mono">
                  <span className="text-slate-500 dark:text-slate-400">
                    {p.unique_visitors.toLocaleString()} {isVi ? 'học viên' : 'users'}
                  </span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {p.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Session Replay Videos */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isVi ? 'Video Ghi Hình Thao Tác (Session Replays)' : 'Recent Session Replays'}
            </h3>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {replays.map((rep: PostHogSessionReplay) => (
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
      </div>

      {/* 4. Live Event Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isVi ? 'Luồng Sự Kiện Học Tập Thời Gian Thực (Live Events)' : 'Real-time Event Stream'}
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              placeholder={isVi ? 'Tìm sự kiện, email...' : 'Search events, email...'}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">
                <th className="pb-3 px-3">{isVi ? 'Loại Sự Kiện' : 'Event'}</th>
                <th className="pb-3 px-3">{isVi ? 'Học Viên' : 'User'}</th>
                <th className="pb-3 px-3">{isVi ? 'Dữ Liệu Nghiệp Vụ' : 'Properties'}</th>
                <th className="pb-3 px-3">{isVi ? 'Thời Gian' : 'Timestamp'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEvents.map((item: PostHogLiveEventItem) => {
                const badge = getEventBadge(item.event)
                const Icon = badge.icon

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${badge.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.user_email}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {JSON.stringify(item.properties)}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString(isVi ? 'vi-VN' : 'en-US')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
