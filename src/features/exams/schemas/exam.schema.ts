/**
 * @file exam.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ exam
 */

import { z } from 'zod'
import { QuizQuestionItemSchema } from '@/features/courses/schemas/course.schema'

export const ToeicExamItemSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string(),
  course_id: z.string().optional(),
  course_title: z.string().optional(),
  module_id: z.string().optional(),
  module_title: z.string().optional(),
  author_id: z.string().optional(),
  type: z.string().optional(),
  duration_minutes: z.number().optional(),
  total_questions: z.number().optional(),
  passing_score: z.number().optional(),
  total_attempts: z.number().optional(),
  avg_score: z.number().optional(),
  is_published: z.boolean().optional(),
  is_system_placement: z.boolean().optional(),
  skills_enabled: z.string().optional(),
  placement_type: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  questions: z.array(QuizQuestionItemSchema).optional(),
  audio_url: z.string().optional(),
}).passthrough()

export const ToeicExamListSchema = z.array(ToeicExamItemSchema)

export const ToeicExamsResponseSchema = z.union([
  ToeicExamListSchema,
  z.object({ items: ToeicExamListSchema }).passthrough(),
])

export const CreateExamDtoSchema = z.object({
  title: z.string(),
  course_id: z.string().optional(),
  course_title: z.string().optional(),
  module_id: z.string().optional(),
  module_title: z.string().optional(),
  author_id: z.string().optional(),
  type: z.string().optional(),
  duration_minutes: z.number().optional(),
  total_questions: z.number().optional(),
  passing_score: z.number().optional(),
  is_published: z.boolean().optional(),
  is_system_placement: z.boolean().optional(),
  skills_enabled: z.string().optional(),
  placement_type: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  audio_url: z.string().optional(),
  questions: z.array(QuizQuestionItemSchema).optional(),
}).passthrough()

export type ToeicExamItem = z.infer<typeof ToeicExamItemSchema>
export type CreateExamDto = z.infer<typeof CreateExamDtoSchema>

