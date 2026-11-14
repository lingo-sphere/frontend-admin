export interface TeacherRubric {
  version: string; standard: string; max_score: number; aggregation: string; description: string; bands: string[]
  criteria: Array<{ key: string; label: string; applicable: boolean; weight: number; guidance: string }>
}
export interface TeacherGrading { criteria_scores: Record<string, number | null>; raw_score?: number }
export interface TeacherDraft { scores: Record<string, string>; raw: string }
export const emptyTeacherDraft = (): TeacherDraft => ({ scores: {}, raw: '' })
export function teacherDraftResult(rubric: TeacherRubric | null | undefined, draft: TeacherDraft) {
  if (!rubric) return null
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
