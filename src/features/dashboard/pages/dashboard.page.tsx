// Trang quan tri DashboardPage trong giao dien Admin.

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  Check,
  RefreshCw,
  Server,
  Activity,
  Cpu,
  Brain,
  BookOpen,
} from 'lucide-react'
import {
  useSystemAnalyticsQuery,
  useDashboardCoursesQuery,
} from '@/features/dashboard/hooks/use.dashboard.admin.query'
import { DashboardStatsGrid } from '@/features/dashboard/components/dashboard.stats.grid'
import { SimpleChart, type ChartItem } from '@/features/dashboard/components/dashboard.activity.chart'
import { DashboardRecentActivity } from '@/features/dashboard/components/dashboard.recent.activity'

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
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const navigate = useNavigate()
  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[1])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const {
    data: analytics = null,
    isLoading: isLoadingAnalytics,
    refetch: refetchAnalytics,
  } = useSystemAnalyticsQuery()

  const {
    data: coursesData = [],
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
  } = useDashboardCoursesQuery()

  const totalCoursesCount = coursesData.length
  const isLoadingStats = (isLoadingAnalytics && !analytics) || (isLoadingCourses && coursesData.length === 0)

  const fetchDashboardData = () => {
    refetchAnalytics()
    refetchCourses()
  }

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
            title={isVietnamese ? 'Làm mới dữ liệu' : 'Refresh data'}
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
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {isVietnamese ? 'Phiên Học & Luyện Tập Mỗi Ngày' : 'Daily Study & Practice Sessions'}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {isVietnamese ? 'Số lượng học viên tham gia học từ vựng và làm bài TOEIC' : 'Learners practicing vocabulary and taking TOEIC tests'}
              </p>
            </div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 px-3 py-1.5 rounded-full">
              {formatDateRange(selectedRange, isVietnamese)}
            </span>
          </div>

          <div className="h-72 w-full">
            <SimpleChart items={chartData} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
              {isVietnamese ? 'Trạng Thái Hệ Thống Microservices' : 'Microservices Health'}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
              {isVietnamese ? 'Giám sát độ trễ và độ sẵn sàng của các service' : 'Live latency and availability tracking'}
            </p>
          </div>

          <div className="space-y-2.5 flex-1">
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50">
                  <Server className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">User & Auth Gateway</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  24ms
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Course & Curriculum</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  38ms
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Vocabulary Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  19ms
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/50">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Assessment Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  240ms
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">TOEIC Exam Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  32ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardRecentActivity
        activities={analytics?.recent_activities}
        onViewAll={() => navigate('/progress')}
        onSelectUser={(userId) => navigate(`/users/${userId}`)}
        isVietnamese={isVietnamese}
      />
    </div>
  )
}
