// Component hiển thị danh sách các phiên kiểm tra khóa học và thống kê tổng quan.

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Modal, Spin, Tooltip } from 'antd'
import { Layers, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { TableTextCell } from '@/components/table.text.cell'
import { CustomSelect } from '@/components/custom.select'
import { StatCard } from '@/components/stat.card'
import { type CourseSimple } from '@/features/courses/hooks/use.course.learners.data'
import { progressService, type CourseTestSession } from '@/features/progress/services/progress.service'
import { userService } from '@/features/users/services/user.service'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'

type SessionRow = CourseTestSession & { course_title: string; user_email: string }
const testTypes: Record<string, string> = {
  challenge: 'Challenge',
  'post-mini': 'Kiểm tra chương',
  'final-test': 'Kiểm tra cuối khóa',
}
const statuses: Record<string, string> = {
  IN_PROGRESS: 'Đang làm',
  SUBMITTED: 'Đã nộp',
  EXPIRED: 'Hết hạn',
  AWAITING_GRADING: 'Chờ chấm',
  FINALIZING: 'Đang xử lý',
}
const formatDate = (date?: string | null) => date ? new Date(date).toLocaleString('vi-VN') : '—'
const text = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : ''

export function CourseTestSessionsTab({
  courses,
  selectedCourseId,
  onSelectCourseId,
  isLoadingCourses,
  coursesError,
}: {
  courses: CourseSimple[]
  selectedCourseId: string
  onSelectCourseId: (id: string) => void
  isLoadingCourses: boolean
  coursesError: Error | null
}) {
  const [type, setType] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<SessionRow | null>(null)

  const targetCourses = useMemo(
    () => courses.filter((c) => selectedCourseId === 'ALL' || c.id === selectedCourseId),
    [courses, selectedCourseId]
  )

  const { data: rows = [], isLoading, error, refetch } = useQuery({
    queryKey: ['course-test-sessions', targetCourses.map((c) => c.id).sort().join(',')],
    enabled: targetCourses.length > 0,
    queryFn: async (): Promise<SessionRow[]> => {
      const results = await Promise.all(
        targetCourses.map(async (course) => {
          const sessions = await progressService.getCourseTestSessions(course.id)
          return sessions.map((session) => ({ ...session, course_title: course.title }))
        })
      )
      const sessions = results.flat()
      const profiles = new Map(
        await Promise.all(
          [...new Set(sessions.map((s) => s.user_id))].map(async (id) => {
            return [id, await userService.getProfileById(id).catch(() => null)] as const
          })
        )
      )
      return sessions
        .map((s) => ({
          ...s,
          user_email: profiles.get(s.user_id)?.email || '',
        }))
        .sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at))
    },
  })

  const detail = useQuery({
    queryKey: ['course-test-session-detail', selected?.course_id, selected?._id],
    enabled: !!selected,
    queryFn: () => progressService.getCourseTestSession(selected!.course_id, selected!._id),
  })

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesType = type === 'ALL' || row.test_type === type
      const matchesStatus = status === 'ALL' || row.status === status
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q || `${row.user_id} ${row.user_email} ${row.course_title}`.toLowerCase().includes(q)
      return matchesType && matchesStatus && matchesSearch
    })
  }, [rows, type, status, search])

  const columns: DataTableColumn<SessionRow>[] = [
    {
      key: 'student',
      title: 'Học viên',
      width: 220,
      render: (row) => {
        const email = row.user_email || row.user_id || 'HV'
        const initials = email.slice(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-2.5 min-w-0 w-full">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-[11px] shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <Tooltip title={email} placement="topLeft" mouseEnterDelay={0.3}>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                  {email}
                </p>
              </Tooltip>
              <p className="text-[11px] text-slate-400 font-mono truncate" title={row.user_id}>
                ID: {row.user_id.slice(-6)}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'course',
      title: 'Khóa học',
      minWidth: 180,
      render: (row) => <TableTextCell text={row.course_title} />,
    },
    {
      key: 'type',
      title: 'Loại bài kiểm tra',
      width: 170,
      align: 'center',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
            {testTypes[row.test_type] || row.test_type}
          </span>
          {row.test_type !== 'final-test' && row.order_index ? (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Chương {row.order_index}</div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'score',
      title: 'Điểm',
      width: 100,
      align: 'center',
      render: (row) => (
        <span className="font-bold font-mono text-xs text-slate-900 dark:text-slate-100">
          {row.score == null ? '—' : `${row.score}/100`}
        </span>
      ),
    },
    {
      key: 'result',
      title: 'Kết quả',
      width: 110,
      align: 'center',
      render: (row) =>
        row.is_passed == null ? (
          <span className="text-slate-400 text-xs">—</span>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              row.is_passed
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {row.is_passed ? 'Đạt' : 'Chưa đạt'}
          </span>
        ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: 130,
      align: 'center',
      render: (row) => {
        const label = statuses[row.status] || row.status
        const isDone = row.status === 'SUBMITTED'
        const isExpired = row.status === 'EXPIRED'
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
              isDone
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : isExpired
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {label}
          </span>
        )
      },
    },
    {
      key: 'started_at',
      title: 'Bắt đầu',
      width: 150,
      align: 'center',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
          {formatDate(row.started_at)}
        </span>
      ),
    },
    {
      key: 'submitted_at',
      title: 'Nộp bài',
      width: 150,
      align: 'center',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
          {formatDate(row.submitted_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (row) => (
        <Button
          size="small"
          type="primary"
          ghost
          onClick={() => setSelected(row)}
          className="rounded-lg text-xs font-semibold"
        >
          Xem bài làm
        </Button>
      ),
    },
  ]

  const session = detail.data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Tổng Phiên Kiểm Tra"
          value={rows.length.toLocaleString('vi-VN')}
          subtitle="Lượt làm bài kiểm tra trong khóa học"
          icon={Layers}
          color="indigo"
          trend={rows.length > 0 ? `${rows.length}` : undefined}
          trendType="neutral"
          loading={isLoadingCourses || isLoading}
        />
        <StatCard
          title="Bài Đã Nộp"
          value={rows.filter((r) => r.status === 'SUBMITTED').length.toLocaleString('vi-VN')}
          subtitle="Học viên hoàn thành bài kiểm tra"
          icon={CheckCircle2}
          color="emerald"
          trend={rows.length > 0 ? `${Math.round((rows.filter((r) => r.status === 'SUBMITTED').length / rows.length) * 100)}%` : undefined}
          trendType="up"
          loading={isLoadingCourses || isLoading}
        />
        <StatCard
          title="Phiên Hết Hạn"
          value={rows.filter((r) => r.status === 'EXPIRED').length.toLocaleString('vi-VN')}
          subtitle="Phiên làm bài bị quá thời gian quy định"
          icon={AlertTriangle}
          color="rose"
          trend={rows.filter((r) => r.status === 'EXPIRED').length > 0 ? `${rows.filter((r) => r.status === 'EXPIRED').length}` : undefined}
          trendType={rows.filter((r) => r.status === 'EXPIRED').length > 0 ? 'down' : 'neutral'}
          loading={isLoadingCourses || isLoading}
        />
      </div>

      <DataTable<SessionRow>
        columns={columns}
        data={filtered.slice((page - 1) * pageSize, page * pageSize)}
        rowKey={(row) => row._id}
        isLoading={isLoadingCourses || isLoading}
        error={coursesError || error}
        retry={() => refetch()}
        emptyText="Chưa có phiên kiểm tra trong khóa học đã chọn"
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Tìm email, mã học viên, khóa học..."
        extraActions={
          <div className="flex items-center gap-2">
            <div className="w-64 sm:w-72">
              <CustomSelect
                value={selectedCourseId}
                onChange={(val) => {
                  onSelectCourseId(val)
                  setPage(1)
                }}
                options={[
                  { value: 'ALL', label: 'Tất cả khóa học' },
                  ...courses.map((c) => ({ value: c.id, label: c.title })),
                ]}
              />
            </div>
            <button
              type="button"
              onClick={() => { void refetch() }}
              disabled={isLoadingCourses || isLoading}
              className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs shrink-0 disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoadingCourses || isLoading ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        }
        filterSlot={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-52">
              <CustomSelect
                value={type}
                onChange={(value) => {
                  setType(value)
                  setPage(1)
                }}
                options={[
                  { value: 'ALL', label: 'Tất cả loại bài' },
                  ...Object.entries(testTypes).map(([val, lbl]) => ({ value: val, label: lbl })),
                ]}
              />
            </div>
            <div className="w-48">
              <CustomSelect
                value={status}
                onChange={(value) => {
                  setStatus(value)
                  setPage(1)
                }}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  ...Object.entries(statuses).map(([val, lbl]) => ({ value: val, label: lbl })),
                ]}
              />
            </div>
          </div>
        }
        scroll={{ x: 1200 }}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: filtered.length,
          onPageChange: setPage,
          onPageSizeChange: (value) => {
            setPageSize(value)
            setPage(1)
          },
        }}
      />

      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        width={850}
        title="Chi tiết bài kiểm tra khóa học"
        destroyOnHidden
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {selected.user_email || selected.user_id} · {selected.course_title} · {testTypes[selected.test_type] || selected.test_type}
            </p>
            {detail.isLoading && <Spin />}
            {detail.error && (
              <p role="alert" className="text-red-500 text-xs">
                Không tải được bài làm. <Button onClick={() => { void detail.refetch() }}>Thử lại</Button>
              </p>
            )}
            {session && (
              <>
                <p className="text-xs">
                  Điểm: <strong>{session.score == null ? 'Chưa có điểm' : `${session.score}/100`}</strong> · {statuses[session.status] || session.status} · Điểm đạt: {session.passing_score ?? '—'}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Bắt đầu: {formatDate(session.started_at)} · Nộp bài: {formatDate(session.submitted_at)}
                </p>
                {session.raw_questions.length === 0 && (
                  <p className="text-xs text-slate-400">Phiên kiểm tra này không lưu nội dung câu hỏi.</p>
                )}
                {session.raw_questions.map((q, index) => {
                  const answer = session.interim_answers.find((a) => a.question_index === index)
                  const options = Array.isArray(q.options) ? q.options : []
                  const selectedOption =
                    answer?.selected_option ??
                    (answer?.selected_index != null
                      ? String.fromCharCode(65 + answer.selected_index)
                      : 'Chưa trả lời')
                  return (
                    <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        Câu {index + 1}: {text(q.question_text) || text(q.prompt)}
                      </p>
                      {typeof q.image_url === 'string' && q.image_url && (
                        <img
                          className="max-h-56 max-w-full rounded-lg"
                          src={resolveMediaUrl(q.image_url)}
                          alt={`Hình câu ${index + 1}`}
                        />
                      )}
                      {!!(q.audio_url || q.media_url) && (
                        <audio
                          controls
                          preload="none"
                          src={resolveMediaUrl(text(q.audio_url) || text(q.media_url))}
                        />
                      )}
                      {options.map((option, i) => (
                        <p key={i} className="text-xs text-slate-600 dark:text-slate-300">
                          {String.fromCharCode(65 + i)}. {typeof option === 'object' && option ? text((option as Record<string, unknown>).text) : text(option)}
                        </p>
                      ))}
                      <p className="text-xs">
                        Học viên chọn: <strong>{selectedOption}</strong>
                      </p>
                      <p className="text-xs">
                        Đáp án: <strong>{text(q.correct_answer) || text(q.correct_option) || '—'}</strong>
                      </p>
                      {!!q.explanation && (
                        <p className="text-xs text-slate-500">{text(q.explanation)}</p>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
