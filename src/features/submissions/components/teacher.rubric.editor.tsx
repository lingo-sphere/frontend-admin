import { teacherDraftResult, type TeacherRubric, type TeacherDraft } from '../helpers/teacher.grading'
export function TeacherRubricEditor({ rubric, value, onChange }: { rubric: TeacherRubric; value: TeacherDraft; onChange: (value: TeacherDraft) => void }) {
  const calculated = teacherDraftResult(rubric, value)
  return <fieldset className="space-y-3 rounded-xl border border-indigo-200 p-4 dark:border-indigo-900">
    <legend className="px-1 text-sm font-semibold">Phiếu chấm của giáo viên</legend>
    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{rubric.description}</p>
    <p className="break-all text-xs text-slate-500">Rubric đã lưu: {rubric.version}</p>
    <div className="grid gap-4 xl:grid-cols-2">{rubric.criteria.map(c => <label key={c.key} className="block text-sm">
      <span className="mb-1 flex justify-between gap-2"><span>{c.label}</span><span className="text-slate-500">{!c.applicable ? 'Không áp dụng' : rubric.aggregation === 'WEIGHTED' ? `${Number(c.weight.toFixed(2))}%` : 'Chẩn đoán /100'}</span></span>
      {c.applicable && <><input aria-label={`Điểm giáo viên: ${c.label}`} type="number" min={0} max={100} step={1} value={value.scores[c.key] || ''}
        onChange={event => onChange({ ...value, scores: { ...value.scores, [c.key]: event.target.value } })}
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" />
        <span className="mt-1 block text-xs leading-5 text-slate-500">{c.guidance}</span></>}
    </label>)}</div>
    {rubric.aggregation === 'HOLISTIC' && <><div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs leading-5 dark:bg-slate-800">{rubric.bands.map(band => <p key={band}>{band}</p>)}</div>
      <label className="block text-sm">Điểm tác vụ của giáo viên (0–{rubric.max_score})<input aria-label="Điểm tác vụ của giáo viên" type="number" min={0} max={rubric.max_score} step={1} value={value.raw} onChange={event => onChange({ ...value, raw: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" /></label></>}
    <p aria-live="polite" className="text-sm font-semibold">{calculated ? `Điểm giáo viên: ${calculated.raw}/${rubric.max_score}${rubric.standard === 'TOEIC' ? ` · Tỷ lệ nội bộ ${calculated.overall}/100` : ''}` : 'Nhập đủ các tiêu chí áp dụng để tính điểm.'}</p>
    <p className="text-xs leading-5 text-slate-500">Điểm tổng được kiểm tra và tính lại trên máy chủ. Nhận xét phải giải thích căn cứ chấm từ bài làm gốc.</p>
  </fieldset>
}
