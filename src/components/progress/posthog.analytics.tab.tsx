/**
 * @file posthog.analytics.tab.tsx
 * @description PostHog analytics and session replay monitoring tab
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { PostHogAnalyticsData } from '@/types/api.types'
import { PostHogHeroBanner } from './posthog/posthog.hero.banner'
import { PostHogTopCharts } from './posthog/posthog.top.charts'
import { PostHogSessionReplays } from './posthog/posthog.session.replays'
import { PostHogLiveEventsTable } from './posthog/posthog.live.events.table'

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
  const [replaysPageSize, setReplaysPageSize] = useState<number>(8)

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

  const handleSearchClear = () => {
    setSearchInput('')
    if (onSearchSubmit) onSearchSubmit('')
    else if (onParamsChange) onParamsChange({ search: '', page: 1 })
  }

  return (
    <div className="space-y-6">
      <PostHogHeroBanner
        data={data}
        isLoading={isLoading}
        onRefresh={onRefresh}
        isVi={isVi}
      />

      <PostHogTopCharts data={data} isVi={isVi} />

      <PostHogSessionReplays
        replays={replays}
        paginatedReplays={paginatedReplays}
        replaysPage={replaysPage}
        replaysPageSize={replaysPageSize}
        totalReplayPages={totalReplayPages}
        onPageChange={setReplaysPage}
        onPageSizeChange={(size) => {
          setReplaysPageSize(size)
          setReplaysPage(1)
        }}
        isVi={isVi}
      />

      <PostHogLiveEventsTable
        liveEvents={liveEvents}
        isLoading={isLoading}
        totalEvents={totalEvents}
        currentPage={currentPage}
        totalPages={totalPages}
        currentLimit={currentLimit}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearchKeyDown={handleSearchKeyDown}
        onSearchClear={handleSearchClear}
        onPageChange={(page) => {
          if (onParamsChange) onParamsChange({ page })
        }}
        onPageSizeChange={(limit) => {
          if (onParamsChange) onParamsChange({ limit, page: 1 })
        }}
        isVi={isVi}
      />
    </div>
  )
}
