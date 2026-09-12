// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ exam trong Admin.

import { z } from 'zod'
import { QuizQuestionItemSchema } from '@/features/courses/schemas/course.schema'

export const ToeicExamItemSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string(),
  course_id: z.string().nullable().optional(),
  course_title: z.string().nullable().optional(),
  module_id: z.string().nullable().optional(),
  module_title: z.string().nullable().optional(),
  author_id: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
  total_questions: z.number().nullable().optional(),
  passing_score: z.number().nullable().optional(),
  total_attempts: z.number().nullable().optional(),
  avg_score: z.number().nullable().optional(),
  is_published: z.boolean().nullable().optional(),
  is_system_placement: z.boolean().nullable().optional(),
  skills_enabled: z.string().nullable().optional(),
  placement_type: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  created_at: z.union([z.string(), z.date()]).nullable().optional(),
  questions: z.array(QuizQuestionItemSchema).optional(),
  audio_url: z.string().nullable().optional(),
}).passthrough()

export const ToeicExamListSchema = z.array(ToeicExamItemSchema)

export const ToeicExamsResponseSchema = z.union([
  ToeicExamListSchema,
  z.object({ items: ToeicExamListSchema }).passthrough(),
])

export const CreateExamDtoSchema = z.object({
  title: z.string(),
  course_id: z.string().nullable().optional(),
  course_title: z.string().nullable().optional(),
  module_id: z.string().nullable().optional(),
  module_title: z.string().nullable().optional(),
  author_id: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  duration_minutes: z.number().nullable().optional(),
  total_questions: z.number().nullable().optional(),
  passing_score: z.number().nullable().optional(),
  is_published: z.boolean().nullable().optional(),
  is_system_placement: z.boolean().nullable().optional(),
  skills_enabled: z.string().nullable().optional(),
  placement_type: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  questions: z.array(QuizQuestionItemSchema).optional(),
}).passthrough()

export type ToeicExamItem = z.infer<typeof ToeicExamItemSchema>
export type CreateExamDto = z.infer<typeof CreateExamDtoSchema>

