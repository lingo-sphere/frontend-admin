import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '@/services/api.client'
import { teacherDraftInput, teacherDraftResult, type TeacherDraft, type TeacherRubric, type ScorePolicy, type TaskAssessment } from '../helpers/teacher.grading'

export function useTeacherGrade(rubric: TeacherRubric | null | undefined, draft: TeacherDraft, task: Record<string, unknown>, content: string) {
  const input = teacherDraftInput(rubric, draft)
  const payload = { skill: rubric?.task_policy?.version === 'speaking-task-gate-v1' ? 'SPEAKING' : 'WRITING', task: { ...task, student_submission: content }, teacher_grading: input }
  const serialized = JSON.stringify(payload)
  const [settled, setSettled] = useState(serialized)
  useEffect(() => { const timer = setTimeout(() => setSettled(serialized), 300); return () => clearTimeout(timer) }, [serialized])
  const current = settled === serialized
  const query = useQuery({
    queryKey: ['teacher-grade-preview', settled],
    enabled: Boolean(rubric?.task_policy && input && current),
    queryFn: () => api.post<{ raw_score: number; overall_score: number; score_policy?: ScorePolicy; task_assessment?: TaskAssessment }>('/practice/admin/grading-preview', JSON.parse(settled)),
    retry: false, staleTime: 30000,
  })
  if (!rubric?.task_policy) return { grade: teacherDraftResult(rubric, draft), pending: false, error: null }
  return { grade: input && current && !query.error && query.data ? { input, raw: query.data.raw_score, overall: query.data.overall_score, score_policy: query.data.score_policy } : null,
    pending: Boolean(input && (!current || query.isFetching)), error: input && current && query.error ? query.error.message : null }
}
