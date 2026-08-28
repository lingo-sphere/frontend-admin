import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
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

  const storageInfo = useMemo(() => {
    const sys = storageUsage?.system_storage
    const usedMb = sys?.used_mb !== undefined ? sys.used_mb : (storageUsage?.used_mb ?? 2.79)
    const maxGb = sys?.max_gb !== undefined ? sys.max_gb : 10
    const totalFiles = sys?.total_files !== undefined ? sys.total_files : (storageUsage?.total_files ?? 3)
    const usagePercent = sys?.usage_percent !== undefined ? sys.usage_percent : Number(((usedMb / (maxGb * 1000)) * 100).toFixed(2))

    const formattedUsage = usedMb >= 1000
      ? `${(usedMb / 1000).toFixed(2)} GB`
      : `${usedMb} MB`

    return {
      usedMb,
      maxGb,
      totalFiles,
      usagePercent,
      formattedUsage,
    }
  }, [storageUsage])

  const chartData = useMemo<ChartItem[]>(() => {
    const days = selectedRange.id === 'custom' ? 14 : selectedRange.days
    const slice = base30DaysData.slice(-days)
    const now = new Date()

    return slice.map((val, idx) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (days - 1 - idx))
      const day = d.getDate()
      const month = d.getMonth() + 1
      return {
        value: val,
        label: `${day}/${month}`,
        fullDate: `${day}/${month}/${d.getFullYear()}`,
      }
    })
  }, [selectedRange])

  const handleApplyCustom = () => {
    if (customFromDate && customToDate) {
      setSelectedRange({
        id: 'custom',
        label: `${customFromDate} - ${customToDate}`,
        labelVi: `${customFromDate} - ${customToDate}`,
        days: 14,
      })
      setShowDatePicker(false)
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('page.dashboard.title') || 'Tổng Quan Hệ Thống'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Trung tâm chỉ huy dữ liệu học viên, tiến trình bài học và tài nguyên đám mây
          </p>
        </div>

        <div className="flex items-center gap-2 relative" ref={pickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shadow-xs"
          >
            <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{isVietnamese ? selectedRange.labelVi : selectedRange.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin text-teal-500' : 'text-slate-400'}`} />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-12 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="space-y-1">
                {dateRanges.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRange(r)
                      if (r.id !== 'custom') setShowDatePicker(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      selectedRange.id === r.id
                        ? 'bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isVietnamese ? r.labelVi : r.label}</span>
                    {selectedRange.id === r.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              {selectedRange.id === 'custom' && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <button
                    onClick={handleApplyCustom}
                    className="w-full h-8 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" /> +12.4%
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng người học</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {analytics?.overview?.total_users?.toLocaleString('vi-VN') || '12,840'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>Hoạt động: {analytics?.overview?.active_users_today || 428} hôm nay</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold">98.2% Active</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              <TrendingUp className="w-3 h-3" /> +8.5%
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Khóa học hệ thống</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {totalCoursesCount || 18} Khóa
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>120+ bài giảng video</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">4.8 ★ Đánh giá</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <TrendingUp className="w-3 h-3" /> +15.2%
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Điểm TOEIC trung bình</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">685 / 990</p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>3,420 lượt thi ETS</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Đạt chuẩn 85%</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              Cloudflare R2
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dung lượng media đã dùng</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {storageInfo.formattedUsage}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
            <span>Giới hạn: {storageInfo.maxGb} GB ({storageInfo.totalFiles} files)</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              {storageInfo.usagePercent}% Quota
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Phiên Học & Luyện Tập Mỗi Ngày</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Số lượng học viên tham gia học từ vựng và làm bài TOEIC</p>
            </div>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-full">
              {formatDateRange(selectedRange, isVietnamese)}
            </span>
          </div>

          <div className="h-64 w-full">
            <SimpleChart items={chartData} />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Trạng Thái Hệ Thống Microservices</h3>

          <div className="space-y-3 flex-1">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">User & Auth Gateway</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">24ms · Healthy</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Course & Curriculum Service</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">38ms · Healthy</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Vocabulary & Spaced Repetition</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">19ms · Healthy</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">AI Assessment (Gemini 2.5)</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">240ms · Online</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">TOEIC Exam Engine</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">32ms · Healthy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Nhật Ký Hoạt Động Gần Đây</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tiến trình học tập và làm bài của học viên trên toàn hệ thống</p>
          </div>
          <button
            onClick={() => setActiveNavItem('progress')}
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="pb-3 px-3">Học viên</th>
                <th className="pb-3 px-3">Hành động</th>
                <th className="pb-3 px-3">Điểm / XP</th>
                <th className="pb-3 px-3">Thời gian</th>
                <th className="pb-3 px-3">Trạng thái</th>
                <th className="pb-3 px-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-200">
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
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          {log.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">{log.userName}</p>
                          <p className="text-[10px] text-slate-500">{log.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                          <EventIcon className="w-3.5 h-3.5" />
                        </div>
                        <span>{isVietnamese ? log.actionNameVi : log.actionNameEn}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-600 dark:text-teal-400">{log.scoreOrXP}</td>
                    <td className="py-3 px-3 text-slate-500">{log.timestamp}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
                className={`w-full rounded-t-md transition-all duration-300 group-hover:bg-teal-400 ${
                  isLatest ? 'bg-teal-500 shadow-lg shadow-teal-500/30' : 'bg-teal-500/30'
                }`}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-1.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {items.map((item, index) => (
          <span
            key={index}
            className="flex-1 text-center text-[10px] text-slate-400 truncate"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
