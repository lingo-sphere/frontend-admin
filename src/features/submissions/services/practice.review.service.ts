import { api } from "@/services/api.client";

export type PracticeSkill = "SPEAKING" | "WRITING";
export interface PracticeReview {
  status: "REQUESTED" | "RESOLVED";
  reason?: string;
  requested_at?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  feedback?: string;
  decision?: "KEEP" | "ADJUST";
}
export interface PracticeSubmission {
  id: string;
  skill: PracticeSkill;
  user_id: string;
  title?: string;
  exercise_type?: string;
  overall_score: number | null;
  ai_score: number | null;
  raw_score?: number | null;
  original_ai_raw_score?: number | null;
  max_score?: number;
  grading_standard?: string;
  grading_version?: string;
  revision: number;
  review: PracticeReview | null;
  submitted_at?: string;
  record_type?: "RESULT" | "GRADING_REQUEST";
  error?: string;
  status?: string;
  content?: string;
  transcription?: string;
  audio_url?: string;
  task_snapshot?: Record<string, unknown>;
  ai_evaluation?: Record<string, unknown>;
  dialogue_turns_results?: Array<{
    turn_number: number;
    audio_url?: string;
    audio_data?: string;
    recording_media_id?: string;
    user_transcription?: string;
  }>;
  review_history?: Array<
    PracticeReview & { previous_score: number; score: number; revision: number }
  >;
}
export interface PracticeSubmissionList {
  items: PracticeSubmission[];
  total: number;
  pending: number;
  page: number;
  limit: number;
}
export const practiceReviewService = {
  list: (skill: PracticeSkill, params: Record<string, unknown>) =>
    api.get<PracticeSubmissionList>(
      `/practice/admin/submissions/${skill}`,
      params,
    ),
  detail: (skill: PracticeSkill, id: string) =>
    api.get<PracticeSubmission>(`/practice/admin/submissions/${skill}/${id}`),
  decide: (
    skill: PracticeSkill,
    id: string,
    data: {
      expected_revision: number;
      decision: "KEEP" | "ADJUST";
      score?: number;
      feedback: string;
    },
  ) => api.post(`/practice/admin/submissions/${skill}/${id}/review`, data),
  retry: (skill: PracticeSkill, id: string) =>
    api.post(`/practice/admin/submission-requests/${skill}/${id}/retry`),
};
