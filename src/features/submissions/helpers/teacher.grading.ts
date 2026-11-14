export interface TeacherRubric {
  task_policy?: { version: string; requirements: Array<{ id: string; text: string }>; partial_caps_enabled: boolean }
  version: string; standard: string; max_score: number; aggregation: string; description: string; bands: string[]
  criteria: Array<{ key: string; label: string; applicable: boolean; weight: number; guidance: string }>
}
export interface TaskAssessment { outcome: 'ON_TASK' | 'PARTIAL' | 'OFF_TOPIC' | 'UNGRADABLE' | 'UNCERTAIN'; reason: string; requirements: Array<{ requirement_id: string; status: 'MET' | 'PARTIAL' | 'MISSING' | 'UNKNOWN'; evidence: string[] }> }
export interface ScorePolicy { version: string; pre_policy_score: number; final_score: number; applied_cap: number | null; reason_code: string }
export interface TeacherGrading { criteria_scores: Record<string, number | null>; raw_score?: number; task_assessment?: TaskAssessment }
export interface TeacherDraft { scores: Record<string, string>; raw: string; outcome: TaskAssessment['outcome'] | ''; reason: string; requirements: Record<string, { status: string; evidence: string }> }
export const emptyTeacherDraft = (): TeacherDraft => ({ scores: {}, raw: '', outcome: '', reason: '', requirements: {} })
export function teacherDraftInput(rubric: TeacherRubric | null | undefined, draft: TeacherDraft): TeacherGrading | null {
  if (!rubric) return null
  const scores: Record<string, number | null> = {}
  for (const c of rubric.criteria) {
    const text = draft.scores[c.key]?.trim()
    if (c.applicable && (!text || !Number.isFinite(Number(text)) || Number(text) < 0 || Number(text) > 100)) return null
    scores[c.key] = c.applicable ? Number(text) : null
  }
  if (rubric.aggregation === 'HOLISTIC' && (!draft.raw.trim() || !Number.isInteger(Number(draft.raw)))) return null
  let assessment: TaskAssessment | undefined
  if (rubric.task_policy) {
    if (!draft.outcome || draft.outcome === 'UNCERTAIN' || draft.reason.trim().length < 10) return null
    const requirements: TaskAssessment['requirements'] = []
    for (const r of rubric.task_policy.requirements) {
      const item = draft.requirements[r.id]
      if (!item || !['MET', 'PARTIAL', 'MISSING'].includes(item.status) || (item.status !== 'MISSING' && !item.evidence.trim())) return null
      requirements.push({ requirement_id: r.id, status: item.status as 'MET' | 'PARTIAL' | 'MISSING', evidence: item.evidence.trim() ? [item.evidence.trim()] : [] })
    }
    assessment = { outcome: draft.outcome, reason: draft.reason.trim(), requirements }
  }
  return { criteria_scores: scores, ...(rubric.aggregation === 'HOLISTIC' ? { raw_score: Number(draft.raw) } : {}), ...(assessment ? { task_assessment: assessment } : {}) }
}
export function teacherDraftResult(rubric: TeacherRubric | null | undefined, draft: TeacherDraft) {
  if (!rubric || rubric.task_policy) return null // v4 preview is computed by the backend.
  const scores: Record<string, number | null> = {}
  for (const c of rubric.criteria) {
    const text = draft.scores[c.key]?.trim()
    if (c.applicable && (!text || !Number.isFinite(Number(text)) || Number(text) < 0 || Number(text) > 100)) return null
    scores[c.key] = c.applicable ? Number(text) : null
  }
  const raw = rubric.aggregation === 'HOLISTIC' ? (draft.raw.trim() === '' ? NaN : Number(draft.raw))
    : Math.round(rubric.criteria.reduce((sum, c) => sum + Number(scores[c.key] || 0) * c.weight, 0) / rubric.criteria.reduce((sum, c) => sum + c.weight, 0))
  if (!Number.isInteger(raw) || raw < 0 || raw > rubric.max_score) return null
  return { input: { criteria_scores: scores, ...(rubric.aggregation === 'HOLISTIC' ? { raw_score: raw } : {}) } as TeacherGrading,
    raw, overall: rubric.standard === 'TOEIC' ? Math.round(raw / rubric.max_score * 100) : raw }
}
