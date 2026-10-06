// Bảng thống kê lịch sử làm đề thi TOEIC của học viên và chi tiết bài nộp dành cho Admin.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  RotateCcw,
  Eye,
  Trophy,
  Headphones,
  BookOpen,
  CheckCircle2,
  Users,
  Flame,
  FileText,
} from 'lucide-react'
import { useAdminToeicAttemptsQuery } from '@/features/exams/hooks/use.exams.admin.query'
import type { PlacementAttemptItem } from '@/features/exams/services/exam.service'
import { PlacementAttemptDetailModal } from '@/features/exams/components/placement.attempt.detail.modal'
import { useDebounce } from '@/hooks/use.debounce'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { toast } from '@/store/toast.store'

interface ToeicAttemptsTableProps {
  onViewLearnerProfile?: (userId: string) => void
}

export function ToeicAttemptsTable({ onViewLearnerProfile }: ToeicAttemptsTableProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const [searchTerm, setSearchTerm] = useState<string>('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [skillsFilter, setSkillsFilter] = useState<string>('ALL')
  const [scoreBracket, setScoreBracket] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>('submitted_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc')
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)

  const queryParams = useMemo(() => {
    let minScore: number | undefined
    let maxScore: number | undefined

    if (scoreBracket === '0-250') {
      minScore = 0
      maxScore = 250
    } else if (scoreBracket === '255-500') {
      minScore = 255
      maxScore = 500
    } else if (scoreBracket === '505-750') {
      minScore = 505
      maxScore = 750
    } else if (scoreBracket === '755-990') {
      minScore = 755
      maxScore = 990
    }

    return {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      skills: skillsFilter !== 'ALL' ? skillsFilter : undefined,
      minScore,
      maxScore,
      sortBy: sortKey === 'learner' ? 'user_id' : sortKey || undefined,
      sortOrder: sortOrder || undefined,
    }
  }, [currentPage, pageSize, debouncedSearch, skillsFilter, scoreBracket, sortKey, sortOrder])

  const { data, isLoading, refetch } = useAdminToeicAttemptsQuery(queryParams)

  const items = data?.result || []
  const stats = data?.stats

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '0 phút'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}p ${secs}s`
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getScoreBadge = (score: number) => {
    if (score >= 855) return { label: 'C1 Nâng Cao', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' }
    if (score >= 785) return { label: 'B2+ Giao Tiếp', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' }
    if (score >= 550) return { label: 'B1 Trung Cấp', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
    if (score >= 255) return { label: 'A2 Sơ Cấp', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
    return { label: 'A1 Bắt Đầu', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
  }

  const columns = useMemo<DataTableColumn<PlacementAttemptItem>[]>(
    () => [
      {
        key: 'learner',
        title: 'Học viên',
        sortable: true,
        render: (item) => (
          <div className="flex items-center gap-3">
            {item.learner_avatar_url ? (
              <img
                src={item.learner_avatar_url}
                alt={item.learner_name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-2xs">
                {item.learner_name.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewLearnerProfile?.(item.user_id)}
                className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate text-left block cursor-pointer"
              >
                {item.learner_name}
              </button>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {item.learner_email}
              </p>
              {Boolean(item.learner_target_score) && (
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Target: {item.learner_target_score}+
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'exam_title',
        title: 'Đề thi TOEIC',
        render: (item) => (
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 max-w-[240px] truncate" title={item.exam_title}>
              {item.exam_title}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.exam_code && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  {item.exam_code}
                </span>
              )}
              {item.skills_enabled === '4SKILLS' || item.skills_enabled === 'ALL' ? (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  4 Kỹ Năng
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  2 Kỹ Năng
                </span>
              )}
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                {item.attempt_type}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'total_scaled_score',
        title: 'Điểm TOEIC',
        sortable: true,
        render: (item) => {
          const badge = getScoreBadge(item.total_scaled_score)
          return (
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900 dark:text-slate-100">
                  {item.total_scaled_score}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">/ 990</span>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          )
        },
      },
      {
        key: 'skills',
        title: 'Kỹ năng làm bài',
        render: (item) => {
          const is4Skills = item.skills_enabled === '4SKILLS' || item.skills_enabled === 'ALL'
          return (
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                <Headphones className="w-3.5 h-3.5" />
                <span>{item.listening_scaled_score} <span className="text-[10px] text-slate-400 font-normal">/ 495</span></span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{item.reading_scaled_score} <span className="text-[10px] text-slate-400 font-normal">/ 495</span></span>
              </div>
              {is4Skills && (
                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  + S & W
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: 'accuracy',
        title: 'Độ chính xác',
        render: (item) => {
          const pct = item.total_questions > 0
            ? Math.round((item.correct_questions / item.total_questions) * 100)
            : 0
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{item.correct_questions}/{item.total_questions}</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {pct}% chính xác
              </p>
            </div>
          )
        },
      },
      {
        key: 'duration',
        title: 'Thời gian làm',
        render: (item) => (
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {formatDuration(item.total_time_seconds)}
          </span>
        ),
      },
      {
        key: 'submitted_at',
        title: 'Ngày nộp bài',
        sortable: true,
        render: (item) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDateTime(item.submitted_at || item.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        title: 'Thao tác',
        align: 'right',
        render: (item) => (
          <button
            type="button"
            onClick={() => setSelectedAttemptId(item._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem bài làm</span>
          </button>
        ),
      },
    ],
    [onViewLearnerProfile]
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Tổng lượt luyện đề TOEIC
            </span>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {stats?.total_attempts ?? data?.meta?.total ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Điểm trung bình toàn bài
            </span>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.avg_total_score ?? 0} <span className="text-xs font-normal text-slate-400">/ 990</span>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Điểm TB Listening / Reading
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {stats?.avg_listening_score ?? 0} / {stats?.avg_reading_score ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Học viên đã luyện đề
            </span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.unique_learners_count ?? 0}
            </p>
          </div>
        </div>
      </div>

      <DataTable<PlacementAttemptItem>
        title={isVi ? "Danh Sách Học Viên Luyện Đề Thi TOEIC" : "Student TOEIC Practice History"}
        subtitle={isVi ? "Theo dõi lịch sử làm bài, điểm thi TOEIC Listening / Reading, thời gian và chi tiết bài nộp của học viên" : "Review TOEIC practice history, scores and student submissions"}
        isLoading={isLoading}
        columns={columns}
        data={items}
        rowKey={(item) => item._id}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={(k: string, o: 'asc' | 'desc' | null) => {
          setSortKey(k)
          setSortOrder(o)
          setCurrentPage(1)
        }}
        pagination={{
          currentPage,
          pageSize,
          totalItems: data?.meta?.total || 0,
          onPageChange: (p: number) => setCurrentPage(p),
          onPageSizeChange: (s: number) => setPageSize(s),
        }}
        onResetFilters={async () => {
          setSearchTerm('')
          setSkillsFilter('ALL')
          setScoreBracket('ALL')
          setSortKey('submitted_at')
          setSortOrder('desc')
          setCurrentPage(1)
          await refetch()
          toast.success(isVi ? 'Đã đặt lại bộ lọc bài thi TOEIC' : 'TOEIC test filters reset')
        }}
        extraActions={
          <button
            type="button"
            onClick={() => {
              refetch()
              toast.success('Đã làm mới danh sách bài thi TOEIC!')
            }}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            <span>Làm mới</span>
          </button>
        }
        filterSlot={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isVi ? 'Tìm theo tên học viên, email hoặc tên đề thi TOEIC...' : 'Search by student name, email or exam title...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>

            <select
              value={skillsFilter}
              onChange={(e) => {
                setSkillsFilter(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Lọc theo hệ kỹ năng TOEIC"
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">Mọi hệ kỹ năng</option>
              <option value="2SKILLS">TOEIC 2 Kỹ Năng (LR)</option>
              <option value="4SKILLS">TOEIC 4 Kỹ Năng (LRSW)</option>
            </select>

            <select
              value={scoreBracket}
              onChange={(e) => {
                setScoreBracket(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Lọc theo mức điểm TOEIC"
              className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="ALL">Mọi mức điểm TOEIC</option>
              <option value="755-990">755 - 990 (B2+ / C1)</option>
              <option value="505-750">505 - 750 (B1 Trung cấp)</option>
              <option value="255-500">255 - 500 (A2 Sơ cấp)</option>
              <option value="0-250">0 - 250 (A1 Bắt đầu)</option>
            </select>
          </div>
        }
      />

      <PlacementAttemptDetailModal
        attemptId={selectedAttemptId}
        isOpen={Boolean(selectedAttemptId)}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  )
}
