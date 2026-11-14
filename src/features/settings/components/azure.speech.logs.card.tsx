import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Alert, Button, DatePicker, Input, Select, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { Download, RefreshCw } from 'lucide-react'
import { api } from '@/services/api.client'
import { azureLogsCsv, azureLogTime, type AzureSpeechLog, type AzureSpeechLogsResponse } from '../helpers/azure.speech.logs'

const today = () => dayjs(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()))
const id = (value?: string) => <span className="break-all font-mono text-xs">{value || '—'}</span>

export function AzureSpeechLogsCard() {
  const { i18n } = useTranslation(), vi = (i18n.resolvedLanguage || i18n.language).startsWith('vi'), locale = vi ? 'vi-VN' : 'en-US'
  const [dates, setDates] = useState<[string, string]>([today().subtract(6, 'day').format('YYYY-MM-DD'), today().format('YYYY-MM-DD')])
  const [search, setSearch] = useState(''), [mode, setMode] = useState(''), [status, setStatus] = useState('')
  const [filters, setFilters] = useState({ dates, q: '', mode: '', status: '' })
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(20)
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['admin-azure-speech-logs', filters, page, pageSize],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), page_size: String(pageSize), from: `${filters.dates[0]}T00:00:00+07:00`, to: `${filters.dates[1]}T23:59:59.999+07:00` })
      if (filters.q) params.set('q', filters.q)
      if (filters.mode) params.set('mode', filters.mode)
      if (filters.status) params.set('status', filters.status)
      return api.get<AzureSpeechLogsResponse>(`/ai/admin/azure-speech/usage-logs?${params}`)
    },
  })
  const statuses: Record<string, string> = vi ? { STARTED: 'Đang chuẩn bị', SENT: 'Đang gọi Azure', SUCCESS: 'Thành công', FAILED: 'Lỗi', TIMED_OUT: 'Hết thời gian', CANCELLED: 'Đã hủy', CACHE_HIT: 'Dùng cache' } : { STARTED: 'Preparing', SENT: 'Calling Azure', SUCCESS: 'Success', FAILED: 'Failed', TIMED_OUT: 'Timed out', CANCELLED: 'Cancelled', CACHE_HIT: 'Cached' }
  const number = (value?: number | null, digits = 2) => value == null ? '—' : value.toLocaleString(locale, { maximumFractionDigits: digits })
  const timestamp = (value?: string) => azureLogTime(value, locale)
  const columns: ColumnsType<AzureSpeechLog> = [
    { title: vi ? 'Thời điểm (UTC+7)' : 'Time (UTC+7)', width: 175, render: (_, row) => <div className="whitespace-nowrap tabular-nums">{timestamp(row.created_at)}</div> },
    { title: vi ? 'Người học' : 'Learner', dataIndex: 'user_id', width: 170, render: id },
    { title: vi ? 'Bài / lượt thoại' : 'Exercise / turn', width: 240, render: (_, row) => <div><p className="font-medium">{row.exercise_title || row.exercise_type}</p>{id(row.exercise_id)}<p className="mt-1 text-xs text-slate-500">{row.turn_number ? `${vi ? 'Lượt' : 'Turn'} ${row.turn_number}` : vi ? 'Bài đơn' : 'Single recording'} · {vi ? 'Lần gọi' : 'Call'} {row.call_index}</p></div> },
    { title: vi ? 'Mã lượt nộp' : 'Submission request', width: 190, dataIndex: 'request_id', render: id },
    { title: vi ? 'Cấu hình chấm' : 'Assessment', width: 160, render: (_, row) => <div><Tag>{row.mode === 'SCRIPTED' ? (vi ? 'Theo mẫu' : 'Scripted') : (vi ? 'Nói tự do' : 'Unscripted')}</Tag><p className="mt-1 text-xs">{row.region} · {row.locale}</p></div> },
    { title: vi ? 'Audio đã gửi' : 'Audio submitted', width: 140, render: (_, row) => <div className="tabular-nums">{number(row.audio_seconds_submitted)} s{row.provider_dispatched && row.audio_seconds_submitted == null && <div className="text-xs text-amber-600">{vi ? 'Chưa rõ thời lượng' : 'Duration unknown'}</div>}</div> },
    { title: vi ? 'Chi phí ước tính' : 'Estimated cost', width: 150, render: (_, row) => row.cost_usd_estimate == null ? <span>{vi ? 'Chưa có đơn giá' : 'Rate unavailable'}</span> : <span className="tabular-nums">${row.cost_usd_estimate.toFixed(6)}</span> },
    { title: vi ? 'Trạng thái' : 'Status', width: 155, render: (_, row) => <div><Tag color={row.status === 'SUCCESS' ? 'green' : row.status === 'CACHE_HIT' ? 'blue' : ['STARTED', 'SENT'].includes(row.status) ? 'default' : 'red'}>{statuses[row.status] || row.status}</Tag>{row.error_code && <p className="mt-1 break-all text-xs text-slate-500">{row.error_code}</p>}</div> },
  ]
  const exportPage = () => {
    if (!data) return
    const blob = new Blob([azureLogsCsv(data, filters, page, new Date().toISOString())], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = `Azure_Speech_${filters.dates[0]}_${filters.dates[1]}_page_${page}.csv`; link.click(); URL.revokeObjectURL(url)
  }
  return <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900" aria-labelledby="azure-speech-log-title">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div><h2 id="azure-speech-log-title" className="text-lg font-bold">{vi ? 'Nhật ký Azure Speech' : 'Azure Speech Usage Log'}</h2><p className="mt-1 text-sm text-slate-500">{vi ? 'Đối chiếu từng bản thu, lượt thoại, thời lượng audio và lần gọi Azure. Giờ Việt Nam (UTC+7).' : 'Audit recordings, dialogue turns, audio duration and Azure calls. Vietnam time (UTC+7).'}</p></div>
      <div className="flex gap-2"><Button icon={<RefreshCw size={16} />} loading={isFetching} onClick={() => void refetch()}>{vi ? 'Làm mới' : 'Refresh'}</Button><Button icon={<Download size={16} />} disabled={!data?.items.length || isFetching || Boolean(error)} onClick={exportPage}>{vi ? 'Xuất trang CSV' : 'Export page CSV'}</Button></div>
    </div>
    {data?.integration_status === 'ADAPTER_IMPLEMENTED' && <div className="mb-4"><Alert type={data.azure_enabled && data.credentials_configured ? 'success' : 'info'} showIcon title={vi ? 'Đã tích hợp bộ chấm Azure Speech' : 'Azure Speech assessment adapter implemented'} description={vi ? 'Mỗi audio thực gửi Azure được ghi riêng theo bài và lượt thoại. Cache không phát sinh audio gửi mới; chi phí hiển thị là ước tính.' : 'Each audio dispatched to Azure is logged by exercise and turn. Cache reuse sends no new audio; displayed costs are estimates.'} /></div>}
    {data?.integration_status === 'AUDIT_READY_ADAPTER_PENDING' && <div className="mb-4"><Alert type="info" showIcon title={vi ? 'Nhật ký đã sẵn sàng; bộ kết nối chấm Azure chưa triển khai' : 'Audit ready; Azure assessment adapter is pending'} description={vi ? 'Chưa có dữ liệu thật cho đến khi bộ kết nối Azure được triển khai và thực sự gửi audio. Không tạo log hoặc số liệu mẫu trong hệ thống.' : 'Real records appear after the Azure adapter is implemented and sends audio. No sample logs or synthetic usage are created.'} /></div>}
    {data && <p className="mb-4 text-xs text-slate-500">{vi ? 'Cấu hình backend:' : 'Backend configuration:'} {data.credentials_configured ? (vi ? 'đã có key và region' : 'key and region present') : (vi ? 'chưa đủ key/region' : 'key/region missing')} · {data.azure_enabled ? (vi ? 'cờ Azure đang bật' : 'Azure flag enabled') : (vi ? 'cờ Azure đang tắt' : 'Azure flag disabled')}</p>}
    <form className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" onSubmit={event => { event.preventDefault(); setPage(1); setFilters({ dates, q: search.trim(), mode, status }) }}>
      <label className="flex min-w-0 flex-col gap-1 text-sm">{vi ? 'Khoảng ngày (UTC+7)' : 'Date range (UTC+7)'}<DatePicker.RangePicker value={[dayjs(dates[0]), dayjs(dates[1])]} format="DD/MM/YYYY" allowClear={false} onChange={value => { if (value?.[0] && value[1]) setDates([value[0].format('YYYY-MM-DD'), value[1].format('YYYY-MM-DD')]) }} /></label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">{vi ? 'Người học / bài / mã lượt nộp' : 'Learner / exercise / request'}<Input value={search} maxLength={200} onChange={event => setSearch(event.target.value)} placeholder={vi ? 'Nhập tên hoặc mã' : 'Enter name or ID'} /></label>
      <label className="flex flex-col gap-1 text-sm">{vi ? 'Chế độ' : 'Mode'}<Select value={mode} onChange={setMode} options={[{ value: '', label: vi ? 'Tất cả' : 'All' }, { value: 'SCRIPTED', label: vi ? 'Theo mẫu' : 'Scripted' }, { value: 'UNSCRIPTED', label: vi ? 'Nói tự do' : 'Unscripted' }]} /></label>
      <label className="flex flex-col gap-1 text-sm">{vi ? 'Trạng thái' : 'Status'}<Select value={status} onChange={setStatus} options={[{ value: '', label: vi ? 'Tất cả' : 'All' }, ...Object.entries(statuses).map(([value, label]) => ({ value, label }))]} /></label>
      <Button className="self-end" type="primary" htmlType="submit" loading={isFetching}>{vi ? 'Áp dụng bộ lọc' : 'Apply filters'}</Button>
    </form>
    {error ? <Alert type="error" showIcon title={vi ? 'Không tải được nhật ký Azure' : 'Unable to load Azure logs'} description={error instanceof Error ? error.message : undefined} /> : <>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-live="polite">
        {[[vi ? 'Lần thực gọi Azure' : 'Azure calls dispatched', number(data?.summary.provider_calls, 0)], [vi ? 'Audio đã gửi (giây)' : 'Audio submitted (seconds)', number(data?.summary.audio_seconds_submitted)], [vi ? 'Lượt dùng cache' : 'Cache hits', number(data?.summary.cache_hits, 0)], [vi ? 'Chi phí đã biết (ước tính)' : 'Known estimated cost', data ? `$${data.summary.cost_usd_estimate.toFixed(6)}` : '—']].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>)}
      </div>
      {data && (data.summary.unknown_audio_calls > 0 || data.summary.unknown_cost_calls > 0) && <p className="mb-3 text-sm text-amber-700">{vi ? `Chưa rõ thời lượng ở ${data.summary.unknown_audio_calls} lần gọi; chưa có chi phí ước tính ở ${data.summary.unknown_cost_calls} lần gọi. Tổng bên trên chỉ cộng dữ liệu đã biết.` : `${data.summary.unknown_audio_calls} calls have unknown audio duration; ${data.summary.unknown_cost_calls} have unknown estimated cost. Totals include known data only.`}</p>}
      <Table<AzureSpeechLog> rowKey="_id" columns={columns} dataSource={data?.items || []} loading={isFetching} scroll={{ x: 1480 }} locale={{ emptyText: vi ? 'Chưa có nhật ký Azure trong bộ lọc đã chọn.' : 'No Azure usage logs match these filters.' }}
        pagination={{ current: page, pageSize, total: data?.total || 0, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100], showTotal: total => `${number(total, 0)} ${vi ? 'nhật ký' : 'records'}`, onChange: (next, size) => { setPage(size === pageSize ? next : 1); setPageSize(size) } }}
        expandable={{ expandedRowRender: row => <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">{[
          [vi ? 'Mã thực thi' : 'Execution ID', row._id], [vi ? 'Mã kết quả bài' : 'Attempt ID', row.attempt_id], [vi ? 'Log quota người học' : 'Learner quota log', row.learner_quota_log_id],
          [vi ? 'Mã kết quả Azure' : 'Azure result ID', row.provider_result_id], [vi ? 'Gửi lúc (UTC+7)' : 'Dispatched (UTC+7)', timestamp(row.dispatched_at)], [vi ? 'Kết thúc (UTC+7)' : 'Completed (UTC+7)', timestamp(row.completed_at)],
          [vi ? 'Audio gốc (giây)' : 'Source audio seconds', number(row.audio_duration_seconds)], [vi ? 'Đơn giá ước tính USD/giờ' : 'Estimated USD/hour', number(row.estimated_rate_usd_per_hour, 6)],
          [vi ? 'Xử lý (ms)' : 'Processing (ms)', number(row.processing_time_ms, 0)], ['Prosody', row.prosody_enabled ? (vi ? 'Bật' : 'Enabled') : (vi ? 'Tắt' : 'Disabled')], [vi ? 'Phiên bản chấm' : 'Assessment version', row.assessment_version],
        ].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-all">{value || '—'}</dd></div>)}</dl> }} />
    </>}
    <p className="mt-4 text-xs leading-5 text-slate-500">{vi ? 'Audio đã gửi là lượng sử dụng ghi nhận từ LingoSphere, không phải xác nhận số giây Azure đã tính tiền hoặc hạn mức Azure còn lại. Retry có gửi audio là lần gọi riêng; cache không gửi audio. Nhật ký này không trừ thêm quota người học. Chi phí chỉ là ước tính, cần đối chiếu hóa đơn Azure. Tổng theo bộ lọc; CSV xuất trang đang xem.' : 'Submitted audio records LingoSphere usage, not Azure-invoiced seconds or remaining Azure quota. Retries that send audio are separate calls; cache hits send no audio. This log does not deduct learner quota. Costs are estimates to reconcile with Azure invoices. Totals follow filters; CSV exports the current page.'}{data && ` ${vi ? 'Dữ liệu lúc' : 'Data generated'} ${timestamp(data.generated_at)} (UTC+7).`}</p>
  </section>
}
