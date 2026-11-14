import { type TeacherRubric, type TeacherDraft, type ScorePolicy } from '../helpers/teacher.grading'
export function TeacherRubricEditor({ rubric, value, onChange, calculated, pending, error }: { rubric: TeacherRubric; value: TeacherDraft; onChange: (value: TeacherDraft) => void; calculated?: { raw: number; overall: number; score_policy?: ScorePolicy } | null; pending?: boolean; error?: string | null }) {
  const speaking = rubric.task_policy?.version === 'speaking-task-gate-v1'
  return <fieldset className="space-y-3 rounded-xl border border-indigo-200 p-4 dark:border-indigo-900">
    <legend className="px-1 text-sm font-semibold">Phiếu chấm của giáo viên</legend>
    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{rubric.description}</p>
    <p className="break-all text-xs text-slate-500">Rubric đã lưu: {rubric.version}</p>
    {rubric.task_policy && <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <label className="block text-sm">Mức đáp ứng đề
        <select className="mt-1 min-h-11 w-full rounded border bg-white p-2 dark:bg-slate-900" value={value.outcome} onChange={event => {
          const outcome = event.target.value as TeacherDraft['outcome']
          const missing = outcome === 'OFF_TOPIC' || outcome === 'UNGRADABLE'
          onChange({ ...value, outcome, ...(missing ? { scores: { ...value.scores, task_achievement: '0' }, requirements: Object.fromEntries(rubric.task_policy!.requirements.map(r => [r.id, { status: 'MISSING', evidence: '' }])) } : {}) })
        }}><option value="">Chọn kết luận</option><option value="ON_TASK">Đáp ứng đầy đủ nhiệm vụ</option><option value="PARTIAL">Đáp ứng một phần</option><option value="OFF_TOPIC">Hoàn toàn lệch đề — điểm bài 0</option><option value="UNGRADABLE">Không có nội dung có thể chấm</option></select>
      </label>
      <label className="block text-sm">Căn cứ kết luận (ít nhất 10 ký tự)
        <textarea maxLength={3000} value={value.reason} onChange={event => onChange({ ...value, reason: event.target.value })} className="mt-1 min-h-20 w-full rounded border bg-transparent p-2" />
      </label>
      {rubric.task_policy.requirements.map(r => { const item = value.requirements[r.id] || { status: '', evidence: '' }; return <div key={r.id} className="space-y-2 border-t pt-3">
        <p className="text-sm font-medium">{r.id === 'R0' ? 'Nhiệm vụ chính' : r.id}: {r.text}</p>
        <label className="block text-sm">Mức thực hiện
          <select value={item.status} onChange={event => onChange({ ...value, requirements: { ...value.requirements, [r.id]: { ...item, status: event.target.value } } })} className="mt-1 min-h-11 w-full rounded border bg-white p-2 dark:bg-slate-900"><option value="">Chọn mức</option><option value="MET">Đã đáp ứng</option><option value="PARTIAL">Chưa đầy đủ</option><option value="MISSING">Chưa thực hiện</option></select>
        </label>
        <label className="block text-sm">{speaking ? 'Ghi lời thực sự nghe được từ audio gốc' : 'Trích nguyên văn từ bài làm'} {item.status === 'MISSING' ? '(có thể để trống)' : '(bắt buộc)'}
          <textarea maxLength={1200} value={item.evidence} onChange={event => onChange({ ...value, requirements: { ...value.requirements, [r.id]: { ...item, evidence: event.target.value } } })} className="mt-1 min-h-16 w-full rounded border bg-transparent p-2" />
        </label>
      </div> })}
      <p className="text-sm text-slate-600 dark:text-slate-300">{speaking ? 'Nghe audio gốc để xác nhận từng mục tiêu; trích dẫn của giáo viên là minh chứng nghe thủ công. Bài không thực hiện nhiệm vụ nhận 0; bài tự do đạt một phần tối đa 79 theo band nội bộ. Hội thoại được giới hạn theo mức hoàn thành từng lượt (đầy đủ, một phần hoặc chưa thực hiện); bài đọc/nhại được giới hạn theo mức hoàn thành văn bản ở tiêu chí đáp ứng đề.' : 'Bài hoàn toàn lệch đề nhận 0 điểm bài làm; điểm ngôn ngữ vẫn được giữ để hướng dẫn học. Đáp ứng đầy đủ: tiêu chí đáp ứng đề từ 80; đáp ứng một phần: lớn hơn 0 và dưới 80.'}</p>
    </div>}
    <div className="grid gap-4 xl:grid-cols-2">{rubric.criteria.map(c => <label key={c.key} className="block text-sm">
      <span className="mb-1 flex justify-between gap-2"><span>{c.label}</span><span className="text-slate-500">{!c.applicable ? 'Không áp dụng' : rubric.aggregation === 'WEIGHTED' ? `${Number(c.weight.toFixed(2))}%` : 'Chẩn đoán /100'}</span></span>
      {c.applicable && <><input aria-label={`Điểm giáo viên: ${c.label}`} type="number" min={0} max={100} step={1} value={value.scores[c.key] || ''}
        onChange={event => onChange({ ...value, scores: { ...value.scores, [c.key]: event.target.value } })}
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" />
        <span className="mt-1 block text-xs leading-5 text-slate-500">{c.guidance}</span></>}
    </label>)}</div>
    {rubric.aggregation === 'HOLISTIC' && <><div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs leading-5 dark:bg-slate-800">{rubric.bands.map(band => <p key={band}>{band}</p>)}</div>
      <label className="block text-sm">Điểm tác vụ của giáo viên (0–{rubric.max_score})<input aria-label="Điểm tác vụ của giáo viên" type="number" min={0} max={rubric.max_score} step={1} value={value.raw} onChange={event => onChange({ ...value, raw: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" /></label></>}
    <p aria-live="polite" className="text-sm font-semibold">{pending ? 'Đang kiểm tra điểm trên máy chủ…' : calculated ? `Điểm giáo viên: ${calculated.raw}/${rubric.max_score}${rubric.standard === 'TOEIC' ? ` · Tỷ lệ nội bộ ${calculated.overall}/100` : ''}` : 'Nhập đủ phiếu chấm để tính điểm.'}</p>
    {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    {calculated?.score_policy?.applied_cap === 0 && <p className="text-sm">Điểm trước điều kiện: {calculated.score_policy.pre_policy_score}; điểm cuối: 0 do không thực hiện nhiệm vụ.</p>}
    {calculated?.score_policy?.applied_cap != null && calculated.score_policy.applied_cap > 0 && <p className="text-sm">Điểm trước điều kiện: {calculated.score_policy.pre_policy_score}; trần theo mức thực hiện nhiệm vụ: {calculated.score_policy.applied_cap}; điểm cuối: {calculated.raw}.</p>}
    <p className="text-xs leading-5 text-slate-500">Điểm tổng được kiểm tra và tính lại trên máy chủ. Nhận xét phải giải thích căn cứ chấm từ bài làm gốc.</p>
  </fieldset>
}
