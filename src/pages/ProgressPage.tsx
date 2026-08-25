import { useState, useMemo, useRef, useEffect } from 'react'
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
  RefreshCw,
  BarChart2,
  Award,
  BrainCircuit,
  Layers,
  Search,
  Cpu,
  Flame,
  ShieldCheck,
  ChevronDown,
  Check,
  GraduationCap,
  Activity,
  ThumbsUp,
  ChevronRight,
  Target,
  Mic,
  BookOpenCheck,
  RotateCcw,
  Settings2,
  X,
  Filter,
  CheckCircle,
  ChevronUp,
  ChevronsUpDown,
} from 'lucide-react'

import { Pagination } from '@/components/common/Pagination'
import { useAdminStore } from '@/store/admin-store'
import {
  timeFilterOptions,
  dbEntityMetrics,
  activityTimeSeriesData,
  gamificationStats,
  skillPerformanceData,
  toeicPartStats,
  toeicScoreOverview,
  aiModelUsageList,
  aiEvaluationCategories,
  aiRecommendationStats,
  mockAIEvaluationLogs,
  recentUserActivityLogs,
} from '../data/statistics-data'

function DensityIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 1L5.5 3.5H10.5L8 1Z" fill="currentColor" />
      <rect x="2" y="4.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
      <rect x="2" y="10" width="12" height="1.5" rx="0.75" fill="currentColor" />
      <path d="M8 15L5.5 12.5H10.5L8 15Z" fill="currentColor" />
    </svg>
  )
}

