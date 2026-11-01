// Trang quan tri DashboardPage voi giao dien Vuexy Analytics Admin Template.

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronDown, Check, RefreshCw } from 'lucide-react'
import {
  useSystemAnalyticsQuery,
  useDashboardCoursesQuery,
} from '@/features/dashboard/hooks/use.dashboard.admin.query'
import { VuexyAnalyticsSliderCard } from '@/features/dashboard/components/vuexy.analytics.slider.card'
import { VuexyDailySalesCard } from '@/features/dashboard/components/vuexy.daily.sales.card'
import { VuexySalesOverviewCard } from '@/features/dashboard/components/vuexy.sales.overview.card'
import { VuexyEarningReportsCard } from '@/features/dashboard/components/vuexy.earning.reports.card'
import { VuexySupportTrackerCard } from '@/features/dashboard/components/vuexy.support.tracker.card'
import { VuexySalesByCountriesCard } from '@/features/dashboard/components/vuexy.sales.by.countries.card'
import { VuexyTotalEarningCard } from '@/features/dashboard/components/vuexy.total.earning.card'
import { VuexyMonthlyCampaignCard } from '@/features/dashboard/components/vuexy.monthly.campaign.card'
import { VuexySourceVisitsCard } from '@/features/dashboard/components/vuexy.source.visits.card'
import { VuexyProjectsTableCard } from '@/features/dashboard/components/vuexy.projects.table.card'
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
  const totalUsersCount = analytics?.overview.total_users ?? 0
  const activeTodayCount = analytics?.overview.active_users_today ?? 0
  const vipUsersCount = analytics?.overview.total_vip_users ?? 0
  const totalSystemXp = analytics?.overview.total_system_xp ?? 0
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isVietnamese ? 'Bảng Điều Khiển & Phân Tích' : 'Analytics Dashboard'}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {isVietnamese
              ? 'Tổng hợp dữ liệu học tập, tiến độ luyện thi TOEIC và doanh thu hệ sinh thái'
              : 'Overview of learning analytics, TOEIC exam progress, and ecosystem revenue'}
          </p>
        </div>

        <div className="relative flex items-center gap-2.5" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isVietnamese ? selectedRange.labelVi : selectedRange.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={fetchDashboardData}
            title={isVietnamese ? 'Làm mới dữ liệu' : 'Refresh data'}
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-12 w-56 rounded-xl bg-white dark:bg-[#2f3349] border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-50">
              <div className="space-y-1">
                {dateRanges.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRange(r)
                      setShowDatePicker(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                      selectedRange.id === r.id
                        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isVietnamese ? r.labelVi : r.label}</span>
                    {selectedRange.id === r.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-6">
          <VuexyAnalyticsSliderCard
            totalUsers={totalUsersCount}
            activeToday={activeTodayCount}
            totalCourses={totalCoursesCount}
            vipUsers={vipUsersCount}
            isVietnamese={isVietnamese}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <VuexyDailySalesCard
            totalCount={activeTodayCount > 0 ? activeTodayCount : totalUsersCount}
            growthText="+18.4%"
            subtitle={isVietnamese ? 'Học viên trực tuyến hôm nay' : 'Active learners today'}
            title={isVietnamese ? 'Lượt Học Hàng Ngày' : 'Average Daily Activity'}
          />
        </div>

        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <VuexySalesOverviewCard
            totalValue={`${(totalUsersCount * 6).toLocaleString('vi-VN')} Lượt`}
            growthPercentage="+18.2%"
            orderPercentage="62.2%"
            orderCount={`${vipUsersCount} gói VIP`}
            visitsPercentage="25.5%"
            visitsCount={`${totalUsersCount * 2} truy cập`}
            title={isVietnamese ? 'Tổng Quan Đơn Hàng' : 'Sales Overview'}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6">
          <VuexyEarningReportsCard
            totalAmount={totalSystemXp > 0 ? `${totalSystemXp.toLocaleString('vi-VN')} XP` : '$468.50'}
            growthRate="+4.2%"
            subText={
              isVietnamese
                ? 'Tổng điểm kinh nghiệm và tiến trình làm bài TOEIC đạt tuần này'
                : 'Overall platform experience points and test completion this week'
            }
          />
        </div>

        <div className="col-span-12 lg:col-span-6">
          <VuexySupportTrackerCard
            totalTickets={totalCoursesCount * 8 + 12}
            newTickets={totalCoursesCount * 5 + 4}
            openTickets={totalCoursesCount * 3 + 2}
            completedPercent={85}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <VuexySalesByCountriesCard
            title={isVietnamese ? 'Phân Bổ Kỹ Năng & Luyện Đề' : 'Sales by Skills & Countries'}
            subtitle={isVietnamese ? 'Tương tác học tập theo 4 kỹ năng' : 'Monthly Skills Overview'}
          />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <VuexyTotalEarningCard
            percentage="87%"
            growth="25.8%"
            totalRevenue={`+${vipUsersCount * 199}k đ`}
            totalSales={`+${totalCoursesCount * 450}k đ`}
            systemXp={totalSystemXp}
          />
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4">
          <VuexyMonthlyCampaignCard
            title={isVietnamese ? 'Chiến Dịch Gửi Tin & Nhắc Học' : 'Monthly Campaign State'}
            subtitle={isVietnamese ? '8.52k Lượt thông báo gửi đi' : '8.52k Social Visitors'}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-4">
          <VuexySourceVisitsCard
            title={isVietnamese ? 'Nguồn Truy Cập Học Tập' : 'Source Visits'}
            subtitle={isVietnamese ? '38.4k Lượt truy cập toàn hệ sinh thái' : '38.4k Visitors'}
          />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <VuexyProjectsTableCard
            courses={coursesData}
            isLoading={isLoadingCourses}
          />
        </div>
      </div>

      <DashboardRecentActivity
        activities={analytics?.recent_activities}
        onViewAll={() => navigate('/users')}
        onSelectUser={(userId) => navigate(`/users/${userId}`)}
        isVietnamese={isVietnamese}
      />
    </div>
  )
}
