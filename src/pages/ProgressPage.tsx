import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Crown,
  Sparkles,
  BookOpen,
  FileCheck,
  Database,
  TrendingUp,
  CalendarDays,
  Download,
  RotateCcw,
  BarChart2,
  Award,
  BrainCircuit,
  Layers,
  Search,
  Cpu,
  Flame,
  ShieldCheck,
  CheckCircle,
  Activity,
  Target,
  Clock,
  Smartphone,
  Monitor,
  Check,
  GraduationCap,
} from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { toast } from '@/store/toast-store'
import { userService } from '@/services/user.service'
import { courseService } from '@/services/course.service'
import { vocabularyService } from '@/services/vocabulary.service'
import { examService } from '@/services/exam.service'
import type { SystemAnalyticsOverview, UserActivityLog } from '@/types/api.types'
import {
  timeFilterOptions,
  activityTimeSeriesData,
  skillPerformanceData,
  toeicPartStats,
  toeicScoreOverview,
  aiModelUsageList,
  aiEvaluationCategories,
} from '@/data/statistics-data'

type AnalyticsTab = 'overview' | 'toeic' | 'ai' | 'logs'

export function ProgressPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [selectedTime, setSelectedTime] = useState('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartMetric, setChartMetric] = useState<'dau' | 'sessions' | 'minutesSpent' | 'xpGained'>('dau')

  const [analytics, setAnalytics] = useState<SystemAnalyticsOverview | null>(null)
  const [coursesCount, setCoursesCount] = useState<number>(0)
  const [vocabCount, setVocabCount] = useState<number>(0)
  const [examsCount, setExamsCount] = useState<number>(0)
  const [liveLogs, setLiveLogs] = useState<UserActivityLog[]>([])

  const [logSearch, setLogSearch] = useState('')
  const [logActionFilter, setLogActionFilter] = useState('ALL')
  const [logPage, setLogPage] = useState(1)
  const [logPageSize, setLogPageSize] = useState(10)

  const loadData = async () => {
    try {
      const [analyticsRes, coursesRes, vocabRes, examsRes] = await Promise.allSettled([
        userService.getSystemAnalytics(),
        courseService.getAllCourses(),
        vocabularyService.searchVocabulary(),
        examService.getExams(),
      ])

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalytics(analyticsRes.value)
        if (analyticsRes.value.recent_activities) {
          setLiveLogs(analyticsRes.value.recent_activities)
        }
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value) {
        setCoursesCount(coursesRes.value.length)
      }
      if (vocabRes.status === 'fulfilled' && vocabRes.value) {
        setVocabCount(vocabRes.value.length)
      }
      if (examsRes.status === 'fulfilled' && examsRes.value) {
        setExamsCount(examsRes.value.length)
      }
    } catch (err) {
      console.warn('Error loading progress analytics:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setIsRefreshing(false)
    toast.success(isVi ? 'Đã làm mới dữ liệu thống kê!' : 'Statistics data refreshed!')
  }

  const handleExportCSV = () => {
    const headers = 'ID,User,Action,Detail,ScoreOrXP,Platform,Time\n'
    const rows = liveLogs
      .map((l) => `${l.id},${l.userName},${l.actionNameVi},${l.detail},${l.scoreOrXP || ''},${l.platform},${l.timestamp}`)
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lingosphere-analytics-${selectedTime}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã xuất báo cáo CSV thành công!')
  }

  const filteredLogs = useMemo(() => {
    return liveLogs.filter((log) => {
      const matchSearch =
        log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.detail.toLowerCase().includes(logSearch.toLowerCase())
      const matchAction = logActionFilter === 'ALL' || log.actionType === logActionFilter
      return matchSearch && matchAction
    })
  }, [liveLogs, logSearch, logActionFilter])

  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * logPageSize
    return filteredLogs.slice(start, start + logPageSize)
  }, [filteredLogs, logPage, logPageSize])

  const dbEntityMetrics = useMemo(() => [
    {
      id: 'users',
      serviceName: 'User Service DB',
      labelVi: 'Tổng người dùng hệ thống',
      labelEn: 'Total Registered Users',
      count: analytics?.overview.total_users || 0,
      changePercent: 12.5,
      unit: 'người dùng',
      color: '#2f7f78',
    },
    {
      id: 'subscriptions',
      serviceName: 'User Service DB',
      labelVi: 'Tài khoản VIP / Premium',
      labelEn: 'Active VIP Subscribers',
      count: analytics?.overview.total_vip_users || 0,
      changePercent: 18.2,
      unit: 'tài khoản',
      color: '#d97706',
    },
    {
      id: 'vocabulary',
      serviceName: 'Vocabulary Service DB',
      labelVi: 'Từ vựng trong Từ điển',
      labelEn: 'Vocabulary Items',
      count: vocabCount,
      changePercent: 8.4,
      unit: 'mục từ',
      color: '#2563eb',
    },
    {
      id: 'toeic_questions',
      serviceName: 'Exam Service DB',
      labelVi: 'Ngân hàng đề TOEIC',
      labelEn: 'TOEIC Exam Bank',
      count: examsCount,
      changePercent: 14.1,
      unit: 'bộ đề',
      color: '#7c3aed',
    },
    {
      id: 'courses',
      serviceName: 'Course Service DB',
      labelVi: 'Khóa học hệ thống',
      labelEn: 'System Courses',
      count: coursesCount,
      changePercent: 15.0,
      unit: 'khóa học',
      color: '#059669',
    },
    {
      id: 'xp',
      serviceName: 'Gamification Engine',
      labelVi: 'Tổng XP người dùng đạt được',
      labelEn: 'Total System XP',
      count: analytics?.overview.total_system_xp || 0,
      changePercent: 24.6,
      unit: 'XP',
      color: '#ec4899',
    },
  ], [analytics, vocabCount, examsCount, coursesCount])

  const maxChartValue = useMemo(() => {
    return Math.max(...activityTimeSeriesData.map((d) => d[chartMetric])) * 1.15
  }, [chartMetric])

  const logColumns: DataTableColumn<UserActivityLog>[] = [
    {
      key: 'user',
      title: 'Học viên',
      render: (log) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {log.userAvatar ? (
              <img src={log.userAvatar} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              log.userName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{log.userName}</p>
            <p className="text-[11px] text-slate-500">{log.userEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      title: 'Hoạt động',
      render: (log) => {
        const map: Record<string, { label: string; color: string }> = {
          TOEIC_TEST: { label: 'Luyện thi TOEIC', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
          VOCAB_STUDY: { label: 'Học Từ Vựng', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
          AI_CHAT: { label: 'Luyện Nói AI', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
          LESSON_COMPLETED: { label: 'Hoàn thành bài học', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
          PREMIUM_UPGRADE: { label: 'Nâng cấp Premium', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
        }
        const badge = map[log.actionType] || { label: log.actionNameVi, color: 'bg-slate-500/10 text-slate-500' }
        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
            {badge.label}
          </span>
        )
      },
    },
    {
      key: 'detail',
      title: 'Nội dung chi tiết',
      dataIndex: 'detail',
    },
    {
      key: 'scoreOrXP',
      title: 'Kết quả / Điểm thưởng',
      render: (log) => (
        <span className="font-extrabold text-teal-600 dark:text-teal-400 flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          {log.scoreOrXP}
        </span>
      ),
    },
    {
      key: 'platform',
      title: 'Nền tảng',
      render: (log) => (
        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
          {log.platform === 'iOS' || log.platform === 'Android' ? (
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
          )}
          {log.platform}
        </span>
      ),
    },
    {
      key: 'timestamp',
      title: 'Thời gian',
      dataIndex: 'timestamp',
    },
  ]

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Thống Kê Dữ Liệu & Báo Cáo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phân tích toàn diện hoạt động người học, các chỉ số biểu đồ, hiệu năng AI và dữ liệu hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="bg-transparent border-0 outline-none text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer pr-2"
            >
              {timeFilterOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-white dark:bg-slate-900">
                  {isVi ? opt.labelVi : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-500' : ''}`} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dbEntityMetrics.map((metric) => (
          <div
            key={metric.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex items-start justify-between"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {metric.serviceName}
              </span>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1">
                  {isVi ? metric.labelVi : metric.labelEn}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {metric.count.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-[11px] text-slate-500">{metric.unit}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{metric.changePercent}% so với tháng trước</span>
              </div>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: `${metric.color}18`, color: metric.color }}
            >
              {metric.id === 'users' && <Users className="w-6 h-6" />}
              {metric.id === 'subscriptions' && <Crown className="w-6 h-6" />}
              {metric.id === 'vocabulary' && <BookOpen className="w-6 h-6" />}
              {metric.id === 'toeic_questions' && <FileCheck className="w-6 h-6" />}
              {metric.id === 'ai_evaluations' && <Sparkles className="w-6 h-6" />}
              {metric.id === 'rag_vectors' && <Database className="w-6 h-6" />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Tổng quan Hoạt động</span>
        </button>

        <button
          onClick={() => setActiveTab('toeic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'toeic'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Phân tích TOEIC & Kỹ năng</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Hiệu năng AI & Qdrant</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Nhật ký Hoạt động</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Biểu Đồ Xu Hướng Hoạt Động (14 Ngày Gần Nhất)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Theo dõi lượng người học trực tuyến mỗi ngày (DAU), phiên học, số phút học và kinh nghiệm XP
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                {(
                  [
                    { key: 'dau', label: 'DAU (Người dùng)' },
                    { key: 'sessions', label: 'Phiên học' },
                    { key: 'minutesSpent', label: 'Số phút' },
                    { key: 'xpGained', label: 'Tổng XP' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setChartMetric(m.key)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      chartMetric === m.key
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 px-2">
              {activityTimeSeriesData.map((item) => {
                const val = item[chartMetric]
                const heightPercent = Math.min(100, Math.max(12, (val / maxChartValue) * 100))
                return (
                  <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val.toLocaleString('vi-VN')}
                    </span>
                    <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden h-full flex items-end p-0.5">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-lg bg-gradient-to-t from-indigo-600 to-teal-400 group-hover:from-indigo-500 group-hover:to-teal-300 transition-all duration-300 shadow-xs"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{item.dayLabel}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Chỉ Số Streak & Phân Bố Level
                  </h3>
                </div>
                <span className="text-xs font-bold text-orange-500">
                  Trung bình {analytics?.overview.avg_user_streak || 0} ngày
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { range: 'Level 1–5 (Beginner)', count: Math.round((analytics?.overview.total_users || 0) * 0.45), percent: 45 },
                  { range: 'Level 6–10 (Intermediate)', count: Math.round((analytics?.overview.total_users || 0) * 0.35), percent: 35 },
                  { range: 'Level 11–20 (Advanced)', count: Math.round((analytics?.overview.total_users || 0) * 0.15), percent: 15 },
                  { range: 'Level 21+ (Master)', count: Math.round((analytics?.overview.total_users || 0) * 0.05), percent: 5 },
                ].map((lvl) => (
                  <div key={lvl.range} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{lvl.range}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {lvl.count.toLocaleString('vi-VN')} học viên ({lvl.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${lvl.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Nền Tảng & Thiết Bị Truy Cập
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { device: 'WEB', labelVi: 'Trình duyệt Web (Desktop)', count: Math.round((analytics?.overview.total_users || 0) * 0.58), percent: 58 },
                  { device: 'MOBILE_IOS', labelVi: 'iOS App (iPhone / iPad)', count: Math.round((analytics?.overview.total_users || 0) * 0.28), percent: 28 },
                  { device: 'MOBILE_ANDROID', labelVi: 'Android App', count: Math.round((analytics?.overview.total_users || 0) * 0.14), percent: 14 },
                ].map((dev) => (
                  <div key={dev.device} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        {dev.device.includes('MOBILE') ? <Smartphone className="w-3.5 h-3.5 text-slate-400" /> : <Monitor className="w-3.5 h-3.5 text-slate-400" />}
                        {dev.labelVi}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {dev.count.toLocaleString('vi-VN')} ({dev.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${dev.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'toeic' && (
        <div className="space-y-6">

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Tỷ Lệ Trả Lời Đúng Từng Part TOEIC (Part 1 - Part 7)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Thống kê độ chính xác trung bình trên 81 bộ đề thi và 32,400 lượt làm bài của học viên
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {toeicPartStats.map((part) => (
                <div
                  key={part.partNumber}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                      {part.partNameVi}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {part.section}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Độ chính xác</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{part.avgAccuracyPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${part.avgAccuracyPercent}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-right">
                    {part.totalQuestionsAttempted.toLocaleString('vi-VN')} câu đã nộp
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {skillPerformanceData.map((skill) => (
              <div
                key={skill.skillId}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{skill.skillNameVi}</h3>
                  <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">
                    {skill.avgAccuracyPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-600"
                    style={{ width: `${skill.avgAccuracyPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{skill.attemptsCount.toLocaleString('vi-VN')} lượt luyện</span>
                  <span>{skill.avgTimeSpentMin} phút/bài</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Mô Hình AI & Thời Gian Phản Hồi (Latency)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Theo dõi lượt gọi API, thời gian trễ và tỷ lệ phản hồi chính xác của hệ thống AI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {aiModelUsageList.map((model) => (
                <div
                  key={model.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{model.modelName}</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {model.isPrimary ? 'Mô hình chính' : 'Hỗ trợ'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Lượt gọi API:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        {model.totalRequests.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Độ trễ trung bình:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{model.avgLatencyMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tỷ lệ thành công:</span>
                      <span className="font-bold text-emerald-500">{model.successRatePercent}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiEvaluationCategories.map((cat) => (
              <div
                key={cat.category}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{cat.labelVi}</span>
                  <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                    {cat.helpfulRatingPercent}% hài lòng
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Điểm trung bình:</span>
                  <span className="font-bold text-amber-500">{cat.avgScore}/5.0 ⭐</span>
                </div>
                <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 pt-1">
                  {cat.totalEvaluations.toLocaleString('vi-VN')} lượt xử lý
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <DataTable<UserActivityLog>
          columns={logColumns}
          data={paginatedLogs}
          rowKey={(l) => l.id}
          onResetFilters={() => {
            setLogSearch('')
            setLogActionFilter('ALL')
            setLogPage(1)
          }}
          filterSlot={
            <>
              <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc chi tiết..."
                  className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
                />
              </div>

              <select
                value={logActionFilter}
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">Tất cả loại hoạt động</option>
                <option value="TOEIC_TEST">Thi TOEIC</option>
                <option value="VOCAB_STUDY">Học Từ Vựng</option>
                <option value="AI_CHAT">Luyện Nói AI</option>
                <option value="LESSON_COMPLETED">Hoàn thành bài học</option>
                <option value="PREMIUM_UPGRADE">Nâng cấp VIP</option>
              </select>
            </>
          }
          pagination={{
            currentPage: logPage,
            pageSize: logPageSize,
            totalItems: filteredLogs.length,
            onPageChange: setLogPage,
            onPageSizeChange: (size) => {
              setLogPageSize(size)
              setLogPage(1)
            },
          }}
        />
      )}
    </div>
  )
}
