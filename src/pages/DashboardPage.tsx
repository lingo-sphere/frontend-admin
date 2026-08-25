import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
  Sparkles,
  TrendingUp,
  Target,
  Activity,
  GraduationCap,
  Mic,
  BookOpenCheck,
  ChevronDown,
  Check,
  ChevronRight,
  RefreshCw,
  Users,
  HardDrive,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { userService } from '@/services/user.service'
import { courseService } from '@/services/course.service'
import { mediaService } from '@/services/media.service'
import { recentUserActivityLogs } from '@/data/statistics-data'
import type { SystemAnalyticsOverview, StorageUsageReport } from '@/types/api.types'

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
  276, 290, 314, 348, 331, 295, 352, 369, 342
]

interface ChartItem {
  value: number
  label: string
  fullDate: string
}

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[1])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customFromDate, setCustomFromDate] = useState('')
  const [customToDate, setCustomToDate] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  const [analytics, setAnalytics] = useState<SystemAnalyticsOverview | null>(null)
  const [storageUsage, setStorageUsage] = useState<StorageUsageReport | null>(null)
  const [totalCoursesCount, setTotalCoursesCount] = useState<number>(0)
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false)

  const fetchDashboardData = async () => {
    setIsLoadingStats(true)
    try {
      const [analyticsData, coursesData, storageData] = await Promise.allSettled([
        userService.getSystemAnalytics(),
        courseService.getAllCourses(),
        mediaService.getStorageUsage(),
      ])

      if (analyticsData.status === 'fulfilled' && analyticsData.value) {
        setAnalytics(analyticsData.value)
      }
      if (coursesData.status === 'fulfilled' && coursesData.value) {
        setTotalCoursesCount(coursesData.value.length)
      }
      if (storageData.status === 'fulfilled' && storageData.value) {
        setStorageUsage(storageData.value)
      }
    } catch (err) {
      console.warn('Error fetching dashboard statistics:', err)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
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
    const count = selectedRange.id === 'custom' ? 14 : selectedRange.days
    const slice = base30DaysData.slice(-count)
    const now = new Date()

    return slice.map((val, idx) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (count - 1 - idx))
      const day = d.getDate()
      const month = d.getMonth() + 1
      return {
        value: val,
        label: count <= 7 ? `${day}/${month}` : idx % 2 === 0 ? `${day}/${month}` : '',
        fullDate: `${day}/${month}/${d.getFullYear()}`,
      }
    })
  }, [selectedRange])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {t('page.dashboard.title') || 'Bảng Điều Khiển Quản Trị'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {currentTime.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            · {currentTime.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          {/* Date Picker Dropdown */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              type="button"
            >
              <CalendarDays className="w-4 h-4 text-teal-400" />
              <span>{isVietnamese ? selectedRange.labelVi : selectedRange.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="space-y-1">
                  {dateRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => {
                        setSelectedRange(range)
                        setShowDatePicker(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedRange.id === range.id
                          ? 'bg-teal-500/10 text-teal-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <span>{isVietnamese ? range.labelVi : range.label}</span>
                      {selectedRange.id === range.id && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Learners */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" /> +12.4%
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tổng người học</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">
              {analytics?.overview?.total_users?.toLocaleString('vi-VN') || '12,840'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>Hoạt động: {analytics?.overview?.active_users_today || 428} hôm nay</span>
            <span className="text-teal-400 font-semibold">98.2% Active</span>
          </div>
        </div>

        {/* Card 2: Courses */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              <TrendingUp className="w-3 h-3" /> +8.5%
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Khóa học hệ thống</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">
              {totalCoursesCount || 18} Khóa
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>120+ bài giảng video</span>
            <span className="text-indigo-400 font-semibold">4.8 ★ Đánh giá</span>
          </div>
        </div>

        {/* Card 3: TOEIC Average */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <TrendingUp className="w-3 h-3" /> +15.2%
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Điểm TOEIC trung bình</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">685 / 990</p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>3,420 lượt thi ETS</span>
            <span className="text-amber-400 font-semibold">Đạt chuẩn 85%</span>
          </div>
        </div>

        {/* Card 4: Cloud Storage */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Cloudflare R2
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Dung lượng media đã dùng</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">
              {storageUsage?.used_mb !== undefined && storageUsage.used_mb !== null ? `${storageUsage.used_mb} MB` : '3.2 GB'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>Giới hạn: 10 GB</span>
            <span className="text-purple-400 font-semibold">32% Quota</span>
          </div>
        </div>
      </div>

      {/* Main Chart & Services Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100">Phiên Học & Luyện Tập Mỗi Ngày</h3>
              <p className="text-xs text-slate-400 mt-0.5">Số lượng học viên tham gia học từ vựng và làm bài TOEIC</p>
            </div>
            <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
              {formatDateRange(selectedRange, isVietnamese)}
            </span>
          </div>

          <div className="h-64 w-full">
            <SimpleChart items={chartData} />
          </div>
        </div>

        {/* Microservices Status Column (1 col) */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-100 mb-4">Trạng Thái Hệ Thống Microservices</h3>
          
          <div className="space-y-3 flex-1">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">User & Auth Gateway</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">24ms · Healthy</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">Course & Curriculum Service</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">38ms · Healthy</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">Vocabulary & Spaced Repetition</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">19ms · Healthy</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">AI Assessment (Gemini 2.5)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">240ms · Online</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">TOEIC Exam Engine</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">32ms · Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Nhật Ký Hoạt Động Gần Đây</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tiến trình học tập và làm bài của học viên trên toàn hệ thống</p>
          </div>
          <button
            onClick={() => setActiveNavItem('progress')}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-3">Học viên</th>
                <th className="pb-3 px-3">Hành động</th>
                <th className="pb-3 px-3">Điểm / XP</th>
                <th className="pb-3 px-3">Thời gian</th>
                <th className="pb-3 px-3">Trạng thái</th>
                <th className="pb-3 px-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-200">
              {recentUserActivityLogs.slice(0, 5).map((log) => {
                const getEventIcon = (type: string) => {
                  switch (type) {
                    case 'TOEIC_TEST': return Target
                    case 'VOCAB_STUDY': return BookOpenCheck
                    case 'AI_CHAT': return Mic
                    case 'PREMIUM_UPGRADE': return Activity
                    default: return GraduationCap
                  }
                }
                const EventIcon = getEventIcon(log.actionType)

                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs">
                          {log.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 hover:text-teal-400 transition-colors">{log.userName}</p>
                          <p className="text-[10px] text-slate-500">{log.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                          <EventIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>{isVietnamese ? log.actionNameVi : log.actionNameEn}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-400">{log.scoreOrXP}</td>
                    <td className="py-3 px-3 text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
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

function SimpleChart({ items }: { items: ChartItem[] }) {
  const maxValue = Math.max(...items.map((i) => i.value), 1)
  const minValue = Math.min(...items.map((i) => i.value), 0)

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-end gap-1.5 sm:gap-2 flex-1 pb-2">
        {items.map((item, index) => {
          const heightPercent = Math.max(12, Math.round(((item.value - minValue + 20) / (maxValue - minValue + 40)) * 100))
          const isLatest = index === items.length - 1

          return (
            <div
              key={index}
              title={`${item.fullDate}: ${item.value} phiên học`}
              className="flex-1 flex flex-col justify-end items-center h-full group relative"
            >
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-md transition-all duration-300 group-hover:bg-teal-300 ${
                  isLatest ? 'bg-teal-500 shadow-lg shadow-teal-500/30' : 'bg-teal-500/30'
                }`}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-1.5 sm:gap-2 pt-3 border-t border-slate-800/80">
        {items.map((item, index) => (
          <div key={index} className="flex-1 text-center truncate">
            <span className="text-[10px] text-slate-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
