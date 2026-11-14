export type AzureSpeechLog = {
  _id: string; user_id: string; request_id: string; attempt_id?: string; learner_quota_log_id?: string;
  exercise_id: string; exercise_title?: string; exercise_type: string; turn_number: number; call_index: number;
  region: string; locale: string; mode: string; prosody_enabled: boolean; assessment_version?: string; status: string;
  provider_dispatched: boolean; audio_duration_seconds: number | null; audio_seconds_submitted: number | null;
  estimated_rate_usd_per_hour: number | null; cost_usd_estimate: number | null; provider_result_id?: string;
  error_code?: string; created_at: string; dispatched_at?: string; completed_at?: string; processing_time_ms: number | null;
}
export type AzureSpeechLogsResponse = {
  items: AzureSpeechLog[]; total: number; generated_at: string; timezone: string; integration_status: string;
  azure_enabled: boolean; credentials_configured: boolean;
  summary: { total: number; provider_calls: number; cache_hits: number; failed: number; audio_seconds_submitted: number; cost_usd_estimate: number; unknown_audio_calls: number; unknown_cost_calls: number }
}
export const azureLogTime = (value?: string, locale = 'vi-VN') => value ? new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(value)) : '—'

export function azureLogsCsv(data: AzureSpeechLogsResponse, filters: { dates: [string, string]; q: string; mode: string; status: string }, page: number, exportedAt: string) {
  const rows: unknown[][] = [['Execution ID', 'User ID', 'Grading request ID', 'Attempt ID', 'Learner quota log ID', 'Exercise ID', 'Exercise title', 'Exercise type', 'Turn number (0=single)', 'Provider call index', 'Mode', 'Region', 'Locale', 'Prosody enabled', 'Provider dispatched', 'Audio duration seconds', 'Audio seconds submitted (not invoiced usage)', 'Estimated USD per hour', 'Estimated cost USD (not invoice)', 'Status', 'Provider result ID', 'Error code', 'Created ISO UTC', 'Created UTC+7', 'Dispatched UTC+7', 'Completed UTC+7', 'Processing ms', 'Assessment version', 'Filter from UTC+7 date', 'Filter to UTC+7 date', 'Search', 'Mode filter', 'Status filter', 'Export page', 'Data generated ISO', 'Exported ISO']]
  for (const row of data.items) rows.push([row._id, row.user_id, row.request_id, row.attempt_id, row.learner_quota_log_id, row.exercise_id, row.exercise_title, row.exercise_type, row.turn_number, row.call_index, row.mode, row.region, row.locale, row.prosody_enabled, row.provider_dispatched, row.audio_duration_seconds, row.audio_seconds_submitted, row.estimated_rate_usd_per_hour, row.cost_usd_estimate, row.status, row.provider_result_id, row.error_code, row.created_at, azureLogTime(row.created_at), azureLogTime(row.dispatched_at), azureLogTime(row.completed_at), row.processing_time_ms, row.assessment_version, ...filters.dates, filters.q, filters.mode, filters.status, page, data.generated_at, exportedAt])
  const cell = (value: unknown) => {
    let raw = value == null ? '' : String(value)
    if (/^\s*[=+@-]|^[\t\r]/.test(raw)) raw = `'${raw}`
    return `"${raw.replaceAll('"', '""')}"`
  }
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')
}
