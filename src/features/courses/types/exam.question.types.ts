// Định nghĩa kiểu dữ liệu cho câu hỏi bài thi và tham số trình biên soạn câu hỏi.

import type { ToeicExamItem } from '@/features/exams/services/exam.service'

export interface ExamQuestionItem {
  id?: string
  _id?: string
  skill_type?: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'
  part_number?: number | string
  part_name?: string
  question_type?: 'MULTIPLE_CHOICE' | 'SPEAKING' | 'WRITING'
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string | null
  media_url?: string | null
  audio_url?: string | null
  image_url?: string | null
  prep_time_seconds?: number | null
  response_time_seconds?: number | null
  min_words?: number | null
  [key: string]: unknown
}

export interface RawExamQuestion {
  id?: string | null
  _id?: string | null
  skill_type?: string | null
  skillType?: string | null
  part_number?: number | string | null
  part?: number | string | null
  part_name?: string | null
  question_type?: string | null
  question_text?: string | null
  questionTextEn?: string | null
  question_text_en?: string | null
  options?: Array<string | { textEn?: string; text?: string }> | null
  correct_answer?: string | null
  correctOption?: string | null
  correct_option?: string | null
  explanation?: string | null
  explanation_vi?: string | null
  explanation_en?: string | null
  media_url?: string | null
  audio_url?: string | null
  image_url?: string | null
  image_media_id?: string | null
  imageMediaId?: string | null
  imageUrl?: string | null
  prep_time_seconds?: number | null
  response_time_seconds?: number | null
  min_words?: number | null
}

export interface UseExamQuestionEditorParams {
  isOpen: boolean
  exam?: ToeicExamItem | null
  is4Skills?: boolean
  isLessonMode?: boolean
  initialQuestions?: ExamQuestionItem[]
  initialGlobalAudioUrl?: string
  isVi: boolean
  onExamUpdated?: (updatedExam: ToeicExamItem) => void
  onExamMetaLoaded?: (meta: {
    title?: string
    duration_minutes?: number
    passing_score?: number
    description?: string
  }) => void
  onSkillsAutoSwitched?: (skills: '2SKILLS' | '4SKILLS') => void
  onSave?: (
    questions: ExamQuestionItem[],
    globalAudioUrl: string,
    meta?: {
      title?: string
      duration_minutes?: number
      passing_score?: number
      description?: string
    }
  ) => Promise<void> | void
  onClose: () => void
}
