import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Select, Tag, Tooltip } from 'antd'
import { FileCheck2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'
import { practiceReviewService, type PracticeSkill, type PracticeSubmission } from '../services/practice.review.service'
import { practiceScoreLabel, practiceDateLabel, practiceExerciseLabels } from '../helpers/practice.submission.display'

export function PracticeSubmissionsTable({ skill, onOpenReview }: {
  skill: PracticeSkill; onOpenReview: (id: string) => void
}) {
  const [status, setStatus] = useState('ALL')
  const [standard, setStandard] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const user = useAuthStore(state => state.user)
  const isAdmin = user?.role === 'ADMIN'
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['practice-submissions', skill, status, standard, search, page, pageSize],
    queryFn: () => practiceReviewService.list(skill, {
      status, search, page, limit: pageSize, ...(standard === 'ALL' ? {} : { standard }),
    }),
  })
  const retry = useMutation({
    mutationFn: (id: string) => practiceReviewService.retry(skill, id),
    onSuccess: () => {
      toast.success('Đã chấm lại bài luyện tập')
      void client.invalidateQueries({ queryKey: ['practice-submissions'] })
    },
    onError: (error: Error) => toast.error(error.message || 'Chưa chấm được, bài vẫn được giữ để thử lại'),
  })
  const columns: DataTableColumn<PracticeSubmission>[] = [
    { key: 'student', title: 'Học viên', width: 320, align: 'center', render: item => <span className="block truncate px-2 text-center" title={item.user_email || item.user_id}>{item.user_email || item.user_id}</span> },
    { key: 'title', title: 'Bài luyện tập', minWidth: 200, render: item => <span className="font-semibold">{item.title || 'Bài luyện tập'}</span> },
    { key: 'type', title: 'Loại bài', minWidth: 140, render: item => practiceExerciseLabels[item.exercise_type || ''] || item.exercise_type || '—' },
    { key: 'standard', title: 'Thang điểm', initiallyHidden: true, render: item => <Tag color={item.grading_standard === 'TOEIC' ? 'blue' : 'default'}>{item.grading_standard === 'TOEIC' ? 'TOEIC' : 'Thực hành /100'}</Tag> },
    { key: 'attempt', title: 'Lượt / phiên bản', initiallyHidden: true, align: 'center', render: item => item.attempt_number ?? item.version_number ?? '—' },
    { key: 'size', title: skill === 'SPEAKING' ? 'Thời lượng ghi âm' : 'Số từ', initiallyHidden: true, align: 'center', render: item => skill === 'SPEAKING'
      ? (item.recording_duration_seconds == null ? '—' : `${item.recording_duration_seconds} giây`)
      : item.word_count ?? '—' },
    { key: 'ai_score', title: 'Điểm AI', align: 'center', render: item => <span className="font-bold text-indigo-600 dark:text-indigo-400">{practiceScoreLabel(item, true)}</span> },
    { key: 'score', title: 'Điểm hiện tại', align: 'center', render: item => <span className="font-bold">{practiceScoreLabel(item)}</span> },
    { key: 'status', title: 'Trạng thái', render: item => item.record_type === 'GRADING_REQUEST'
      ? <Tooltip title={item.error}><Tag color={item.status === 'FAILED' ? 'red' : 'processing'}>{({ FAILED: 'Chấm lỗi', PENDING: 'Chờ chấm', PROCESSING: 'Đang chấm' } as Record<string, string>)[item.status || ''] || item.status}</Tag></Tooltip>
      : item.review?.status === 'REQUESTED' ? <Tag color="gold">Yêu cầu phúc khảo</Tag>
      : item.review?.status === 'RESOLVED' ? <Tag color="green">Đã kiểm tra</Tag> : <Tag>AI đã chấm</Tag> },
    { key: 'submitted_at', title: 'Nộp bài', minWidth: 170, render: item => <span className="whitespace-nowrap">{practiceDateLabel(item.submitted_at)}</span> },
    { key: 'created_at', title: 'Tạo bài', initiallyHidden: true, minWidth: 170, render: item => practiceDateLabel(item.created_at) },
    { key: 'completed_at', title: 'Hoàn thành', initiallyHidden: true, minWidth: 170, render: item => practiceDateLabel(item.completed_at) },
    { key: 'requested_at', title: 'Yêu cầu phúc khảo', initiallyHidden: true, minWidth: 170, render: item => practiceDateLabel(item.review?.requested_at) },
    { key: 'reviewed_at', title: 'Đã kiểm tra lúc', minWidth: 170, render: item => practiceDateLabel(item.review?.reviewed_at) },
    { key: 'reviewer', title: 'Người kiểm tra', initiallyHidden: true, render: item => item.review?.reviewer_name || '—' },
    { key: 'actions', title: 'Thao tác', sticky: 'right', render: item => item.record_type === 'GRADING_REQUEST'
      ? <Button loading={retry.isPending && retry.variables === item.id} disabled={retry.isPending} onClick={() => retry.mutate(item.id)}>Thử chấm lại</Button>
      : <Button onClick={() => onOpenReview(item.id)}>Xem & chấm bài</Button> },
  ]
  const reset = () => { setStatus('ALL'); setStandard('ALL'); setSearch(''); setPage(1) }
  return <div className="space-y-6 animate-in fade-in duration-200">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"><FileCheck2 className="h-6 w-6" /></div>
      <div><h1 className="text-xl font-bold text-slate-900 dark:text-white">Chấm điểm & Phúc khảo — Luyện tập {skill === 'SPEAKING' ? 'Speaking' : 'Writing'}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Xem bài làm, đối chiếu điểm AI và xử lý yêu cầu phúc khảo. Yêu cầu chưa giải quyết được ưu tiên theo thời gian gửi.</p></div>
    </div>
    <nav className="flex flex-wrap gap-3 text-sm">
      <Link className={skill === 'SPEAKING' ? 'font-bold text-indigo-600' : ''} to="/submissions/practice/speaking">Luyện tập Speaking</Link>
      <Link className={skill === 'WRITING' ? 'font-bold text-indigo-600' : ''} to="/submissions/practice/writing">Luyện tập Writing</Link>
      <Link to="/submissions/courses">Bài kiểm tra khóa học</Link>
    </nav>
    <div className="grid grid-cols-3 gap-4">
      {[
        ['Bài phù hợp bộ lọc', query.data?.total], ['Yêu cầu phúc khảo', query.data?.pending], ['Đã kiểm tra', query.data?.reviewed],
      ].map(([label, count]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{count ?? '—'}</p></div>)}
    </div>
    <DataTable<PracticeSubmission>
      title={`Bài luyện tập ${skill === 'SPEAKING' ? 'Speaking' : 'Writing'}`}
      subtitle="Tài khoản, bài làm, điểm số và lịch sử xử lý phúc khảo"
      data={query.data?.items || []} columns={columns} rowKey={item => item.id}
      isLoading={query.isFetching} error={query.error} retry={() => query.refetch()}
      emptyText="Không có bài luyện tập phù hợp bộ lọc."
      search={search} onSearchChange={value => { setSearch(value); setPage(1) }} searchLabel="Tìm bài luyện tập" searchPlaceholder="Tìm email, mã học viên hoặc tên bài..."
      extraActions={<Button aria-label="Làm mới bài luyện tập" onClick={() => { void query.refetch() }}>Làm mới</Button>}
      filterSlot={<div className="flex flex-wrap gap-3">
        <Select aria-label="Trạng thái bài luyện tập" className="min-w-56" value={status} onChange={value => { setStatus(value); setPage(1) }} options={[
          { value: 'ALL', label: 'Tất cả bài có điểm' }, { value: 'REQUESTED', label: 'Yêu cầu phúc khảo' },
          { value: 'RESOLVED', label: 'Đã được giáo viên kiểm tra' }, { value: 'NONE', label: 'Chưa kiểm tra' },
          ...(isAdmin ? [{ value: 'FAILED', label: 'Bài chưa chấm xong / chấm lỗi' }] : []),
        ]} />
        <Select aria-label="Thang điểm bài luyện tập" className="min-w-44" value={standard} disabled={status === 'FAILED'} onChange={value => { setStandard(value); setPage(1) }} options={[
          { value: 'ALL', label: 'Tất cả thang điểm' }, { value: 'PRACTICAL', label: 'Thực hành /100' }, { value: 'TOEIC', label: 'TOEIC' },
        ]} />
      </div>}
      onResetFilters={reset} scroll={{ x: 1600 }}
      pagination={{ currentPage: page, pageSize, totalItems: query.data?.total || 0, onPageChange: setPage, onPageSizeChange: value => { setPageSize(value); setPage(1) } }}
    />
  </div>
}
