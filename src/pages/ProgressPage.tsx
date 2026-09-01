/**
 * @file ProgressPage.tsx
 * @description Trang quản trị ProgressPage trong giao diện Admin
 */

import { useState, useEffect } from 'react'
import {
  Users,
  Target,
  BrainCircuit,
  Activity,
  RotateCcw,
} from 'lucide-react'
import { userService } from '@/services/user.service'
import { courseService } from '@/services/course.service'
import { vocabularyService } from '@/services/vocabulary.service'
import { examService } from '@/services/exam.service'
import { progressService } from '@/services/progress.service'
import { BetterStackMonitoringTab } from '@/components/progress/BetterStackMonitoringTab'
import { PostHogAnalyticsTab } from '@/components/progress/PostHogAnalyticsTab'
import { ProgressOverviewTab } from '@/components/progress/ProgressOverviewTab'
import { ProgressToeicAnalyticsTab } from '@/components/progress/ProgressToeicAnalyticsTab'
import { ProgressAiMetricsTab } from '@/components/progress/ProgressAiMetricsTab'
import { ProgressActivityLogsTab } from '@/components/progress/ProgressActivityLogsTab'
import type {
  SystemAnalyticsOverview,
  UserActivityLog,
  BetterStackMonitoringData,
  PostHogAnalyticsData,
} from '@/types/api.types'

type AnalyticsTab = 'overview' | 'toeic' | 'ai' | 'logs' | 'betterstack' | 'posthog'

export function ProgressPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [analytics, setAnalytics] = useState<SystemAnalyticsOverview | null>(null)
  const [betterStackData, setBetterStackData] = useState<BetterStackMonitoringData | null>(null)
  const [postHogData, setPostHogData] = useState<PostHogAnalyticsData | null>(null)
  const [coursesCount, setCoursesCount] = useState<number>(0)
  const [vocabCount, setVocabCount] = useState<number>(0)
  const [examsCount, setExamsCount] = useState<number>(0)
  const [liveLogs, setLiveLogs] = useState<UserActivityLog[]>([])

  const [logSearch, setLogSearch] = useState('')
  const [logActionFilter, setLogActionFilter] = useState('ALL')

  const loadData = async () => {
    setIsRefreshing(true)
    try {
      const [analyticsRes, coursesRes, vocabRes, examsRes, betterStackRes, postHogRes] =
        await Promise.allSettled([
          userService.getSystemAnalytics(),
          courseService.getAllCourses(),
          vocabularyService.searchVocabulary(),
          examService.getExams(),
          progressService.getBetterStackMonitoring(),
          progressService.getPostHogAnalytics(),
        ])

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalytics(analyticsRes.value)
        if (analyticsRes.value.recent_activities) {
          setLiveLogs(analyticsRes.value.recent_activities)
        }
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value) {
        const cVal = coursesRes.value
        const count = Array.isArray(cVal)
          ? cVal.length
          : (cVal?.meta?.total ?? cVal?.result?.length ?? 0)
        setCoursesCount(count)
      }
      if (vocabRes.status === 'fulfilled' && vocabRes.value) {
        setVocabCount(vocabRes.value.length)
      }
      if (examsRes.status === 'fulfilled' && examsRes.value) {
        setExamsCount(examsRes.value.length)
      }
      if (betterStackRes.status === 'fulfilled' && betterStackRes.value) {
        setBetterStackData(betterStackRes.value)
      }
      if (postHogRes.status === 'fulfilled' && postHogRes.value) {
        setPostHogData(postHogRes.value)
      }
    } catch (err) {
      console.warn('Error loading progress analytics:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>Trung Tâm Giám Sát & Báo Cáo Hệ Thống</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tổng hợp dữ liệu học tập 360°, tiến trình TOEIC, phân tích AI và nhật ký hoạt động
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'overview', label: 'Tổng quan hệ sinh thái', icon: Users },
          { key: 'toeic', label: 'Phân tích TOEIC 7 Part', icon: Target },
          { key: 'ai', label: 'Hiệu năng Mô hình AI', icon: BrainCircuit },
          { key: 'logs', label: 'Nhật ký học viên', icon: Activity },
          { key: 'betterstack', label: 'BetterStack Uptime' },
          { key: 'posthog', label: 'PostHog Product Analytics' },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AnalyticsTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <ProgressOverviewTab
          analytics={analytics}
          coursesCount={coursesCount}
          vocabCount={vocabCount}
          examsCount={examsCount}
        />
      )}

      {activeTab === 'toeic' && <ProgressToeicAnalyticsTab />}

      {activeTab === 'ai' && <ProgressAiMetricsTab />}

      {activeTab === 'logs' && (
        <ProgressActivityLogsTab
          logs={liveLogs}
          search={logSearch}
          actionFilter={logActionFilter}
          onSearchChange={setLogSearch}
          onActionFilterChange={setLogActionFilter}
        />
      )}

      {activeTab === 'betterstack' && (
        <BetterStackMonitoringTab
          data={betterStackData}
          isLoading={isRefreshing}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'posthog' && (
        <PostHogAnalyticsTab
          data={postHogData}
          isLoading={isRefreshing}
          onRefresh={loadData}
        />
      )}
    </div>
  )
}
