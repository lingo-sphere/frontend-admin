// Bảng hiển thị danh sách bài nộp và yêu cầu phúc khảo phần luyện tập.

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Tooltip } from 'antd'
import { FileCheck2, Clock, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { TableTextCell } from '@/components/table.text.cell'
import { CustomSelect } from '@/components/custom.select'
import { StatCard } from '@/components/stat.card'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'
import { practiceReviewService, type PracticeSkill, type PracticeSubmission } from '@/features/submissions/services/practice.review.service'
import { practiceScoreLabel, practiceDateLabel, practiceExerciseLabels } from '@/features/submissions/helpers/practice.submission.display'

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
    {
      key: 'student',
      title: 'Học viên',
      width: 220,
      render: (item) => {
        const email = item.user_email || item.user_id || 'HV'
        const initials = email.slice(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-2.5 min-w-0 w-full">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-[11px] shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <Tooltip title={email} placement="topLeft" mouseEnterDelay={0.3}>
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate block w-full">
                  {email}
                </p>
              </Tooltip>
              {item.user_email && item.user_id && (
                <p className="text-[11px] text-slate-400 font-mono truncate block w-full" title={item.user_id}>
                  ID: {item.user_id.slice(-6)}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'title',
      title: 'Bài luyện tập',
      minWidth: 200,
      render: (item) => (
        <TableTextCell
          text={item.title || 'Bài luyện tập'}
        />
      ),
    },
    {
      key: 'type',
      title: 'Loại bài',
      width: 140,
      align: 'center',
      render: (item) => {
        const label = practiceExerciseLabels[item.exercise_type || ''] || item.exercise_type || '—'
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 whitespace-nowrap">
            {label}
          </span>
        )
      },
    },
    {
      key: 'ai_score',
      title: 'Điểm AI',
      width: 100,
      align: 'center',
      render: (item) => (
        <span className="font-bold font-mono text-xs text-indigo-600 dark:text-indigo-400">
          {practiceScoreLabel(item, true)}
        </span>
      ),
    },
    {
      key: 'score',
      title: 'Điểm hiện tại',
      width: 110,
      align: 'center',
      render: (item) => (
        <span className="font-bold font-mono text-xs text-slate-900 dark:text-slate-100">
          {practiceScoreLabel(item)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: 150,
      align: 'center',
      render: (item) => {
        if (item.record_type === 'GRADING_REQUEST') {
          const isFailed = item.status === 'FAILED'
          return (
            <Tooltip title={item.error}>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isFailed
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800'
              }`}>
                {isFailed ? 'Chấm lỗi' : 'Đang chấm'}
              </span>
            </Tooltip>
          )
        }
        if (item.review?.status === 'REQUESTED') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Yêu cầu phúc khảo</span>
            </span>
          )
        }
        if (item.review?.status === 'RESOLVED') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Đã kiểm tra</span>
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>AI đã chấm</span>
          </span>
        )
      },
    },
    {
      key: 'submitted_at',
      title: 'Nộp bài',
      width: 160,
      align: 'center',
      render: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
          {practiceDateLabel(item.submitted_at)}
        </span>
      ),
    },
    {
      key: 'reviewed_at',
      title: 'Đã kiểm tra lúc',
      width: 160,
      align: 'center',
      render: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
          {practiceDateLabel(item.review?.reviewed_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: 130,
      align: 'center',
      fixed: 'right',
      render: (item) => item.record_type === 'GRADING_REQUEST' ? (
        <Button
          size="small"
          type="primary"
          ghost
          loading={retry.isPending && retry.variables === item.id}
          disabled={retry.isPending}
          onClick={() => retry.mutate(item.id)}
          className="rounded-lg text-xs font-semibold"
        >
          Thử chấm lại
        </Button>
      ) : (
        <Button
          size="small"
          type="primary"
          ghost
          onClick={() => onOpenReview(item.id)}
          className="rounded-lg text-xs font-semibold"
        >
          Xem & chấm bài
        </Button>
      ),
    },
  ]

  const reset = () => {
    setStatus('ALL')
    setStandard('ALL')
    setSearch('')
    setPage(1)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Chấm điểm & Phúc khảo — Luyện tập {skill === 'SPEAKING' ? 'Speaking' : 'Writing'}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Xem bài làm, đối chiếu điểm AI và xử lý yêu cầu phúc khảo. Yêu cầu chưa giải quyết được ưu tiên theo thời gian gửi.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { void query.refetch() }}
          disabled={query.isFetching}
          className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs shrink-0 disabled:opacity-60"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${query.isFetching ? 'animate-spin text-indigo-500' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Bài Phù Hợp Bộ Lọc"
          value={query.data?.total != null ? query.data.total.toLocaleString('vi-VN') : '—'}
          subtitle="Tổng số bài làm theo tiêu chí đang lọc"
          icon={FileCheck2}
          color="indigo"
          trend={query.data?.total != null && query.data.total > 0 ? `${query.data.total}` : undefined}
          trendType="neutral"
          loading={query.isFetching && !query.data}
        />
        <StatCard
          title="Yêu Cầu Phúc Khảo"
          value={query.data?.pending != null ? query.data.pending.toLocaleString('vi-VN') : '—'}
          subtitle="Học viên gửi yêu cầu giáo viên chấm lại"
          icon={Clock}
          color="amber"
          trend={query.data?.pending != null && query.data.pending > 0 ? `${query.data.pending}` : undefined}
          trendType={query.data?.pending ? 'down' : 'neutral'}
          loading={query.isFetching && !query.data}
        />
        <StatCard
          title="Đã Kiểm Tra"
          value={query.data?.reviewed != null ? query.data.reviewed.toLocaleString('vi-VN') : '—'}
          subtitle="Bài làm đã hoàn tất đánh giá và cập nhật điểm"
          icon={CheckCircle2}
          color="emerald"
          trend={query.data?.total && query.data.total > 0 ? `${Math.round(((query.data.reviewed || 0) / query.data.total) * 100)}%` : undefined}
          trendType="up"
          loading={query.isFetching && !query.data}
        />
      </div>

      <DataTable<PracticeSubmission>
        data={query.data?.items || []}
        columns={columns}
        rowKey={(item) => item.id}
        isLoading={query.isFetching}
        error={query.error}
        retry={() => query.refetch()}
        emptyText="Không có bài luyện tập phù hợp bộ lọc."
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Tìm email, mã học viên hoặc tên bài..."
        filterSlot={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-56">
              <CustomSelect
                value={status}
                onChange={(value) => {
                  setStatus(value)
                  setPage(1)
                }}
                options={[
                  { value: 'ALL', label: 'Tất cả bài có điểm' },
                  { value: 'REQUESTED', label: 'Yêu cầu phúc khảo' },
                  { value: 'RESOLVED', label: 'Đã kiểm tra' },
                  { value: 'NONE', label: 'Chưa kiểm tra' },
                  ...(isAdmin ? [{ value: 'FAILED', label: 'Bài chưa chấm xong / lỗi' }] : []),
                ]}
              />
            </div>
            <div className="w-48">
              <CustomSelect
                value={standard}
                disabled={status === 'FAILED'}
                onChange={(value) => {
                  setStandard(value)
                  setPage(1)
                }}
                options={[
                  { value: 'ALL', label: 'Tất cả thang điểm' },
                  { value: 'PRACTICAL', label: 'Thực hành /100' },
                  { value: 'TOEIC', label: 'TOEIC' },
                ]}
              />
            </div>
          </div>
        }
        onResetFilters={reset}
        scroll={{ x: 1200 }}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: query.data?.total || 0,
          onPageChange: setPage,
          onPageSizeChange: (value) => {
            setPageSize(value)
            setPage(1)
          },
        }}
      />
    </div>
  )
}
