import type { TaskAssessment, ScorePolicy } from '../helpers/teacher.grading'

export function WritingTaskAssessmentSummary({ evaluation, title }: { evaluation?: Record<string, unknown> | null; title: string }) {
  const assessment = evaluation?.task_assessment as TaskAssessment | undefined
  const policy = evaluation?.score_policy as ScorePolicy | undefined
  if (!assessment) return null
  const labels = { ON_TASK: 'Đáp ứng đầy đủ', PARTIAL: 'Đáp ứng một phần', OFF_TOPIC: 'Hoàn toàn lệch đề', UNGRADABLE: 'Không có nội dung có thể chấm', UNCERTAIN: 'Cần kiểm tra' }
  return <section className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
    <p className="font-semibold">{title}: {labels[assessment.outcome]}</p><p>{assessment.reason}</p>
    {policy && <p>Điểm trước điều kiện: {policy.pre_policy_score} · Điểm cuối: {policy.final_score}{policy.applied_cap === 0 ? ' · Không thực hiện nhiệm vụ nên điểm ngôn ngữ không bù vào điểm bài làm.' : ''}</p>}
    <ul className="space-y-1">{assessment.requirements.map((r, i) => <li key={r.requirement_id}>{i === 0 ? 'Nhiệm vụ chính' : `Yêu cầu ${i}`}: {{ MET: 'Đã đáp ứng', PARTIAL: 'Chưa đầy đủ', MISSING: 'Chưa thực hiện', UNKNOWN: 'Chưa xác định' }[r.status]}{r.evidence.map((q, j) => <blockquote key={j} className="border-l-2 pl-2">{q}</blockquote>)}</li>)}</ul>
  </section>
}
