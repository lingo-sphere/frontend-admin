import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, DatePicker, Input, Select, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { Download, RefreshCw } from 'lucide-react'
import { api } from '@/services/api.client'

type Execution = {
  model?: string | null; status?: string; input_tokens?: number | null; output_tokens?: number | null
  cost_usd?: number | null; processing_time_ms?: number | null; completed_at?: string; cache_hit?: boolean
  evaluation_id?: string; error?: string
}
type UsageRow = {
  _id: string; created_at: string; user_id: string; feature_type: string; source_service?: string
  source_id?: string; access_granted: boolean; denial_reason?: string; plan_type?: string
  quota_deducted?: number; quota_before?: number; quota_limit?: number; quota_remaining?: number; quota_unlimited?: boolean
  quota_period?: string; audit_version?: number
  exercise_context?: { exercise_id?: string; exercise_title?: string; exercise_type?: string; evaluation_type?: string; source_type?: string }
  execution?: Execution
}
type UsageResponse = {
  items: UsageRow[]; total: number; generated_at: string
  summary: { total: number; denied: number; quota_deducted: number; unknown_quota: number; input_tokens: number; output_tokens: number }
}
const formatTime = (value?: string) => value ? new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).format(new Date(value)) : '—'
const number = (value?: number | null) => value == null ? '—' : value.toLocaleString('vi-VN')
const status = (row: UsageRow) => !row.access_granted ? 'DENIED' : row.execution?.status || 'UNRESOLVED'
const statusNames: Record<string, string> = { DENIED: 'Bị từ chối', SUCCESS: 'Thành công', FAILED: 'Xử lý lỗi', UNRESOLVED: 'Chưa có kết quả' }
const featureNames: Record<string, string> = { EVALUATION: 'Chấm bài', TRANSLATION: 'Dịch thuật', CHAT: 'Trò chuyện', TUTOR: 'Gia sư', RAG: 'Tra cứu' }
const identifier = (value?: string) => <span className="break-all font-mono text-xs" title={value}>{value || '—'}</span>
const hasBalance = (row: UsageRow) => row.audit_version && !['SUSPENDED', 'FEATURE_DISABLED'].includes(row.denial_reason || '')
const vietnamToday = () => dayjs(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()))

