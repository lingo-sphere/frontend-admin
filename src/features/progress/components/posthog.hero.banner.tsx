/**
 * @file posthog.hero.banner.tsx
 * @description Hero banner displaying PostHog overview metrics and quick links
 */

import { Eye, Users, Video, Sparkles, RefreshCw, ExternalLink } from 'lucide-react'
import type { PostHogAnalyticsData } from '@/types/api.types'

interface PostHogHeroBannerProps {
  data: PostHogAnalyticsData | null
  isLoading: boolean
  onRefresh: () => void
  isVi: boolean
}

export function PostHogHeroBanner({
  data,
  isLoading,
  onRefresh,
  isVi,
}: PostHogHeroBannerProps) {
  return (
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
  )
}
