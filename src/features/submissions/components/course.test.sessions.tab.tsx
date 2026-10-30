// Component hiển thị danh sách các phiên kiểm tra khóa học và thống kê tổng quan.
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Modal, Select, Spin, Tag } from 'antd'
import { Layers, CheckCircle2, AlertTriangle } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { CustomSelect } from '@/components/custom.select'
import { StatCard } from '@/components/stat.card'
import { type CourseSimple } from '@/features/courses/hooks/use.course.learners.data'
import { progressService, type CourseTestSession } from '@/features/progress/services/progress.service'
import { userService } from '@/features/users/services/user.service'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'

type SessionRow = CourseTestSession & { course_title: string; user_email: string }
const testTypes: Record<string, string> = {
  challenge: 'Challenge', 'post-mini': 'Kiểm tra chương', 'final-test': 'Kiểm tra cuối khóa',
}
const statuses: Record<string, string> = {
  IN_PROGRESS: 'Đang làm', SUBMITTED: 'Đã nộp', EXPIRED: 'Hết hạn',
  AWAITING_GRADING: 'Chờ chấm', FINALIZING: 'Đang xử lý',
}
const formatDate = (date?: string | null) => date ? new Date(date).toLocaleString('vi-VN') : '—'
const text = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : ''

export function CourseTestSessionsTab({ courses, selectedCourseId, onSelectCourseId, isLoadingCourses, coursesError }: {
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
  const targetCourses = useMemo(() => courses.filter(c => selectedCourseId === 'ALL' || c.id === selectedCourseId), [courses, selectedCourseId])
  const { data: rows = [], isLoading, error, refetch } = useQuery({
    queryKey: ['course-test-sessions', targetCourses.map(c => c.id).sort().join(',')],
    enabled: targetCourses.length > 0,
    queryFn: async (): Promise<SessionRow[]> => {
      const results = await Promise.all(targetCourses.map(async course => {
        const sessions = await progressService.getCourseTestSessions(course.id)
        return sessions.map(session => ({ ...session, course_title: course.title }))
      }))
      const sessions = results.flat()
      const profiles = new Map(await Promise.all([...new Set(sessions.map(s => s.user_id))].map(async id => {
        return [id, await userService.getProfileById(id).catch(() => null)] as const
      })))
      return sessions.map(s => ({ ...s,
        user_email: profiles.get(s.user_id)?.email || '' }))
        .sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at))
    },
  })
  const detail = useQuery({
    queryKey: ['course-test-session-detail', selected?.course_id, selected?._id],
    enabled: !!selected,
    queryFn: () => progressService.getCourseTestSession(selected!.course_id, selected!._id),
  })
  const filtered = useMemo(() => rows.filter(row =>
    (type === 'ALL' || row.test_type === type) && (status === 'ALL' || row.status === status) &&
    `${row.user_id} ${row.user_email} ${row.course_title}`.toLowerCase().includes(search.trim().toLowerCase())
  ), [rows, type, status, search])
  const columns: DataTableColumn<SessionRow>[] = [
    { key: 'student', title: 'Học viên', render: row => <span>{row.user_email || row.user_id}</span> },
    { key: 'course', title: 'Khóa học', render: row => row.course_title },
    { key: 'type', title: 'Loại bài kiểm tra', render: row => <div>{testTypes[row.test_type] || row.test_type}{row.test_type !== 'final-test' && row.order_index ? <div className="text-xs text-slate-500">Chương {row.order_index}</div> : null}</div> },
    { key: 'score', title: 'Điểm', align: 'center', render: row => row.score == null ? 'Chưa có điểm' : `${row.score}/100` },
    { key: 'result', title: 'Kết quả', render: row => row.is_passed == null ? '—' : <Tag color={row.is_passed ? 'green' : 'orange'}>{row.is_passed ? 'Đạt' : 'Chưa đạt'}</Tag> },
    { key: 'status', title: 'Trạng thái', render: row => <Tag>{statuses[row.status] || row.status}</Tag> },
    { key: 'started_at', title: 'Bắt đầu', render: row => formatDate(row.started_at) },
    { key: 'submitted_at', title: 'Nộp bài', render: row => formatDate(row.submitted_at) },
    { key: 'actions', title: 'Thao tác', render: row => <Button onClick={() => setSelected(row)}>Xem bài làm</Button> },
  ]
  const session = detail.data
  return <div className="space-y-4">
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
        value={rows.filter(r => r.status === 'SUBMITTED').length.toLocaleString('vi-VN')}
        subtitle="Học viên hoàn thành bài kiểm tra"
        icon={CheckCircle2}
        color="emerald"
        trend={rows.length > 0 ? `${Math.round((rows.filter(r => r.status === 'SUBMITTED').length / rows.length) * 100)}%` : undefined}
        trendType="up"
        loading={isLoadingCourses || isLoading}
      />
      <StatCard
        title="Phiên Hết Hạn"
        value={rows.filter(r => r.status === 'EXPIRED').length.toLocaleString('vi-VN')}
        subtitle="Phiên làm bài bị quá thời gian quy định"
        icon={AlertTriangle}
        color="rose"
        trend={rows.filter(r => r.status === 'EXPIRED').length > 0 ? `${rows.filter(r => r.status === 'EXPIRED').length}` : undefined}
        trendType={rows.filter(r => r.status === 'EXPIRED').length > 0 ? 'down' : 'neutral'}
        loading={isLoadingCourses || isLoading}
      />
    </div>
    <DataTable<SessionRow>
      title="Bài kiểm tra khóa học"
      subtitle="Challenge, kiểm tra chương và kiểm tra cuối khóa của học viên"
      columns={columns} data={filtered.slice((page - 1) * pageSize, page * pageSize)} rowKey={row => row._id}
      isLoading={isLoadingCourses || isLoading} error={coursesError || error}
      retry={() => refetch()} emptyText="Chưa có phiên kiểm tra trong khóa học đã chọn"
      search={search} onSearchChange={value => { setSearch(value); setPage(1) }} searchPlaceholder="Tìm email, mã học viên, khóa học..."
      extraActions={<><div className="w-72"><CustomSelect value={selectedCourseId} onChange={onSelectCourseId} options={[{ value: 'ALL', label: 'Tất cả khóa học' }, ...courses.map(c => ({ value: c.id, label: c.title }))]} /></div><Button onClick={() => { void refetch() }}>Làm mới</Button></>}
      filterSlot={<div className="flex flex-wrap gap-3"><Select aria-label="Loại bài kiểm tra" className="min-w-48" value={type} onChange={value => { setType(value); setPage(1) }} options={[{ value: 'ALL', label: 'Tất cả loại bài' }, ...Object.entries(testTypes).map(([value, label]) => ({ value, label }))]} /><Select aria-label="Trạng thái bài kiểm tra" className="min-w-48" value={status} onChange={value => { setStatus(value); setPage(1) }} options={[{ value: 'ALL', label: 'Tất cả trạng thái' }, ...Object.entries(statuses).map(([value, label]) => ({ value, label }))]} /></div>}
      pagination={{ currentPage: page, pageSize, totalItems: filtered.length, onPageChange: setPage, onPageSizeChange: value => { setPageSize(value); setPage(1) } }}
    />
    <Modal open={!!selected} onCancel={() => setSelected(null)} footer={null} width={850} title="Chi tiết bài kiểm tra khóa học" destroyOnHidden>
      {selected && <div className="space-y-4">
        <p>{selected.user_email || selected.user_id} · {selected.course_title} · {testTypes[selected.test_type] || selected.test_type}</p>
        {detail.isLoading && <Spin />}
        {detail.error && <p role="alert">Không tải được bài làm. <Button onClick={() => { void detail.refetch() }}>Thử lại</Button></p>}
        {session && <>
          <p>Điểm: <strong>{session.score == null ? 'Chưa có điểm' : `${session.score}/100`}</strong> · {statuses[session.status] || session.status} · Điểm đạt: {session.passing_score ?? '—'}</p>
          <p className="text-xs text-slate-500">Bắt đầu: {formatDate(session.started_at)} · Nộp bài: {formatDate(session.submitted_at)}</p>
          {session.raw_questions.length === 0 && <p>Phiên kiểm tra này không lưu nội dung câu hỏi.</p>}
          {session.raw_questions.map((q, index) => {
            const answer = session.interim_answers.find(a => a.question_index === index)
            const options = Array.isArray(q.options) ? q.options : []
            const selectedOption = answer?.selected_option ?? (answer?.selected_index != null ? String.fromCharCode(65 + answer.selected_index) : 'Chưa trả lời')
            return <div key={index} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="font-semibold">Câu {index + 1}: {text(q.question_text) || text(q.prompt)}</p>
              {typeof q.image_url === 'string' && q.image_url && <img className="max-h-56 max-w-full" src={resolveMediaUrl(q.image_url)} alt={`Hình câu ${index + 1}`} />}
              {!!(q.audio_url || q.media_url) && <audio controls preload="none" src={resolveMediaUrl(text(q.audio_url) || text(q.media_url))} />}
              {options.map((option, i) => <p key={i}>{String.fromCharCode(65 + i)}. {typeof option === 'object' && option ? text((option as Record<string, unknown>).text) : text(option)}</p>)}
              <p>Học viên chọn: <strong>{selectedOption}</strong></p>
              <p>Đáp án: <strong>{text(q.correct_answer) || text(q.correct_option) || '—'}</strong></p>
              {!!q.explanation && <p className="text-sm text-slate-500">{text(q.explanation)}</p>}
            </div>
          })}
        </>}
      </div>}
    </Modal>
  </div>
}
