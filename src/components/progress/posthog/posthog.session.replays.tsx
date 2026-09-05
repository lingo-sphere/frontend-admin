/**
 * @file posthog.session.replays.tsx
 * @description Session Replay card grid and pagination controls
 */

import { Video, ExternalLink, Clock, Laptop, Play } from 'lucide-react'
import type { PostHogSessionReplay } from '@/types/api.types'
import { Pagination } from '@/components/common/pagination'

interface PostHogSessionReplaysProps {
  replays: PostHogSessionReplay[]
  paginatedReplays: PostHogSessionReplay[]
  replaysPage: number
  replaysPageSize: number
  totalReplayPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  isVi: boolean
}

export function PostHogSessionReplays({
  replays,
  paginatedReplays,
  replaysPage,
  replaysPageSize,
  totalReplayPages,
  onPageChange,
  onPageSizeChange,
  isVi,
}: PostHogSessionReplaysProps) {
  return (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {replays.length > 0 && (
        <div className="pt-2">
          <Pagination
            currentPage={replaysPage}
            totalPages={totalReplayPages}
            pageSize={replaysPageSize}
            pageSizeOptions={[4, 8, 12, 16]}
            totalItems={replays.length}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  )
}
