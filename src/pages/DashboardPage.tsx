// Updated: 2026-08-22
// Dashboard page - Tổng quan vận hành (Dynamic Activity Chart & Date Range Sync)

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
  Download,
  Sparkles,
  TrendingUp,
  CircleCheck,
  Target,
  Activity,
  GraduationCap,
  Mic,
  Flame,
  BookOpenCheck,
  MoreHorizontal,
  ChevronDown,
  Check,
  ChevronRight,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { recentUserActivityLogs } from '@/data/statistics-data'

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
  const [selectedRange, setSelectedRange] = useState<DateRange>(dateRanges[1]) // Default 14d
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customFromDate, setCustomFromDate] = useState('')
  const [customToDate, setCustomToDate] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

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

  // Dynamic Chart Data based on selected range (7d, 14d, 30d, custom)
  const chartItems = useMemo<ChartItem[]>(() => {
    if (selectedRange.id === 'custom') {
      if (!customFromDate || !customToDate) {
        const values = base30DaysData.slice(-14)
        const now = new Date()
        return values.map((val, idx) => {
          const d = new Date(now)
          d.setDate(d.getDate() - (14 - 1 - idx))
          const dayStr = String(d.getDate()).padStart(2, '0')
          const monthStr = String(d.getMonth() + 1).padStart(2, '0')
          const dayOfWeekVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
          const dayOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
          let label = `${dayStr}/${monthStr}`
          label = `${isVietnamese ? dayOfWeekVi : dayOfWeekEn} ${dayStr}`
          return {
            value: val,
            label,
            fullDate: d.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US'),
          }
        })
      }
      const from = new Date(customFromDate)
      const to = new Date(customToDate)
      const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return base30DaysData.slice(-diffDays).map((val, idx) => {
        const d = new Date(from)
        d.setDate(d.getDate() + idx)
        const dayStr = String(d.getDate()).padStart(2, '0')
        const monthStr = String(d.getMonth() + 1).padStart(2, '0')
        const dayOfWeekVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
        const dayOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
        let label = `${dayStr}/${monthStr}`
        if (diffDays <= 7) {
          label = `${isVietnamese ? dayOfWeekVi : dayOfWeekEn} ${dayStr}`
        }
        return {
          value: val,
          label,
          fullDate: d.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US'),
        }
      })
    }
    const count = selectedRange.days
    const values = base30DaysData.slice(-count)
    const now = new Date()

    return values.map((val, idx) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (count - 1 - idx))
      const dayStr = String(d.getDate()).padStart(2, '0')
      const monthStr = String(d.getMonth() + 1).padStart(2, '0')
      const dayOfWeekVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
      const dayOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]

      let label = `${dayStr}/${monthStr}`
      if (count === 7) {
        label = `${isVietnamese ? dayOfWeekVi : dayOfWeekEn} ${dayStr}`
      } else if (count === 30) {
        label = `${dayStr}`
      }

      return {
        value: val,
        label,
        fullDate: d.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US'),
      }
    })
  }, [selectedRange, isVietnamese])

  // Total sessions calculated dynamically
  const totalSessions = useMemo(() => {
    return chartItems.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('en-US')
  }, [chartItems])

  const recentActivity = [
    {
      id: 1,
      name: 'Lê Minh',
      email: 'leminh@email.com',
      initials: 'LM',
      avatarColor: '',
      event: t('page.dashboard.completedCourse'),
      eventIcon: GraduationCap,
      eventColor: '',
      time: '2 phút trước',
      status: t('page.dashboard.recorded'),
      statusType: 'success',
    },
    {
      id: 2,
      name: 'Ngọc Trâm',
      email: 'ngoctram@email.com',
      initials: 'NT',
      avatarColor: 'blue',
      event: t('page.dashboard.aiSpeakingReview'),
      eventIcon: Mic,
      eventColor: 'blue',
      time: '18 phút trước',
      status: t('page.dashboard.sent'),
      statusType: 'info',
    },
    {
      id: 3,
      name: 'Phúc Hoàng',
      email: 'phuchoang@email.com',
      initials: 'PH',
      avatarColor: 'warning',
      event: t('page.dashboard.streakMilestone'),
      eventIcon: Flame,
      eventColor: 'warning',
      time: '42 phút trước',
      status: t('page.dashboard.syncing'),
      statusType: 'warning',
    },
    {
      id: 4,
      name: 'Thu Hà',
      email: 'thuha@email.com',
      initials: 'TH',
      avatarColor: 'ai',
      event: t('page.dashboard.vocabularyCards'),
      eventIcon: BookOpenCheck,
      eventColor: 'ai',
      time: '1 giờ trước',
      status: t('page.dashboard.completed'),
      statusType: 'success',
    },
  ]

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('page.dashboard.title')}</h1>
          <p className="page-subtitle">{t('page.dashboard.subtitle')}</p>
        </div>
        <div className="heading-actions">
          <div className="date-picker-wrapper" ref={pickerRef}>
            <button
              className="date-control"
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <CalendarDays className="icon" />
              <span>
                {selectedRange.id === 'custom'
                  ? `${customFromDate || '...'} - ${customToDate || '...'}`
                  : formatDateRange(selectedRange, isVietnamese)}
              </span>
              <ChevronDown className="icon" style={{ width: 14, height: 14 }} />
            </button>
            {showDatePicker && (
              <div className="date-picker-dropdown" style={{ minWidth: '220px' }}>
                {dateRanges.filter(r => r.id !== 'custom').map((range) => (
                  <button
                    key={range.id}
                    className={`date-picker-option${selectedRange.id === range.id ? ' selected' : ''}`}
                    onClick={() => {
                      setSelectedRange(range)
                      setShowDatePicker(false)
                    }}
                    type="button"
                  >
                    <span>{isVietnamese ? range.labelVi : range.label}</span>
                    {selectedRange.id === range.id && <Check className="check-icon" />}
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
                          setSelectedRange({ id: 'custom', label: 'Custom', labelVi: 'Tùy chỉnh', days: 0 })
                          setShowDatePicker(false)
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
                          setSelectedRange({ id: 'custom', label: 'Custom', labelVi: 'Tùy chỉnh', days: 0 })
                          setShowDatePicker(false)
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
            {t('page.dashboard.exportReport')}
          </button>
        </div>
      </div>

      {/* Overview Grid */}
      <section className="overview-grid">
        {/* Engagement Chart Card */}
        <article className="card chart-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">{t('page.dashboard.activityTitle')}</h2>
              <p className="card-meta">
                {isVietnamese
                  ? `Dữ liệu ${selectedRange.labelVi.toLowerCase()} (${formatDateRange(selectedRange, isVietnamese)})`
                  : `Data for ${selectedRange.label.toLowerCase()} (${formatDateRange(selectedRange, isVietnamese)})`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="chart-total">{totalSessions}</div>
              <div className="chart-total-label">{t('page.dashboard.totalSessions')}</div>
              <div className="chart-legend" style={{ justifyContent: 'flex-end', marginTop: 9 }}>
                <span className="legend-item">
                  <span className="legend-dot teal" />
                  {t('page.dashboard.sessionsLabel')}
                </span>
                <span className="legend-item">
                  <span className="legend-dot blue" />
                  {isVietnamese ? 'Mục tiêu' : 'Target'}
                </span>
              </div>
            </div>
          </div>
          <div className="chart-wrap">
            <SimpleChart items={chartItems} />
          </div>
        </article>

        {/* Platform Health Card */}
        <article className="card pulse-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">{t('page.dashboard.platformHealth')}</h2>
              <p className="card-meta">{t('page.dashboard.liveUpdate')}</p>
            </div>
            <Activity style={{ width: 18, height: 18, color: 'var(--primary)' }} />
          </div>
          <div className="pulse-topline">
            <span className="pulse-status">
              <span className="status-dot" />
              {t('page.dashboard.allSystemsNormal')}
            </span>
            <span className="pulse-time">
              {currentTime.toLocaleTimeString('vi-VN')}
            </span>
          </div>
          <div className="pulse-score">
            <div className="pulse-score-number">99.96%</div>
            <div className="pulse-score-label">{t('page.dashboard.uptimeLabel')}</div>
          </div>
          <div className="health-list">
            <div className="health-row">
              <span className="health-label">
                <span className="status-dot" style={{ background: 'var(--success)' }} />
                {t('page.dashboard.apiLatency')}
              </span>
              <span className="health-value">{isVietnamese ? '184ms' : '184ms'}</span>
            </div>
            <div className="health-row">
              <span className="health-label">
                <span className="status-dot" style={{ background: 'var(--success)' }} />
                {t('page.dashboard.learningQueue')}
              </span>
              <span className="health-value">{isVietnamese ? '12 công việc' : '12 jobs'}</span>
            </div>
            <div className="health-row">
              <span className="health-label">
                <span className="status-dot" style={{ background: 'var(--warning)' }} />
                {t('page.dashboard.aiEvaluation')}
              </span>
              <span className="health-value">{isVietnamese ? '42 đang chờ' : '42 pending'}</span>
            </div>
          </div>
        </article>
      </section>

      {/* KPI Grid */}
      <section className="kpi-grid">
        {/* Active Learners */}
        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon">
              <TrendingUp className="icon" />
            </span>
            <span className="delta up">
              <TrendingUp className="icon" />
              8.4%
            </span>
          </div>
          <p className="kpi-label">{t('page.dashboard.kpi.activeLearners')}</p>
          <p className="kpi-value">8,920</p>
          <div className="kpi-foot">
            <span className="kpi-footnote">+692 {t('page.dashboard.kpi.previousPeriod')}</span>
            <div className="mini-bars">
              <span style={{ height: 10 }} />
              <span style={{ height: 14 }} />
              <span style={{ height: 13 }} />
              <span style={{ height: 18 }} />
              <span style={{ height: 16 }} />
              <span style={{ height: 22 }} />
              <span style={{ height: 24 }} />
            </div>
          </div>
        </article>

        {/* Lesson Completion */}
        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon blue">
              <CircleCheck className="icon" />
            </span>
            <span className="delta up">
              <TrendingUp className="icon" />
              5.1%
            </span>
          </div>
          <p className="kpi-label">{t('page.dashboard.kpi.lessonCompletion')}</p>
          <p className="kpi-value">74.8%</p>
          <div className="progress-track">
            <div className="progress-fill blue" style={{ width: '74.8%' }} />
          </div>
          <div className="kpi-foot">
            <span className="kpi-footnote">{t('page.dashboard.kpi.monthlyGoal')} 78%</span>
          </div>
        </article>

        {/* Accuracy */}
        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon green">
              <Target className="icon" />
            </span>
            <span className="delta neutral">{isVietnamese ? '+2.3 điểm' : '+2.3 pts'}</span>
          </div>
          <p className="kpi-label">{t('page.dashboard.kpi.accuracy')}</p>
          <p className="kpi-value">81.6%</p>
          <div className="gauge">
            <span className="gauge-label">81.6</span>
          </div>
          <div className="kpi-foot">
            <span className="kpi-footnote">{isVietnamese ? 'Listening đang dẫn đầu' : 'Listening leading'} · 86%</span>
          </div>
        </article>

        {/* AI Evaluations */}
        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon ai">
              <Sparkles className="icon" />
            </span>
            <span className="delta up" style={{ color: 'var(--ai)', background: 'rgba(138,104,168,.12)' }}>
              <TrendingUp className="icon" />
              18.7%
            </span>
          </div>
          <p className="kpi-label">{t('page.dashboard.kpi.aiEvaluations')}</p>
          <p className="kpi-value">2,416</p>
          <div className="kpi-foot">
            <span className="kpi-footnote">{isVietnamese ? 'Nghe · Nói · 42 ' : 'Speaking · Writing · 42 '}{t('page.dashboard.kpi.pending')}</span>
          </div>
        </article>
      </section>

      {/* Activity Table */}
      <section className="card activity-card">
        <div className="card-header activity-header">
          <div>
            <h2 className="card-title">{t('page.dashboard.recentActivity')}</h2>
          </div>
          <button
            className="text-action"
            type="button"
            onClick={() => setActiveNavItem('progress')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {t('page.dashboard.viewAll')} <ChevronRight size={16} />
          </button>
        </div>
        <div className="activity-table-wrap">
          <table className="activity-table">
            <thead>
              <tr>
                <th>{t('page.dashboard.user')}</th>
                <th>{t('page.dashboard.event')}</th>
                <th>{t('page.dashboard.detailsXP')}</th>
                <th>{t('page.dashboard.time')}</th>
                <th>{t('page.dashboard.status')}</th>
                <th aria-label={t('page.dashboard.actions')} />
              </tr>
            </thead>
            <tbody>
              {recentUserActivityLogs.slice(0, 5).map((log) => {
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
                    <td>
                      <div className="user-cell" style={{ cursor: 'pointer' }} onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}>
                        {log.userAvatar ? (
                          <img src={log.userAvatar} alt={log.userName} className="avatar table-avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <span className="avatar table-avatar">{log.userName.slice(0, 2).toUpperCase()}</span>
                        )}
                        <span>
                          <span className="user-name">{log.userName}</span>
                          <span className="user-email">{log.userEmail}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="event-cell">
                        <span className={`event-icon ${badgeColor}`}>
                          <EventIcon className="icon" />
                        </span>
                        {isVietnamese ? log.actionNameVi : log.actionNameEn}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
                        {log.scoreOrXP}
                      </span>
                    </td>
                    <td>{log.timestamp}</td>
                    <td>
                      <span className={`status-pill ${log.status === 'SUCCESS' ? 'success' : 'completed'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-more"
                        type="button"
                        onClick={() => setActiveNavItem(`user-profile:${log.userId}`)}
                        title={isVietnamese ? 'Xem thông tin học viên' : 'View Learner Profile'}
                      >
                        <ChevronRight className="icon" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

// Interactive chart visualization using CSS bars matching exact filter range
function SimpleChart({ items }: { items: ChartItem[] }) {
  const maxValue = Math.max(...items.map((i) => i.value))
  const minValue = Math.min(...items.map((i) => i.value))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Bars container */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: items.length > 20 ? 3 : 8, flex: 1, paddingBottom: 4 }}>
        {items.map((item, index) => (
          <div
            key={index}
            title={`${item.fullDate}: ${item.value} phiên học`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              height: '100%',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: '100%',
                height: `${((item.value - minValue + 30) / (maxValue - minValue + 60)) * 100}%`,
                background: index === items.length - 1 ? 'var(--primary)' : 'rgba(47, 127, 120, 0.45)',
                borderRadius: '4px 4px 0 0',
                transition: 'all 300ms ease',
                minHeight: 8,
              }}
            />
          </div>
        ))}
      </div>
      {/* Labels */}
      <div style={{ display: 'flex', gap: items.length > 20 ? 3 : 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontSize: items.length > 20 ? 9 : 10,
                color: 'var(--text-tertiary)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