function ActionTypeFilterHeader({
  isVi, filterType, setFilterType, setCurrentPage,
}: {
  isVi: boolean;
  filterType: string;
  setFilterType: (v: string) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const OPTIONS = [
    { value: 'ALL', labelVi: 'Tất cả hoạt động', labelEn: 'All Activities' },
    { value: 'TOEIC_TEST', labelVi: 'Thi TOEIC', labelEn: 'TOEIC Test' },
    { value: 'VOCAB_STUDY', labelVi: 'Học Từ Vựng', labelEn: 'Vocab Study' },
    { value: 'AI_CHAT', labelVi: 'Luyện AI', labelEn: 'AI Chat' },
    { value: 'LESSON_COMPLETED', labelVi: 'Bài Học', labelEn: 'Lesson' },
    { value: 'PREMIUM_UPGRADE', labelVi: 'Nâng Cấp VIP', labelEn: 'Premium Upgrade' },
  ];

  const current = OPTIONS.find((o) => o.value === filterType);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterType !== 'ALL' ? ' active' : ''}${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? current?.labelVi : current?.labelEn}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterType === opt.value ? ' active' : ''}`}
              onClick={() => {
                setFilterType(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterType === opt.value && <CheckCircle className="th-filter-check" />}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformFilterHeader({
  isVi, filterPlatform, setFilterPlatform, setCurrentPage,
}: {
  isVi: boolean;
  filterPlatform: string;
  setFilterPlatform: (v: string) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const OPTIONS = [
    { value: 'ALL', labelVi: 'Tất cả nền tảng', labelEn: 'All Platforms' },
    { value: 'Web', labelVi: 'Web', labelEn: 'Web' },
    { value: 'iOS', labelVi: 'iOS', labelEn: 'iOS' },
    { value: 'Android', labelVi: 'Android', labelEn: 'Android' },
  ];

  const current = OPTIONS.find((o) => o.value === filterPlatform);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterPlatform !== 'ALL' ? ' active' : ''}${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? (current?.value === 'ALL' ? 'Nền tảng' : current?.labelVi) : (current?.value === 'ALL' ? 'Platform' : current?.labelEn)}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterPlatform === opt.value ? ' active' : ''}`}
              onClick={() => {
                setFilterPlatform(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterPlatform === opt.value && <CheckCircle className="th-filter-check" />}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusFilterHeader({
  isVi, filterStatus, setFilterStatus, setCurrentPage,
}: {
  isVi: boolean;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  setCurrentPage: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const OPTIONS = [
    { value: 'ALL', labelVi: 'Tất cả', labelEn: 'All' },
    { value: 'SUCCESS', labelVi: 'Thành công', labelEn: 'Success' },
    { value: 'COMPLETED', labelVi: 'Hoàn thành', labelEn: 'Completed' },
    { value: 'FAILED', labelVi: 'Thất bại', labelEn: 'Failed' },
  ];

  const current = OPTIONS.find((o) => o.value === filterStatus);

  return (
    <div className="th-filter-wrapper" ref={ref}>
      <button
        type="button"
        className={`th-filter-btn${filterStatus !== 'ALL' ? ' active' : ''}${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {isVi ? (current?.value === 'ALL' ? 'Trạng thái' : current?.labelVi) : (current?.value === 'ALL' ? 'Status' : current?.labelEn)}
        <Filter className="th-filter-icon" />
      </button>
      {open && (
        <div className="th-filter-dropdown">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`th-filter-option${filterStatus === opt.value ? ' active' : ''}`}
              onClick={() => {
                setFilterStatus(opt.value);
                setCurrentPage(1);
                setOpen(false);
              }}
            >
              {filterStatus === opt.value && <CheckCircle className="th-filter-check" />}
              {isVi ? opt.labelVi : opt.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type ActiveTab = 'overview' | 'learning' | 'ai' | 'database'

export function ProgressPage() {
  const { t, i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [selectedTimeFilter, setSelectedTimeFilter] = useState(timeFilterOptions[2]) 
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [customFromDate, setCustomFromDate] = useState('')
  const [customToDate, setCustomToDate] = useState('')
  const timeDropdownRef = useRef<HTMLDivElement>(null)
  const [aiSearchQuery, setAiSearchQuery] = useState('')
  const [aiTypeFilter, setAiTypeFilter] = useState<string>('ALL')

  const [activitySearchQuery, setActivitySearchQuery] = useState('')
  const [activityTypeFilter, setActivityTypeFilter] = useState('ALL')
  const [activityPlatformFilter, setActivityPlatformFilter] = useState('ALL')
  const [activityStatusFilter, setActivityStatusFilter] = useState('ALL')
  const [activityFromDate, setActivityFromDate] = useState('')
  const [activityToDate, setActivityToDate] = useState('')
  const [activityPage, setActivityPage] = useState(1)
  const [activityPageSize, setActivityPageSize] = useState(5)
  const [activityDensity, setActivityDensity] = useState<'compact' | 'middle' | 'comfortable'>('middle')
  const [activityUserSort, setActivityUserSort] = useState<'asc' | 'desc' | null>(null)
  const [showActivityDensityMenu, setShowActivityDensityMenu] = useState(false)
  const [showActivityColSettings, setShowActivityColSettings] = useState(false)

  const [toeicSectionFilter, setToeicSectionFilter] = useState('ALL')
  const toeicSectionRef = useRef<HTMLDivElement>(null)
  const [showToeicSectionFilter, setShowToeicSectionFilter] = useState(false)
  const [toeicPartFilter, setToeicPartFilter] = useState('ALL')
  const toeicPartRef = useRef<HTMLDivElement>(null)
  const [showToeicPartFilter, setShowToeicPartFilter] = useState(false)
  const [toeicAttemptSort, setToeicAttemptSort] = useState<'asc' | 'desc' | null>(null)
  const [toeicAccuracySort, setToeicAccuracySort] = useState<'asc' | 'desc' | null>(null)
  const [toeicWeakSort, setToeicWeakSort] = useState<'asc' | 'desc' | null>(null)

  const actDensityRef = useRef<HTMLDivElement>(null)
  const actColRef = useRef<HTMLDivElement>(null)

  const [activityColumns, setActivityColumns] = useState([
    { key: 'user', labelVi: 'Học viên', labelEn: 'Learner', visible: true },
    { key: 'activity', labelVi: 'Hoạt động', labelEn: 'Activity', visible: true },
    { key: 'detail', labelVi: 'Chi tiết', labelEn: 'Details', visible: true },
    { key: 'platform', labelVi: 'Nền tảng', labelEn: 'Platform', visible: true },
    { key: 'xp', labelVi: 'XP / Điểm', labelEn: 'XP / Score', visible: true },
    { key: 'time', labelVi: 'Thời gian', labelEn: 'Time', visible: true },
    { key: 'status', labelVi: 'Trạng thái', labelEn: 'Status', visible: true },
  ])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actDensityRef.current && !actDensityRef.current.contains(e.target as Node)) {
        setShowActivityDensityMenu(false)
      }
      if (actColRef.current && !actColRef.current.contains(e.target as Node)) {
        setShowActivityColSettings(false)
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setShowTimeDropdown(false)
      }
      if (toeicSectionRef.current && !toeicSectionRef.current.contains(e.target as Node)) {
        setShowToeicSectionFilter(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredActivityLogs = useMemo(() => {
    let result = recentUserActivityLogs.filter((log) => {
      const matchesQuery =
        log.userName.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
        log.actionNameVi.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
        log.detail.toLowerCase().includes(activitySearchQuery.toLowerCase())

      const matchesType = activityTypeFilter === 'ALL' || log.actionType === activityTypeFilter
      const matchesPlatform = activityPlatformFilter === 'ALL' || log.platform === activityPlatformFilter
      const matchesStatus = activityStatusFilter === 'ALL' || log.status === activityStatusFilter

      return matchesQuery && matchesType && matchesPlatform && matchesStatus
    })

    if (activityUserSort) {
      result = [...result].sort((a, b) => {
        const nameA = a.userName.toLowerCase()
        const nameB = b.userName.toLowerCase()
        if (activityUserSort === 'asc') {
          return nameA.localeCompare(nameB)
        } else {
          return nameB.localeCompare(nameA)
        }
      })
    }

    return result
  }, [activitySearchQuery, activityTypeFilter, activityPlatformFilter, activityStatusFilter, activityUserSort])

  const paginatedActivityLogs = useMemo(() => {
    const start = (activityPage - 1) * activityPageSize
    return filteredActivityLogs.slice(start, start + activityPageSize)
  }, [filteredActivityLogs, activityPage, activityPageSize])

  const filteredToeicParts = useMemo(() => {
    let result = toeicPartStats

    if (toeicSectionFilter !== 'ALL') {
      result = result.filter(part => part.section === toeicSectionFilter)
    }

    if (toeicPartFilter !== 'ALL') {
      result = result.filter(part => part.partNumber === parseInt(toeicPartFilter))
    }

    if (toeicAttemptSort) {
      result = [...result].sort((a, b) =>
        toeicAttemptSort === 'asc'
          ? a.totalQuestionsAttempted - b.totalQuestionsAttempted
          : b.totalQuestionsAttempted - a.totalQuestionsAttempted
      )
    }

    if (toeicAccuracySort) {
      result = [...result].sort((a, b) =>
        toeicAccuracySort === 'asc'
          ? a.avgAccuracyPercent - b.avgAccuracyPercent
          : b.avgAccuracyPercent - a.avgAccuracyPercent
      )
    }

    if (toeicWeakSort) {
      result = [...result].sort((a, b) =>
        toeicWeakSort === 'asc'
          ? a.weakTopicCount - b.weakTopicCount
          : b.weakTopicCount - a.weakTopicCount
      )
    }

    return result
  }, [toeicSectionFilter, toeicPartFilter, toeicAttemptSort, toeicAccuracySort, toeicWeakSort])

  const uniqueParts = useMemo(() => {
    return [...new Set(toeicPartStats.map(p => p.partNumber))].sort((a, b) => a - b)
  }, [])

  const handleResetActivity = () => {
    setActivitySearchQuery('')
    setActivityTypeFilter('ALL')
    setActivityPlatformFilter('ALL')
    setActivityFromDate('')
    setActivityToDate('')
    setActivityPage(1)
    setActivityDensity('middle')
  }

  const handleExportActivityCsv = () => {
    const headers = ['user_name', 'email', 'action', 'detail', 'platform', 'score_xp', 'status', 'timestamp']
    const rows = filteredActivityLogs.map((log) => [
      log.userName,
      log.userEmail,
      log.actionNameVi,
      log.detail,
      log.platform,
      log.scoreOrXP,
      log.status,
      log.timestamp,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `user-activities-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const toggleActivityColumn = (key: string) => {
    setActivityColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    )
  }

  const isActColVisible = (key: string) => activityColumns.find((c) => c.key === key)?.visible ?? true

  const filteredTimeSeries = useMemo(() => {
    if (selectedTimeFilter.id === 'custom') {
      if (!customFromDate || !customToDate) return activityTimeSeriesData.slice(-30)
      const from = new Date(customFromDate)
      const to = new Date(customToDate)
      return activityTimeSeriesData.filter(d => {
        const date = new Date(d.dateStr)
        return date >= from && date <= to
      })
    }
    const limit = selectedTimeFilter.days
    return activityTimeSeriesData.slice(-limit)
  }, [selectedTimeFilter, customFromDate, customToDate])

  const timeSeriesTotals = useMemo(() => {
    const totalDau = Math.round(filteredTimeSeries.reduce((acc, c) => acc + c.dau, 0) / filteredTimeSeries.length)
    const totalSessions = filteredTimeSeries.reduce((acc, c) => acc + c.sessions, 0)
    const totalMinutes = filteredTimeSeries.reduce((acc, c) => acc + c.minutesSpent, 0)
    const totalXp = filteredTimeSeries.reduce((acc, c) => acc + c.xpGained, 0)
    const totalNewUsers = filteredTimeSeries.reduce((acc, c) => acc + c.newUsers, 0)

    return {
      avgDau: totalDau.toLocaleString('en-US'),
      totalSessions: totalSessions.toLocaleString('en-US'),
      totalHours: Math.round(totalMinutes / 60).toLocaleString('en-US'),
      totalXpM: (totalXp / 1000000).toFixed(2) + 'M',
      totalNewUsers: totalNewUsers.toLocaleString('en-US'),
    }
  }, [filteredTimeSeries])

  const filteredAiLogs = useMemo(() => {
    return mockAIEvaluationLogs.filter((log) => {
      const matchQuery =
        log.userName.toLowerCase().includes(aiSearchQuery.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(aiSearchQuery.toLowerCase()) ||
        log.score.toLowerCase().includes(aiSearchQuery.toLowerCase())

      const matchType = aiTypeFilter === 'ALL' || log.evaluationType === aiTypeFilter

      return matchQuery && matchType
    })
  }, [aiSearchQuery, aiTypeFilter])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <main className="page-content statistics-page">
      
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('page.progress.title')}</h1>
          <p className="page-subtitle">{t('page.progress.subtitle')}</p>
        </div>

        <div className="heading-actions">
          
          <button
            className={`icon-button${isRefreshing ? ' spinning' : ''}`}
            type="button"
            onClick={handleRefresh}
            title={isVietnamese ? 'Làm mới dữ liệu' : 'Refresh data'}
          >
            <RefreshCw className="icon" />
          </button>

          <div className="date-picker-wrapper" style={{ position: 'relative' }} ref={timeDropdownRef}>
            <button
              className="date-control"
              type="button"
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            >
              <CalendarDays className="icon" />
              <span>
                {selectedTimeFilter.id === 'custom'
                  ? `${customFromDate || '...'} - ${customToDate || '...'}`
                  : (isVietnamese ? selectedTimeFilter.labelVi : selectedTimeFilter.labelEn)}
              </span>
              <ChevronDown className="icon" style={{ width: 14, height: 14 }} />
            </button>

            {showTimeDropdown && (
              <div className="date-picker-dropdown" style={{ minWidth: '220px' }}>
                {timeFilterOptions.filter(opt => opt.id !== 'custom').map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`date-picker-option${selectedTimeFilter.id === opt.id ? ' selected' : ''}`}
                    onClick={() => {
                      setSelectedTimeFilter(opt)
                      setShowTimeDropdown(false)
                    }}
                  >
                    <span>{isVietnamese ? opt.labelVi : opt.labelEn}</span>
                    {selectedTimeFilter.id === opt.id && <Check className="check-icon" />}
                  </button>
                ))}
                <div className="date-picker-divider" />
                <div className="date-picker-custom">
                  <span className="date-picker-custom-label">{isVietnamese ? 'Tùy chỉnh khoảng thời gian' : 'Custom date range'}</span>
                  <div className="date-picker-custom-inputs">
                    <input
                      type="date"
                      className="toolbar-date-input"
                      value={customFromDate}
                      onChange={(e) => {
                        setCustomFromDate(e.target.value)
                        if (e.target.value && customToDate) {
                          setSelectedTimeFilter({ id: 'custom', labelVi: 'Tùy chỉnh', labelEn: 'Custom', days: 0 })
                        }
                      }}
                      placeholder={isVietnamese ? 'Từ ngày' : 'From date'}
                    />
                    <span className="date-range-sep">~</span>
                    <input
                      type="date"
                      className="toolbar-date-input"
                      value={customToDate}
                      onChange={(e) => {
                        setCustomToDate(e.target.value)
                        if (customFromDate && e.target.value) {
                          setSelectedTimeFilter({ id: 'custom', labelVi: 'Tùy chỉnh', labelEn: 'Custom', days: 0 })
                        }
                      }}
                      placeholder={isVietnamese ? 'Đến ngày' : 'To date'}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="primary-button" type="button">
            <Download className="icon" />
            <span>{isVietnamese ? 'Xuất Báo Cáo' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      <section className="kpi-grid stats-kpi-grid">
        {dbEntityMetrics.map((item) => {
          return (
            <article key={item.id} className="kpi-card stats-kpi-card">
              <div className="kpi-top">
                <span className="kpi-icon-badge" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                  <MetricIcon iconName={item.iconName} />
                </span>
                <span className="delta up">
                  <TrendingUp className="icon-sm" />
                  +{item.changePercent}%
                </span>
              </div>
              <p className="kpi-label">{isVietnamese ? item.labelVi : item.labelEn}</p>
              <div className="kpi-value-row">
                <span className="kpi-value">{item.count.toLocaleString('en-US')}</span>
                <span className="kpi-unit">{item.unit}</span>
              </div>
              <p className="kpi-service-tag">{item.serviceName}</p>
            </article>
          )
        })}
      </section>

      <nav className="stats-tabs-nav" aria-label="Statistics Sections">
        <button
          className={`stats-tab-btn${activeTab === 'overview' ? ' active' : ''}`}
          onClick={() => setActiveTab('overview')}
          type="button"
        >
          <Activity className="icon" />
          <span>Hoạt Động Người Dùng</span>
        </button>

        <button
          className={`stats-tab-btn${activeTab === 'learning' ? ' active' : ''}`}
          onClick={() => setActiveTab('learning')}
          type="button"
        >
          <GraduationCap className="icon" />
          <span>Tiến Độ Học Tập & TOEIC</span>
        </button>

        <button
          className={`stats-tab-btn${activeTab === 'ai' ? ' active' : ''}`}
          onClick={() => setActiveTab('ai')}
          type="button"
        >
          <Sparkles className="icon" />
          <span>Hiệu Năng & Chi Phí AI</span>
        </button>

        <button
          className={`stats-tab-btn${activeTab === 'database' ? ' active' : ''}`}
          onClick={() => setActiveTab('database')}
          type="button"
        >
          <Database className="icon" />
          <span>Cơ Sở Dữ Liệu Microservices</span>
        </button>
      </nav>

      {activeTab === 'overview' && (
        <div className="tab-content-container overview-tab">
          
          <article className="card chart-card full-width-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Biểu đồ Hoạt động Học tập & Tương tác</h2>
                <p className="card-meta">
                  Thống kê tổng số Sessions, Người dùng hoạt động (DAU), Giờ học và XP tích lũy ({selectedTimeFilter.labelVi})
                </p>
              </div>
              <div className="chart-stats-summary-pills">
                <div className="pill-item">
                  <span className="pill-label">DAU Trung bình</span>
                  <span className="pill-value">{timeSeriesTotals.avgDau}</span>
                </div>
                <div className="pill-item">
                  <span className="pill-label">Tổng Sessions</span>
                  <span className="pill-value">{timeSeriesTotals.totalSessions}</span>
                </div>
                <div className="pill-item">
                  <span className="pill-label">Tổng Giờ Học</span>
                  <span className="pill-value">{timeSeriesTotals.totalHours} hrs</span>
                </div>
                <div className="pill-item">
                  <span className="pill-label">XP Tích Lũy</span>
                  <span className="pill-value">{timeSeriesTotals.totalXpM}</span>
                </div>
              </div>
            </div>

            <div className="chart-wrap stats-chart-wrap">
              <ActivityBarChart items={filteredTimeSeries} />
            </div>
          </article>

          <div className="stats-two-col-grid">
            
            <article className="card gamification-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Streak & Cấp Độ Người Học</h2>
                </div>
              </div>

              <div className="gamification-highlights">
                <div className="gami-stat-box">
                  <span className="gami-stat-val">{gamificationStats.averageStreak} ngày</span>
                  <span className="gami-stat-lbl">Streak trung bình</span>
                </div>
                <div className="gami-stat-box">
                  <span className="gami-stat-val">{gamificationStats.longestStreakRecord} ngày</span>
                  <span className="gami-stat-lbl">Kỷ lục Streak dài nhất</span>
                </div>
                <div className="gami-stat-box">
                  <span className="gami-stat-val">{gamificationStats.activeStreakUsersPercent}%</span>
                  <span className="gami-stat-lbl">Tỷ lệ duy trì Streak hàng ngày</span>
                </div>
              </div>

              <div className="distribution-section">
                <h3 className="section-subtitle">Phân bổ cấp độ (Level Distribution):</h3>
                <div className="dist-list">
                  {gamificationStats.levelDistribution.map((item, idx) => (
                    <div key={idx} className="dist-item">
                      <div className="dist-header">
                        <span className="dist-name">{item.range}</span>
                        <span className="dist-val">{item.count.toLocaleString()} người ({item.percent}%)</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill teal" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="card device-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Thiết Bị Nền Tảng Truy Cập</h2>
                </div>
              </div>

              <DeviceDonutChart data={gamificationStats.deviceDistribution} />

              <div className="device-footnote">
                <ShieldCheck className="icon-sm" style={{ color: 'var(--success)' }} />
                <span>Dữ liệu đồng bộ realtime từ hệ thống xác thực.</span>
              </div>
            </article>
          </div>

          <div className="activity-log-section">
            <div className="users-toolbar">
            <div className="users-search">
              <Search className="search-icon" />
              <input
                type="text"
                className="users-search-input"
                placeholder={isVietnamese ? 'Tìm kiếm người dùng, email, hoạt động...' : 'Search user, email, activity...'}
                value={activitySearchQuery}
                onChange={(e) => {
                  setActivitySearchQuery(e.target.value)
                  setActivityPage(1)
                }}
              />
              {activitySearchQuery && (
                <button className="search-clear" onClick={() => { setActivitySearchQuery(''); setActivityPage(1) }}>
                  <X />
                </button>
              )}
            </div>

            <div className="toolbar-date-range">
              <span className="date-range-label">{isVietnamese ? 'Thời gian:' : 'Time:'}</span>
              <div className="toolbar-date-inputs">
                <input
                  type="date"
                  className="toolbar-date-input"
                  value={activityFromDate}
                  onChange={(e) => {
                    setActivityFromDate(e.target.value)
                    setActivityPage(1)
                  }}
                />
                <span className="date-range-sep">~</span>
                <input
                  type="date"
                  className="toolbar-date-input"
                  value={activityToDate}
                  onChange={(e) => {
                    setActivityToDate(e.target.value)
                    setActivityPage(1)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="admin-table-actions">
            <h2 className="admin-table-title">
              {isVietnamese ? 'Nhật ký hoạt động người dùng' : 'User Activity Logs'}
              <span className="admin-table-count">{filteredActivityLogs.length}</span>
            </h2>
            <div className="admin-table-action-buttons">
              
              <button type="button" className="table-ghost-btn" onClick={handleExportActivityCsv}>
                <Download />
                {isVietnamese ? 'Xuất CSV' : 'Export'}
                <ChevronDown />
              </button>

              <button
                type="button"
                className="table-ghost-btn"
                onClick={handleResetActivity}
                title={isVietnamese ? 'Đặt lại tất cả' : 'Reset all'}
              >
                <RotateCcw />
                {isVietnamese ? 'Đặt lại' : 'Reset'}
              </button>

              <div className="protable-tool-wrapper" ref={actDensityRef}>
                <button
                  type="button"
                  className={`table-ghost-btn${showActivityDensityMenu ? ' active' : ''}`}
                  onClick={() => setShowActivityDensityMenu(!showActivityDensityMenu)}
                  title={isVietnamese ? 'Tỉ trọng hàng' : 'Row density'}
                >
                  <DensityIcon />
                  {isVietnamese
                    ? activityDensity === 'compact' ? 'Nhỏ gọn' : activityDensity === 'middle' ? 'Vừa' : 'Thoải mái'
                    : activityDensity}
                </button>
                {showActivityDensityMenu && (
                  <div className="protable-dropdown">
                    <div className="protable-dropdown-title">{isVietnamese ? 'Tỉ trọng hàng' : 'Row Density'}</div>
                    {(['compact', 'middle', 'comfortable'] as const).map((d) => (
                      <button
                        key={d}
                        className={`protable-dropdown-item${activityDensity === d ? ' active' : ''}`}
                        onClick={() => { setActivityDensity(d); setShowActivityDensityMenu(false) }}
                      >
                        {isVietnamese ? (d === 'compact' ? 'Nhỏ gọn' : d === 'middle' ? 'Vừa' : 'Thoải mái') : d}
                        {activityDensity === d && <CheckCircle className="dropdown-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="protable-tool-wrapper" ref={actColRef}>
                <button
                  type="button"
                  className={`table-ghost-btn${showActivityColSettings ? ' active' : ''}`}
                  onClick={() => setShowActivityColSettings(!showActivityColSettings)}
                  title={isVietnamese ? 'Cài đặt cột' : 'Column settings'}
                >
                  <Settings2 />
                  {isVietnamese ? 'Cột' : 'Columns'}
                  {activityColumns.filter((c) => c.visible).length < activityColumns.length && (
                    <span className="col-badge">
                      {activityColumns.filter((c) => c.visible).length}/{activityColumns.length}
                    </span>
                  )}
                </button>
                {showActivityColSettings && (
                  <div className="protable-dropdown col-settings-dropdown">
                    <div className="protable-dropdown-title">{isVietnamese ? 'Cài đặt cột' : 'Column Settings'}</div>
                    {activityColumns.map((col) => (
                      <label key={col.key} className="col-settings-item">
                        <input
                          type="checkbox"
                          checked={col.visible}
                          onChange={() => toggleActivityColumn(col.key)}
                        />
                        <span>{isVietnamese ? col.labelVi : col.labelEn}</span>
                      </label>
                    ))}
                    <div className="protable-dropdown-footer">
                      <button
                        className="col-reset-btn"
                        onClick={() => setActivityColumns(activityColumns.map((c) => ({ ...c, visible: true })))}
                      >
                        {isVietnamese ? 'Đặt lại mặc định' : 'Reset to default'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="users-table-wrapper">
            <table className={`users-table density-${activityDensity}`}>
              <thead>
                <tr>
                  {isActColVisible('user') && (
                    <th className="th-with-filter">
                      <div className="th-filter-wrapper">
                        <button
                          type="button"
                          className={`th-filter-btn${activityUserSort ? ' active' : ''}`}
                          onClick={() => {
                            if (activityUserSort === 'asc') {
                              setActivityUserSort('desc')
                            } else if (activityUserSort === 'desc') {
                              setActivityUserSort(null)
                            } else {
                              setActivityUserSort('asc')
                            }
                            setActivityPage(1)
                          }}
                        >
                          {isVietnamese ? 'Học viên' : 'Learner'}
                          {activityUserSort === 'asc' && <ChevronUp className="th-filter-icon" />}
                          {activityUserSort === 'desc' && <ChevronUp className="th-filter-icon" style={{ transform: 'rotate(180deg)' }} />}
                          {!activityUserSort && <ChevronsUpDown className="th-filter-icon" />}
                        </button>
                      </div>
                    </th>
                  )}
                  {isActColVisible('activity') && (
                    <th className="th-with-filter">
                      <ActionTypeFilterHeader
                        isVi={isVietnamese}
                        filterType={activityTypeFilter}
                        setFilterType={setActivityTypeFilter}
                        setCurrentPage={setActivityPage}
                      />
                    </th>
                  )}
                  {isActColVisible('detail') && <th>{isVietnamese ? 'Chi tiết' : 'Details'}</th>}
                  {isActColVisible('platform') && (
                    <th className="th-with-filter">
                      <PlatformFilterHeader
                        isVi={isVietnamese}
                        filterPlatform={activityPlatformFilter}
                        setFilterPlatform={setActivityPlatformFilter}
                        setCurrentPage={setActivityPage}
                      />
                    </th>
                  )}
                  {isActColVisible('xp') && <th>{isVietnamese ? 'XP / Điểm' : 'XP / Score'}</th>}
                  {isActColVisible('time') && <th>{isVietnamese ? 'Thời gian' : 'Time'}</th>}
                  {isActColVisible('status') && (
                    <th className="th-with-filter">
                      <StatusFilterHeader
                        isVi={isVietnamese}
                        filterStatus={activityStatusFilter}
                        setFilterStatus={setActivityStatusFilter}
                        setCurrentPage={setActivityPage}
                      />
                    </th>
                  )}
                  <th aria-label="Action" />
                </tr>
              </thead>
              <tbody>
                {paginatedActivityLogs.length > 0 ? (
                  paginatedActivityLogs.map((log) => {
                    const getBadgeColor = (type: string) => {
                      switch (type) {
                        case 'TOEIC_TEST': return 'blue'
                        case 'VOCAB_STUDY': return 'warning'
                        case 'AI_CHAT': return 'ai'
                        case 'PREMIUM_UPGRADE': return 'warning'
                        default: return ''
                      }
                    }
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
                    const badgeColor = getBadgeColor(log.actionType)

                    return (
                      <tr key={log.id}>
                        {isActColVisible('user') && (
                          <td>
                            <div
                              className="user-cell"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}
                            >
                              {log.userAvatar ? (
                                <img
                                  src={log.userAvatar}
                                  alt={log.userName}
                                  className="avatar table-avatar"
                                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span className="avatar table-avatar">{log.userName.slice(0, 2).toUpperCase()}</span>
                              )}
                              <div className="user-info">
                                <span className="user-name">{log.userName}</span>
                                <span className="user-email">{log.userEmail}</span>
                              </div>
                            </div>
                          </td>
                        )}
                        {isActColVisible('activity') && (
                          <td>
                            <span className="event-cell">
                              <span className={`event-icon ${badgeColor}`}>
                                <EventIcon className="icon" />
                              </span>
                              {isVietnamese ? log.actionNameVi : log.actionNameEn}
                            </span>
                          </td>
                        )}
                        {isActColVisible('detail') && (
                          <td>
                            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{log.detail}</span>
                          </td>
                        )}
                        {isActColVisible('platform') && (
                          <td>
                            <span className="tag" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'var(--surface-hover)' }}>
                              {log.platform}
                            </span>
                          </td>
                        )}
                        {isActColVisible('xp') && (
                          <td>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                              {log.scoreOrXP}
                            </span>
                          </td>
                        )}
                        {isActColVisible('time') && (
                          <td>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{log.timestamp}</span>
                          </td>
                        )}
                        {isActColVisible('status') && (
                          <td>
                            <span className={`status-pill ${log.status === 'SUCCESS' ? 'success' : 'completed'}`}>
                              {log.status}
                            </span>
                          </td>
                        )}
                        <td>
                          <div className="row-actions">
                            <button
                              className="row-action-btn"
                              title={isVietnamese ? 'Xem chi tiết học viên' : 'View Learner Details'}
                              onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}
                            >
                              <ChevronRight />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>
                      {isVietnamese ? 'Không tìm thấy nhật ký hoạt động phù hợp' : 'No matching activity logs found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={activityPage}
            totalPages={Math.ceil(filteredActivityLogs.length / activityPageSize) || 1}
            pageSize={activityPageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageSizeChange={(size) => {
              setActivityPageSize(size)
              setActivityPage(1)
            }}
            totalItems={filteredActivityLogs.length}
            onPageChange={setActivityPage}
          />
          </div>
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="tab-content-container">
          
          <div className="section-title-wrap">
            <h2 className="section-main-title">Chỉ Số Hiệu Suất Học Theo Kỹ Năng</h2>
          </div>

          <div className="skills-grid">
            {skillPerformanceData.map((skill) => (
              <article key={skill.skillId} className="card skill-card">
                <div className="skill-card-top">
                  <span className="skill-dot" style={{ backgroundColor: skill.statusColor }} />
                  <h3 className="skill-title">{skill.skillNameVi}</h3>
                </div>

                <div className="skill-metrics-row">
                  <div className="skill-m-box">
                    <span className="skill-m-val">{skill.attemptsCount.toLocaleString()}</span>
                    <span className="skill-m-lbl">Lượt thực hiện</span>
                  </div>
                  <div className="skill-m-box">
                    <span className="skill-m-val" style={{ color: skill.statusColor }}>
                      {skill.avgAccuracyPercent}%
                    </span>
                    <span className="skill-m-lbl">Độ chính xác TB</span>
                  </div>
                  <div className="skill-m-box">
                    <span className="skill-m-val">{skill.avgTimeSpentMin} phút</span>
                    <span className="skill-m-lbl">Thời lượng TB</span>
                  </div>
                </div>

                <div className="skill-progress-bar-container">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${skill.avgAccuracyPercent}%`, backgroundColor: skill.statusColor }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <article className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Phân Bố Điểm Thi TOEIC</h2>
                <p className="card-meta">Thống kê {toeicScoreOverview.totalExams.toLocaleString()} bài thi trong hệ thống</p>
              </div>
              <div className="toeic-summary-pills">
                <div className="pill-item">
                  <span className="pill-label">TB</span>
                  <span className="pill-value">{toeicScoreOverview.averageTotalScore}</span>
                </div>
                <div className="pill-item">
                  <span className="pill-label">Cao nhất</span>
                  <span className="pill-value success">{toeicScoreOverview.highestScoreRecord}</span>
                </div>
              </div>
            </div>

            <div className="toeic-bar-chart">
              {toeicScoreOverview.scoreDistribution.map((item, idx) => {
                const barColors = ['#64748b', '#2563eb', '#7c3aed', '#10b981'];
                const barColor = barColors[idx % barColors.length];
                const maxCount = Math.max(...toeicScoreOverview.scoreDistribution.map(d => d.count));
                const heightPercent = (item.count / maxCount) * 100;

                return (
                  <div key={idx} className="bar-col">
                    <div className="bar-label-top">{item.count.toLocaleString()}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <div className="bar-label-bottom">
                      <span className="bar-range">{item.range.split(' ')[0]}</span>
                      <span className="bar-percent">{item.percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <div className="toeic-summary-grid">
            <div className="toeic-summary-card">
              <div className="summary-icon listening"><TrendingUp /></div>
              <div className="summary-info">
                <span className="summary-label">Listening TB</span>
                <span className="summary-value">{toeicScoreOverview.averageListeningScore} <small>/ 495</small></span>
              </div>
            </div>
            <div className="toeic-summary-card">
              <div className="summary-icon reading"><BookOpen /></div>
              <div className="summary-info">
                <span className="summary-label">Reading TB</span>
                <span className="summary-value">{toeicScoreOverview.averageReadingScore} <small>/ 495</small></span>
              </div>
            </div>
            <div className="toeic-summary-card">
              <div className="summary-icon highest"><Award /></div>
              <div className="summary-info">
                <span className="summary-label">Cao nhất</span>
                <span className="summary-value success">{toeicScoreOverview.highestScoreRecord} <small>pts</small></span>
              </div>
            </div>
          </div>

          <article className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Tỷ Lệ Đúng Theo Chi Tiết Các Part</h2>
              </div>
            </div>

            <div className="table-responsive">
              <table className="users-table density-middle">
                <thead>
                  <tr>
                    <th className="th-with-filter">
                      <div className="th-filter-wrapper" ref={toeicPartRef}>
                        <button
                          type="button"
                          className={`th-filter-btn${toeicPartFilter !== 'ALL' ? ' active' : ''}`}
                          onClick={() => setShowToeicPartFilter(!showToeicPartFilter)}
                        >
                          Part
                          <Filter className="th-filter-icon" />
                        </button>
                        {showToeicPartFilter && (
                          <div className="th-filter-dropdown">
                            {uniqueParts.map(num => (
                              <button
                                key={num}
                                type="button"
                                className={`th-filter-option${toeicPartFilter === String(num) ? ' active' : ''}`}
                                onClick={() => { setToeicPartFilter(String(num)); setShowToeicPartFilter(false) }}
                              >
                                Part {num}
                                {toeicPartFilter === String(num) && <CheckCircle className="th-filter-check" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="th-with-filter">
                      <div className="th-filter-wrapper" ref={toeicSectionRef}>
                        <button
                          type="button"
                          className={`th-filter-btn${toeicSectionFilter !== 'ALL' ? ' active' : ''}`}
                          onClick={() => setShowToeicSectionFilter(!showToeicSectionFilter)}
                        >
                          Loại
                          <Filter className="th-filter-icon" />
                        </button>
                        {showToeicSectionFilter && (
                          <div className="th-filter-dropdown">
                            <button
                              type="button"
                              className={`th-filter-option${toeicSectionFilter === 'LISTENING' ? ' active' : ''}`}
                              onClick={() => { setToeicSectionFilter('LISTENING'); setShowToeicSectionFilter(false) }}
                            >
                              Listening
                              {toeicSectionFilter === 'LISTENING' && <CheckCircle className="th-filter-check" />}
                            </button>
                            <button
                              type="button"
                              className={`th-filter-option${toeicSectionFilter === 'READING' ? ' active' : ''}`}
                              onClick={() => { setToeicSectionFilter('READING'); setShowToeicSectionFilter(false) }}
                            >
                              Reading
                              {toeicSectionFilter === 'READING' && <CheckCircle className="th-filter-check" />}
                            </button>
                            <button
                              type="button"
                              className={`th-filter-option${toeicSectionFilter === 'SPEAKING' ? ' active' : ''}`}
                              onClick={() => { setToeicSectionFilter('SPEAKING'); setShowToeicSectionFilter(false) }}
                            >
                              Speaking
                              {toeicSectionFilter === 'SPEAKING' && <CheckCircle className="th-filter-check" />}
                            </button>
                            <button
                              type="button"
                              className={`th-filter-option${toeicSectionFilter === 'WRITING' ? ' active' : ''}`}
                              onClick={() => { setToeicSectionFilter('WRITING'); setShowToeicSectionFilter(false) }}
                            >
                              Writing
                              {toeicSectionFilter === 'WRITING' && <CheckCircle className="th-filter-check" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </th>
                    <th>
                      <button
                        type="button"
                        className={`th-sort-btn${toeicAttemptSort ? ' active' : ''}`}
                        onClick={() => {
                          if (toeicAttemptSort === 'asc') setToeicAttemptSort('desc')
                          else if (toeicAttemptSort === 'desc') setToeicAttemptSort(null)
                          else setToeicAttemptSort('asc')
                        }}
                      >
                        Câu đã làm
                        {toeicAttemptSort === 'asc' && <ChevronUp className="th-sort-icon" />}
                        {toeicAttemptSort === 'desc' && <ChevronUp className="th-sort-icon" style={{ transform: 'rotate(180deg)' }} />}
                        {!toeicAttemptSort && <ChevronsUpDown className="th-sort-icon muted" />}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        className={`th-sort-btn${toeicAccuracySort ? ' active' : ''}`}
                        onClick={() => {
                          if (toeicAccuracySort === 'asc') setToeicAccuracySort('desc')
                          else if (toeicAccuracySort === 'desc') setToeicAccuracySort(null)
                          else setToeicAccuracySort('asc')
                        }}
                      >
                        Tỷ lệ đúng
                        {toeicAccuracySort === 'asc' && <ChevronUp className="th-sort-icon" />}
                        {toeicAccuracySort === 'desc' && <ChevronUp className="th-sort-icon" style={{ transform: 'rotate(180deg)' }} />}
                        {!toeicAccuracySort && <ChevronsUpDown className="th-sort-icon muted" />}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        className={`th-sort-btn${toeicWeakSort ? ' active' : ''}`}
                        onClick={() => {
                          if (toeicWeakSort === 'asc') setToeicWeakSort('desc')
                          else if (toeicWeakSort === 'desc') setToeicWeakSort(null)
                          else setToeicWeakSort('asc')
                        }}
                      >
                        Yếu
                        {toeicWeakSort === 'asc' && <ChevronUp className="th-sort-icon" />}
                        {toeicWeakSort === 'desc' && <ChevronUp className="th-sort-icon" style={{ transform: 'rotate(180deg)' }} />}
                        {!toeicWeakSort && <ChevronsUpDown className="th-sort-icon muted" />}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredToeicParts.map((part) => (
                    <tr key={part.partNumber}>
                      <td className="font-semibold">{part.partNameVi}</td>
                      <td>
                        <span className={`status-pill ${part.section === 'LISTENING' ? 'info' : 'success'}`}>
                          {part.section}
                        </span>
                      </td>
                      <td>{part.totalQuestionsAttempted.toLocaleString()}</td>
                      <td>
                        <span
                            className="accuracy-badge"
                            style={{
                              color:
                                part.avgAccuracyPercent > 80
                                  ? 'var(--success)'
                                  : part.avgAccuracyPercent > 72
                                  ? 'var(--warning)'
                                  : 'var(--error)',
                            }}
                          >
                            {part.avgAccuracyPercent}%
                          </span>
                        </td>
                      <td>
                        <span className="weak-tag">{part.weakTopicCount} chủ đề</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="tab-content-container">
          
          <article className="card full-width-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Mô Hình AI, Tokens & Chi Phí Sử Dụng</h2>
                <p className="card-meta">Theo dõi chi phí Token API, độ trễ hệ thống và tỷ lệ thành công của các AI Engines</p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Mô Hình AI</th>
                    <th>Nhà Cung Cấp</th>
                    <th>Số Request</th>
                    <th>Tokens Đầu Vào (Input)</th>
                    <th>Tokens Đầu Ra (Output)</th>
                    <th>Độ Trễ TB</th>
                    <th>Thành Công</th>
                    <th>Chi Phí (USD)</th>
                    <th>Chi Phí (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {aiModelUsageList.map((model) => (
                    <tr key={model.id}>
                      <td>
                        <div className="ai-model-cell">
                          <span className="model-name">{model.modelName}</span>
                          {model.isPrimary && <span className="primary-pill">Primary</span>}
                        </div>
                      </td>
                      <td>{model.provider}</td>
                      <td className="font-semibold">{model.totalRequests.toLocaleString()}</td>
                      <td>{(model.inputTokens / 1000000).toFixed(2)}M</td>
                      <td>{(model.outputTokens / 1000000).toFixed(2)}M</td>
                      <td>
                        <span className="latency-badge">{model.avgLatencyMs} ms</span>
                      </td>
                      <td>
                        <span className="status-pill success">{model.successRatePercent}%</span>
                      </td>
                      <td className="font-semibold">${model.costUSD.toFixed(2)}</td>
                      <td className="font-semibold" style={{ color: 'var(--primary)' }}>
                        {model.costVND.toLocaleString()} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="ai-stats-grid">
            <div className="ai-stat-card">
              <div className="ai-stat-icon"><Sparkles /></div>
              <div className="ai-stat-info">
                <span className="ai-stat-value">{aiRecommendationStats.totalGenerated.toLocaleString()}</span>
                <span className="ai-stat-label">Gợi ý AI đã tạo</span>
              </div>
            </div>
            <div className="ai-stat-card">
              <div className="ai-stat-icon accepted"><TrendingUp /></div>
              <div className="ai-stat-info">
                <span className="ai-stat-value">{aiRecommendationStats.acceptedCount.toLocaleString()}</span>
                <span className="ai-stat-label">Chấp nhận học</span>
              </div>
            </div>
            <div className="ai-stat-card">
              <div className="ai-stat-icon completed"><CheckCircle /></div>
              <div className="ai-stat-info">
                <span className="ai-stat-value">{aiRecommendationStats.completedCount.toLocaleString()}</span>
                <span className="ai-stat-label">Hoàn thành</span>
              </div>
            </div>
            <div className="ai-stat-card">
              <div className="ai-stat-icon rate"><Award /></div>
              <div className="ai-stat-info">
                <span className="ai-stat-value">{aiRecommendationStats.acceptanceRatePercent}%</span>
                <span className="ai-stat-label">Tỷ lệ chấp nhận</span>
              </div>
            </div>
          </div>

          <article className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Phân Loại Đánh Giá AI</h2>
              </div>
            </div>

            <div className="ai-cat-list">
              {aiEvaluationCategories.map((cat, idx) => (
                <div key={idx} className="ai-cat-item">
                  <div className="ai-cat-head">
                    <span className="ai-cat-title">{cat.labelVi}</span>
                    <span className="ai-cat-count">{cat.totalEvaluations.toLocaleString()} lượt</span>
                  </div>
                  <div className="ai-cat-details">
                    <span>Điểm TB: <strong>{cat.avgScore}/5</strong></span>
                    <span>Độ trễ: <strong>{cat.avgProcessingTimeMs}ms</strong></span>
                    <span>Hài lòng: <strong style={{ color: 'var(--success)' }}>{cat.helpfulRatingPercent}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="card full-width-card margin-top-lg">
            <div className="card-header activity-header">
              <div>
                <h2 className="card-title">Nhật Ký Đánh Giá AI Gần Đây</h2>
              </div>
              <div className="filter-controls-row">
                
                <div className="select-filter-wrap">
                  <select
                    className="table-select-filter"
                    value={aiTypeFilter}
                    onChange={(e) => setAiTypeFilter(e.target.value)}
                  >
                    <option value="ALL">Tất cả loại đánh giá</option>
                    <option value="SPEAKING">Speaking AI (Phát âm & Fluency)</option>
                    <option value="WRITING">Writing AI (Bài viết & Ngữ pháp)</option>
                    <option value="LISTENING">Listening Dictation (Nghe chép)</option>
                    <option value="VOCABULARY">Vocabulary SRS (Phản xạ Từ vựng)</option>
                    <option value="GRAMMAR">Grammar AI (Cấu trúc & Sửa lỗi)</option>
                    <option value="TOEIC_ANALYSIS">TOEIC Diagnostic (Chẩn đoán điểm)</option>
                    <option value="PRONUNCIATION">Phoneme STT (Trọng âm & Âm tiết)</option>
                  </select>
                  <ChevronDown className="select-arrow-icon" />
                </div>

                <div className="search-input-wrap">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm theo người dùng, email..."
                    value={aiSearchQuery}
                    onChange={(e) => setAiSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {aiSearchQuery && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setAiSearchQuery('')}
                      title="Xóa tìm kiếm"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Học Viên</th>
                    <th>Gói Tài Khoản</th>
                    <th>Loại Đánh Giá</th>
                    <th>Kết Quả / Điểm Số</th>
                    <th>Tokens</th>
                    <th>Độ Trễ</th>
                    <th>Chi Phí</th>
                    <th>Phản Hồi Học Viên</th>
                    <th>Thời Gian</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAiLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="user-cell-compact">
                          <span className="user-name font-semibold">{log.userName}</span>
                          <span className="user-email">{log.userEmail}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`plan-pill ${log.planType.toLowerCase()}`}>
                          {log.planType}
                        </span>
                      </td>
                      <td>
                        <span className="eval-type-badge">{log.evaluationType}</span>
                      </td>
                      <td className="font-semibold" style={{ color: 'var(--primary)' }}>
                        {log.score}
                      </td>
                      <td>{log.tokensUsed}</td>
                      <td>{log.processingTimeMs}ms</td>
                      <td>${log.costUSD}</td>
                      <td>
                        {log.feedbackType === 'HELPFUL' ? (
                          <span className="feedback-pill helpful">
                            <ThumbsUp className="icon-xs" /> {log.rating}/5 Đánh giá tốt
                          </span>
                        ) : (
                          <span className="feedback-pill neutral">Chưa đánh giá</span>
                        )}
                      </td>
                      <td className="text-secondary">{log.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="tab-content-container">
          <div className="section-title-wrap">
            <h2 className="section-main-title">Kiến Trúc Microservices & Tổng Quan Dữ Liệu</h2>
            <p className="section-main-subtitle">Thống kê dữ liệu thực tế được lưu trữ trong 9 dịch vụ cơ sở dữ liệu hệ thống</p>
          </div>

          <div className="db-services-grid">
            <article className="card db-service-card">
              <div className="db-card-header">
                <span className="db-icon-wrap user-bg">
                  <Users className="icon" />
                </span>
                <div>
                  <h3 className="db-title">User & Auth Service DB</h3>
                  <p className="db-file">auth.dbml, user.dbml</p>
                </div>
              </div>
              <ul className="db-metrics-list">
                <li><span>Tài khoản hệ thống (auth_accounts):</span> <strong>12,480</strong></li>
                <li><span>Hồ sơ học viên (user_profiles):</span> <strong>12,480</strong></li>
                <li><span>Gói đăng ký (user_subscriptions):</span> <strong>3,850 active</strong></li>
                <li><span>Log Gamification (user_xp_logs):</span> <strong>1,420,000 logs</strong></li>
                <li><span>Nhật ký hàng ngày (user_daily_activities):</span> <strong>248,500 records</strong></li>
              </ul>
            </article>

            <article className="card db-service-card">
              <div className="db-card-header">
                <span className="db-icon-wrap vocab-bg">
                  <BookOpen className="icon" />
                </span>
                <div>
                  <h3 className="db-title">Vocabulary Service DB</h3>
                  <p className="db-file">vocabulary-service.dbml</p>
                </div>
              </div>
              <ul className="db-metrics-list">
                <li><span>Mục từ vựng (lexical_items):</span> <strong>48,500 words</strong></li>
                <li><span>Nghĩa từ vựng (meanings):</span> <strong>82,400 meanings</strong></li>
                <li><span>Câu ví dụ (example_sentences):</span> <strong>154,000 sentences</strong></li>
                <li><span>Bộ thẻ Flashcard (flashcard_decks):</span> <strong>1,280 decks</strong></li>
                <li><span>Tiến độ học SRS (user_vocabulary_progress):</span> <strong>890,000 records</strong></li>
              </ul>
            </article>

            <article className="card db-service-card">
              <div className="db-card-header">
                <span className="db-icon-wrap practice-bg">
                  <GraduationCap className="icon" />
                </span>
                <div>
                  <h3 className="db-title">Practice Service DB</h3>
                  <p className="db-file">practice-service.dbml</p>
                </div>
              </div>
              <ul className="db-metrics-list">
                <li><span>Bài tập luyện (practice_sets):</span> <strong>2,450 sets</strong></li>
                <li><span>Lượt làm bài (practice_attempts):</span> <strong>385,000 attempts</strong></li>
                <li><span>Lượt nghe chép (listening_attempts):</span> <strong>142,000 attempts</strong></li>
                <li><span>Lượt phát âm (speaking_attempts):</span> <strong>88,400 attempts</strong></li>
                <li><span>Lượt làm bài viết (writing_submissions):</span> <strong>42,100 submissions</strong></li>
              </ul>
            </article>

            <article className="card db-service-card">
              <div className="db-card-header">
                <span className="db-icon-wrap exam-bg">
                  <Award className="icon" />
                </span>
                <div>
                  <h3 className="db-title">Exam Service DB</h3>
                  <p className="db-file">exam.dbml</p>
                </div>
              </div>
              <ul className="db-metrics-list">
                <li><span>Đề thi TOEIC (toeic_exams):</span> <strong>185 exams</strong></li>
                <li><span>Ngân hàng đề TOEIC (toeic_exams):</span> <strong>81 bộ đề (16,200 câu)</strong></li>
                <li><span>Lượt thi (toeic_exam_attempts):</span> <strong>48,200 attempts</strong></li>
                <li><span>Phân tích theo part (toeic_part_analysis):</span> <strong>337,400 records</strong></li>
                <li><span>Hồ sơ năng lực TOEIC (toeic_learning_profile):</span> <strong>12,480 profiles</strong></li>
              </ul>
            </article>

            <article className="card db-service-card">
              <div className="db-card-header">
                <span className="db-icon-wrap ai-bg">
                  <Sparkles className="icon" />
                </span>
                <div>
                  <h3 className="db-title">AI Service DB & Vector DB</h3>
                  <p className="db-file">ai-service.dbml + Qdrant</p>
                </div>
              </div>
              <ul className="db-metrics-list">
                <li><span>Nhật ký AI Usage (ai_usage_logs):</span> <strong>284,500 logs</strong></li>
                <li><span>Kết quả chấm AI (ai_evaluation_results):</span> <strong>84,250 results</strong></li>
                <li><span>Gợi ý học tập (ai_recommendations):</span> <strong>42,100 items</strong></li>
                <li><span>Phản hồi (ai_response_feedback):</span> <strong>18,400 reviews</strong></li>
                <li><span>RAG Vector Collection (Qdrant Vectors):</span> <strong>142,000 vectors</strong></li>
              </ul>
            </article>

            <article className="card db-service-card">
              <div className="db-card-header">
                <span className="db-icon-wrap course-bg">
                  <Layers className="icon" />
                </span>
                <div>
                  <h3 className="db-title">Course, Media & Noti DB</h3>
                  <p className="db-file">course.dbml, media, notification</p>
                </div>
              </div>
              <ul className="db-metrics-list">
                <li><span>Khóa học chính thức (courses):</span> <strong>42 courses</strong></li>
                <li><span>Bài học (lessons):</span> <strong>640 lessons</strong></li>
                <li><span>Tập tin âm thanh/hình ảnh (media_files):</span> <strong>38,500 files</strong></li>
                <li><span>Thông báo đã gửi (notifications):</span> <strong>620,000 items</strong></li>
                <li><span>Quản trị viên (admin_users):</span> <strong>8 admins</strong></li>
              </ul>
            </article>
          </div>
        </div>
      )}
    </main>
  )
}

function ActivityBarChart({ items }: { items: typeof activityTimeSeriesData }) {
  const maxVal = Math.max(...items.map((i) => i.sessions))
  const minVal = Math.min(...items.map((i) => i.sessions))

  return (
    <div className="activity-chart-container">
      <div className="chart-bars-row">
        {items.map((item, idx) => {
          const heightPercent = Math.max(15, Math.round(((item.sessions - minVal + 500) / (maxVal - minVal + 1000)) * 100))
          return (
            <div
              key={idx}
              className="chart-bar-col"
              title={`${item.dayLabel} (${item.dateStr}): ${item.sessions.toLocaleString()} sessions | DAU: ${item.dau.toLocaleString()} người`}
            >
              <div className="bar-hover-tooltip">
                <span className="tt-date">{item.dateStr}</span>
                <span className="tt-val">{item.sessions.toLocaleString()} Sessions</span>
                <span className="tt-dau">DAU: {item.dau.toLocaleString()}</span>
              </div>
              <div
                className={`chart-bar-fill${idx === items.length - 1 ? ' today' : ''}`}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          )
        })}
      </div>

      <div className="chart-labels-row">
        {items.map((item, idx) => (
          <span key={idx} className="chart-label-text">
            {item.dayLabel}
          </span>
        ))}
      </div>
    </div>
  )
}

function MetricIcon({ iconName }: { iconName: string }) {
  switch (iconName) {
    case 'Users':
      return <Users className="icon" />
    case 'Crown':
      return <Crown className="icon" />
    case 'BookOpen':
      return <BookOpen className="icon" />
    case 'FileCheck':
      return <FileCheck className="icon" />
    case 'Sparkles':
      return <Sparkles className="icon" />
    case 'Database':
      return <Database className="icon" />
    default:
      return <BarChart2 className="icon" />
  }
}

function DeviceDonutChart({ data }: { data: typeof gamificationStats.deviceDistribution }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const totalUsers = data.reduce((acc, curr) => acc + curr.count, 0)
  const colors = ['#2f7f78', '#3b82f6', '#8a68a8']
  const radius = 55
  const circumference = 2 * Math.PI * radius

  let accumulatedPercent = 0

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null
  const activeColor = hoveredIdx !== null ? colors[hoveredIdx % colors.length] : 'var(--text-primary)'

  return (
    <div className="device-donut-container">
      <div className="donut-svg-wrapper">
        <svg viewBox="0 0 160 160" className="donut-svg">
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
            accumulatedPercent += item.percent

            const isHovered = hoveredIdx === idx
            const isAnyHovered = hoveredIdx !== null

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={colors[idx % colors.length]}
                strokeWidth={isHovered ? 20 : 16}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 80 80)"
                className="donut-segment"
                style={{
                  opacity: !isAnyHovered || isHovered ? 1 : 0.35,
                  filter: isHovered ? 'drop-shadow(0px 2px 6px rgba(0,0,0,0.15))' : 'none',
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            )
          })}
        </svg>

        <div className="donut-center-info">
          {activeItem ? (
            <>
              <span className="center-total-val" style={{ color: activeColor }}>
                {activeItem.percent}%
              </span>
              <span className="center-total-lbl">{activeItem.labelVi}</span>
              <span className="center-sub-val">{activeItem.count.toLocaleString()} người</span>
            </>
          ) : (
            <>
              <span className="center-total-val">{totalUsers.toLocaleString()}</span>
              <span className="center-total-lbl">Người dùng</span>
              <span className="center-sub-val">Tổng cộng</span>
            </>
          )}
        </div>
      </div>

      <div className="donut-legend-list">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx
          return (
            <div
              key={idx}
              className={`donut-legend-row${isHovered ? ' active' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="legend-info">
                <span className="legend-dot" style={{ backgroundColor: colors[idx % colors.length] }} />
                <div className="legend-labels">
                  <span className="legend-name">{item.labelVi}</span>
                  <span className="legend-device-tag">{item.device}</span>
                </div>
              </div>
              <div className="legend-stats">
                <span className="legend-count">{item.count.toLocaleString()} người</span>
                <span className="legend-percent" style={{ color: colors[idx % colors.length] }}>
                  {item.percent}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
