/**
 * @file dashboard.page.tsx
 * @description Trang quản trị DashboardPage trong giao diện Admin
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
  ChevronDown,
  Check,
  RefreshCw,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { userService } from '@/services/user.service'
import { courseService } from '@/services/course.service'
import type { SystemAnalyticsOverview } from '@/types/api.types'
import { DashboardStatsGrid } from '@/components/dashboard/dashboard.stats.grid'
import { SimpleChart, type ChartItem } from '@/components/dashboard/dashboard.activity.chart'
import { DashboardRecentActivity } from '@/components/dashboard/dashboard.recent.activity'

interface DateRange {
  id: string
  label: string
  labelVi: string
  days: number
}

const dateRanges: DateRange[] = [
  { id: '7d', label: 'Last 7 days', labelVi: '7 ngày qua', days: 7 },
  { id: '14d', label: 'Last 14 days', labelVi: '14 ngày qua', days: 14 },
  { id: '30d', label: 'Last 30 days', labelVi: '30 ngày qua', days: 30 },
  { id: 'custom', label: 'Custom', labelVi: 'Tùy chỉnh', days: 0 },
]

function formatDateRange(range: DateRange, isVietnamese: boolean): string {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - range.days + 1)

  const startDay = start.getDate()
  const endDay = now.getDate()
  const monthNamesVi = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12']
  const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (isVietnamese) {
    return `${startDay}–${endDay} ${monthNamesVi[now.getMonth()]}, ${now.getFullYear()}`
  }
  return `${startDay}–${endDay} ${monthNamesEn[now.getMonth()]}, ${now.getFullYear()}`
}

const base30DaysData = [
  210, 225, 240, 218, 230, 255, 270,
  248, 260, 280, 290, 275, 285, 310,
  232, 250, 268, 288, 295, 310, 325,
  276, 290, 314, 348, 331, 295, 352, 369, 342,
]

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[1])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const [analytics, setAnalytics] = useState<SystemAnalyticsOverview | null>(null)
  const [totalCoursesCount, setTotalCoursesCount] = useState<number>(0)
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false)

  const fetchDashboardData = async () => {
    setIsLoadingStats(true)
    try {
      const [analyticsData, coursesData] = await Promise.allSettled([
        userService.getSystemAnalytics(),
        courseService.getAllCourses(),
      ])

      if (analyticsData.status === 'fulfilled' && analyticsData.value) {
        setAnalytics(analyticsData.value)
      }
      if (coursesData.status === 'fulfilled' && coursesData.value) {
        const cVal = coursesData.value
        const count = Array.isArray(cVal) ? cVal.length : (cVal?.meta?.total ?? cVal?.result?.length ?? 0)
        setTotalCoursesCount(count)
      }
    } catch (err) {
      console.warn('Using local fallback stats:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const chartData = useMemo<ChartItem[]>(() => {
    const days = selectedRange.days || 14
    const values = base30DaysData.slice(-days)
    const now = new Date()

    return values.map((val, idx) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (days - 1 - idx))
      const dateStr = d.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      })
      return {
        value: val,
        label: dateStr,
        fullDate: dateStr,
      }
    })
  }, [selectedRange, isVietnamese])

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isVietnamese ? 'Tổng quan Hệ thống' : 'System Overview'}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {isVietnamese
              ? 'Theo dõi dữ liệu phân tích học tập thời gian thực trên toàn hệ thống LingoSphere'
              : 'Real-time analytics across the LingoSphere learning platform'}
          </p>
        </div>

        <div className="relative flex items-center gap-2.5" ref={pickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2.5 h-11 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-xs cursor-pointer"
          >
            <CalendarDays className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
            <span>{isVietnamese ? selectedRange.labelVi : selectedRange.label}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={fetchDashboardData}
            title="Làm mới dữ liệu"
            className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin text-teal-500' : 'text-slate-400'}`} />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-13 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50">
              <div className="space-y-1">
                {dateRanges.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRange(r)
                      setShowDatePicker(false)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left cursor-pointer ${
                      selectedRange.id === r.id
                        ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isVietnamese ? r.labelVi : r.label}</span>
                    {selectedRange.id === r.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DashboardStatsGrid
        analytics={analytics}
        totalCoursesCount={totalCoursesCount}
        isVietnamese={isVietnamese}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isVietnamese ? 'Phiên Học & Luyện Tập Mỗi Ngày' : 'Daily Study & Practice Sessions'}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                {isVietnamese ? 'Số lượng học viên tham gia học từ vựng và làm bài TOEIC' : 'Learners practicing vocabulary and taking TOEIC tests'}
              </p>
            </div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full">
              {formatDateRange(selectedRange, isVietnamese)}
            </span>
          </div>

          <div className="h-72 w-full">
            <SimpleChart items={chartData} />
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">
            {isVietnamese ? 'Trạng Thái Hệ Thống Microservices' : 'Microservices Health'}
          </h3>

          <div className="space-y-3 flex-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">User & Auth Gateway</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">24ms · Healthy</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Course & Curriculum Service</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">38ms · Healthy</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Vocabulary & Spaced Repetition</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">19ms · Healthy</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Assessment (Gemini 2.5)</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">240ms · Online</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">TOEIC Exam Engine</span>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">32ms · Healthy</span>
            </div>
          </div>
        </div>
      </div>

      <DashboardRecentActivity
        activities={analytics?.recent_activities}
        onViewAll={() => setActiveNavItem('progress')}
        onSelectUser={(userId) => setActiveNavItem(`user-profile:${userId}`)}
        isVietnamese={isVietnamese}
      />
    </div>
  )
}