export function AiUsageLogsCard() {
  const [dates, setDates] = useState<[string, string]>([vietnamToday().subtract(6, 'day').format('YYYY-MM-DD'), vietnamToday().format('YYYY-MM-DD')])
  const [search, setSearch] = useState('')
  const [feature, setFeature] = useState('')
  const [state, setState] = useState('')
  const [filters, setFilters] = useState({ dates, q: '', feature: '', status: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['admin-ai-usage', filters, page, pageSize],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize),
        from: `${filters.dates[0]}T00:00:00+07:00`, to: `${filters.dates[1]}T23:59:59.999+07:00` })
      if (filters.q) params.set('q', filters.q)
      if (filters.feature) params.set('feature', filters.feature)
      if (filters.status) params.set('status', filters.status)
      return api.get<UsageResponse>(`/ai/admin/usage-logs?${params}`)
    },
  })
  const columns: ColumnsType<UsageRow> = [
    { title: 'Thời điểm (UTC+7)', dataIndex: 'created_at', width: 175, render: value => <span className="whitespace-nowrap tabular-nums">{formatTime(value)}</span> },
    { title: 'Người dùng', dataIndex: 'user_id', width: 155, render: (value, row) => <div>{identifier(value)}<div className="mt-1 text-xs text-slate-500">{row.plan_type || 'Chưa rõ gói'}</div></div> },
    { title: 'Bài tập / lượt truy cập', width: 240, render: (_, row) => <div className="space-y-1"><div className="font-medium">{row.exercise_context?.exercise_title || row.exercise_context?.evaluation_type || featureNames[row.feature_type] || row.feature_type}</div><div className="text-xs text-slate-500">{row.source_service || 'DIRECT'} · {row.exercise_context?.exercise_type || row.exercise_context?.source_type || '—'}</div>{identifier(row.exercise_context?.exercise_id || row.source_id)}</div> },
    { title: 'Quota thực trừ', width: 165, render: (_, row) => <div><div className="font-semibold">{row.quota_deducted == null ? 'Chưa xác định' : `${row.quota_deducted} lượt`}</div><div className="text-xs text-slate-500">{row.quota_unlimited ? 'Không giới hạn' : hasBalance(row) ? `Còn ${number(row.quota_remaining)} / ${number(row.quota_limit)} · ${row.quota_period === 'DAY' ? 'ngày' : 'tháng'}` : row.audit_version ? 'Không kiểm tra số dư' : 'Log cũ thiếu xác nhận trừ quota'}</div></div> },
    { title: 'Model thực dùng', width: 180, render: (_, row) => <div className="break-all">{row.execution?.cache_hit ? <Tag color="blue">Cache · không gọi model</Tag> : row.execution?.model || 'Chưa ghi nhận'}{row.execution?.cache_hit && row.execution.model && <div className="text-xs text-slate-500">Nguồn: {row.execution.model}</div>}</div> },
    { title: 'Token ước tính', width: 140, render: (_, row) => <div className="tabular-nums"><div>Vào: {number(row.execution?.input_tokens)}</div><div>Ra: {number(row.execution?.output_tokens)}</div></div> },
    { title: 'Trạng thái', width: 165, render: (_, row) => <Tag color={({ SUCCESS: 'green', FAILED: 'red', DENIED: 'orange' } as Record<string, string>)[status(row)]}>{statusNames[status(row)] || status(row)}</Tag> },
  ]
  const exportPage = () => {
    const safe = (value: unknown) => {
      let text = value == null ? '' : String(value)
      if (/^\s*[=+@-]|^[\t\r]/.test(text)) text = `'${text}`
      return `"${text.replaceAll('"', '""')}"`
    }
    const rows: unknown[][] = [['Thời điểm UTC+7', 'ID nhật ký', 'Người dùng', 'Gói', 'Chức năng', 'Nguồn', 'ID bài tập/phiên', 'Tên bài', 'ID lượt nộp/nguồn', 'Quota trước lượt', 'Quota trừ', 'Quota còn', 'Quota giới hạn', 'Không giới hạn', 'Chu kỳ', 'Model', 'Cache', 'Token vào (ước tính)', 'Token ra (ước tính)', 'Chi phí USD (ước tính)', 'Thời gian ms', 'Trạng thái', 'Lý do từ chối', 'Evaluation ID', 'Từ ngày', 'Đến ngày', 'Xuất lúc UTC+7', 'Bộ lọc từ khóa', 'Bộ lọc chức năng', 'Bộ lọc trạng thái', 'Dữ liệu lấy lúc UTC+7']]
    for (const row of data?.items || []) rows.push([formatTime(row.created_at), row._id, row.user_id, row.plan_type, row.feature_type, row.source_service,
      row.exercise_context?.exercise_id, row.exercise_context?.exercise_title, row.source_id, row.quota_unlimited ? 'Không giới hạn' : row.quota_before ?? 'Chưa xác định', row.quota_deducted ?? 'Chưa xác định', row.quota_unlimited ? 'Không giới hạn' : hasBalance(row) ? row.quota_remaining : 'Chưa xác định', row.quota_limit, row.quota_unlimited, row.quota_period,
      row.execution?.model, row.execution?.cache_hit, row.execution?.input_tokens, row.execution?.output_tokens, row.execution?.cost_usd, row.execution?.processing_time_ms,
      statusNames[status(row)], row.denial_reason, row.execution?.evaluation_id, filters.dates[0], filters.dates[1], formatTime(new Date().toISOString()), filters.q, filters.feature, filters.status, formatTime(data?.generated_at)])
    const url = URL.createObjectURL(new Blob(['\uFEFF', rows.map(row => row.map(safe).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a'); link.href = url; link.download = `AI_usage_${filters.dates[0]}_${filters.dates[1]}_trang_${page}.csv`; link.click(); URL.revokeObjectURL(url)
  }
  return <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="ai-usage-title">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div><h2 id="ai-usage-title" className="text-lg font-bold">Nhật ký sử dụng AI</h2><p className="mt-1 text-sm text-slate-500">Đối chiếu quota theo từng lượt truy cập, bài tập và thời gian. Mới nhất trước · Giờ Việt Nam (UTC+7).</p></div>
      <div className="flex gap-2"><Button icon={<RefreshCw size={16} />} loading={isFetching} onClick={() => { void refetch() }}>Làm mới</Button><Button icon={<Download size={16} />} disabled={!data?.items.length || isFetching || Boolean(error)} onClick={exportPage}>Xuất trang CSV</Button></div>
    </div>
    <form className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" onSubmit={event => { event.preventDefault(); setPage(1); setFilters({ dates, q: search.trim(), feature, status: state }) }}>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Khoảng ngày (UTC+7)<DatePicker.RangePicker value={[dayjs(dates[0]), dayjs(dates[1])]} format="DD/MM/YYYY" allowClear={false} onChange={value => { if (value?.[0] && value[1]) setDates([value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]) }} /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">Người dùng / bài / model<Input value={search} maxLength={200} onChange={event => setSearch(event.target.value)} placeholder="Nhập mã hoặc tên bài tập" /></label>
      <label className="flex flex-col gap-1 text-sm">Chức năng<Select value={feature} onChange={setFeature} options={[{ value: '', label: 'Tất cả chức năng' }, ...Object.entries(featureNames).map(([value, label]) => ({ value, label }))]} /></label>
      <label className="flex flex-col gap-1 text-sm">Trạng thái<Select value={state} onChange={setState} options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(statusNames).map(([value, label]) => ({ value, label }))]} /></label>
      <Button className="self-end" type="primary" htmlType="submit" loading={isFetching}>Áp dụng bộ lọc</Button>
    </form>
    {error ? <Alert type="error" showIcon title="Không tải được nhật ký AI" description={error instanceof Error ? error.message : 'Vui lòng thử lại.'} /> : <>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-live="polite">
        {[['Lượt truy cập', data?.summary.total], ['Quota đã trừ', data?.summary.quota_deducted], ['Lượt bị từ chối', data?.summary.denied], ['Log chưa rõ quota', data?.summary.unknown_quota]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 text-xl font-semibold tabular-nums">{number(value as number | undefined)}</div></div>)}
      </div>
      <Table<UsageRow> rowKey="_id" columns={columns} dataSource={data?.items || []} loading={isFetching} scroll={{ x: 1230 }}
        locale={{ emptyText: 'Không có lượt truy cập AI trong bộ lọc đã chọn.' }}
        pagination={{ current: page, pageSize, total: data?.total || 0, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100], showTotal: total => `${total} lượt truy cập`, onChange: (next, size) => { setPage(size !== pageSize ? 1 : next); setPageSize(size) } }}
        expandable={{ expandedRowRender: row => <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries({ 'Mã nhật ký': row._id, 'Mã lượt nộp / nguồn': row.source_id, 'Mã bài tập / phiên thi': row.exercise_context?.exercise_id,
            'Quota trước lượt truy cập': row.quota_unlimited ? 'Không giới hạn' : number(row.quota_before),
            'Mã kết quả AI': row.execution?.evaluation_id, 'Hoàn tất lúc (UTC+7)': formatTime(row.execution?.completed_at),
            'Thời gian xử lý': row.execution?.processing_time_ms == null ? 'Chưa ghi nhận' : `${number(row.execution.processing_time_ms)} ms`,
            'Chi phí ước tính (USD)': row.execution?.cost_usd == null ? 'Chưa ghi nhận' : row.execution.cost_usd.toFixed(6),
            'Lý do từ chối': row.denial_reason, 'Lỗi xử lý': row.execution?.error,
          }).map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-all">{value || '—'}</dd></div>)}
        </dl> }} />
    </>}
    <p className="mt-4 text-xs leading-5 text-slate-500">Quota là số lượt thực trừ; gói không giới hạn có thể dùng AI mà không trừ lượt. Token và chi phí là ước tính của hệ thống. Log cũ thiếu dữ liệu được giữ là “Chưa xác định”; “Chưa có kết quả” không đồng nghĩa đã gọi model thành công. Số liệu tổng áp dụng cho bộ lọc; CSV chỉ xuất trang đang xem.{data && ` Dữ liệu lấy lúc ${formatTime(data.generated_at)} (UTC+7).`}</p>
  </section>
}
