// Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ course và roadmap trong Admin.

import { z } from 'zod'
import { PaginationMetaSchema } from '@/features/users/schemas/user.schema'

export const QuizQuestionItemSchema = z.object({
  id: z.string().optional(),
  question_text: z.string(),
  options: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string().nullable().optional(),
  media_url: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  image_media_id: z.string().nullable().optional(),
  audio_media_id: z.string().nullable().optional(),
  skill_type: z.string().nullable().optional(),
  question_type: z.string().nullable().optional(),
  score_weight: z.number().nullable().optional(),
  part_number: z.union([z.number(), z.string()]).nullable().optional(),
  part_name: z.string().nullable().optional(),
  order_index: z.number().nullable().optional(),
  prep_time_seconds: z.number().nullable().optional(),
  response_time_seconds: z.number().nullable().optional(),
  min_words: z.number().nullable().optional(),
})

export const LessonSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  module_id: z.string().default(''),
  title: z.string(),
  order_index: z.number().default(1),
  duration_seconds: z.number().default(0),
  video_url: z.string().nullable().optional(),
  content_html: z.string().nullable().optional(),
  is_free_preview: z.boolean().optional(),
  status: z.string().optional(),
  questions: z.array(QuizQuestionItemSchema).optional(),
  lesson_order: z.number().optional(),
  duration_minutes: z.number().nullable().optional(),
  content: z.string().nullable().optional(),
  is_preview: z.boolean().optional(),
})

export const CourseModuleSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  course_id: z.string().default(''),
  title: z.string(),
  order_index: z.number().default(1),
  module_order: z.number().optional(),
  description: z.string().nullable().optional(),
  is_free_preview: z.boolean().optional(),
  passing_score: z.number().nullable().optional(),
  challenge_test_exam_id: z.string().nullable().optional(),
  challenge_passing_score: z.number().nullable().optional(),
  challenge_duration_minutes: z.number().nullable().optional(),
  challenge_questions: z.array(QuizQuestionItemSchema).optional(),
  post_mini_test_exam_id: z.string().nullable().optional(),
  post_mini_passing_score: z.number().nullable().optional(),
  post_mini_duration_minutes: z.number().nullable().optional(),
  post_mini_questions: z.array(QuizQuestionItemSchema).optional(),
  test_audio_url: z.string().nullable().optional(),
  challenge_audio_url: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
  lessons: z.array(LessonSchema).optional(),
  test_questions: z.array(QuizQuestionItemSchema).optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export const CourseBaseSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  title: z.string().default(''),
  slug: z.string().optional(),
  description: z.string().default(''),
  category: z.string().default('TOEIC'),
  level: z.string().default('BEGINNER'),
  target_score: z.number().nullable().optional(),
  price: z.number().default(0),
  discount_price: z.number().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  author_id: z.string().nullable().optional(),
  author_name: z.string().nullable().optional(),
  author_email: z.string().nullable().optional(),
  author_avatar: z.string().nullable().optional(),
  author_title: z.string().nullable().optional(),
  author_bio: z.string().nullable().optional(),
  approval_status: z.string().default('DRAFT'),
  is_published: z.boolean().default(false).optional(),
  pre_test_exam_id: z.string().nullable().optional(),
  final_test_exam_id: z.string().nullable().optional(),
  final_test_passing_score: z.number().nullable().optional(),
  final_test_duration_minutes: z.number().nullable().optional(),
  final_test_questions: z.array(QuizQuestionItemSchema).optional(),
  final_test_audio_url: z.string().nullable().optional(),
  final_test_speaking_prompt: z.string().nullable().optional(),
  final_test_speaking_file_url: z.string().nullable().optional(),
  final_test_writing_prompt: z.string().nullable().optional(),
  final_test_writing_file_url: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  students_count: z.number().nullable().optional(),
  total_modules: z.number().nullable().optional(),
  total_lessons: z.number().nullable().optional(),
  skills: z.array(z.string()).optional(),
  modules: z.array(CourseModuleSchema).optional(),
  curriculum: z.array(CourseModuleSchema).optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export const CourseDetailResponseSchema = z.object({
  course: CourseBaseSchema,
  curriculum: z.array(CourseModuleSchema).optional(),
  modules: z.array(CourseModuleSchema).optional(),
  total_modules: z.number().optional(),
  total_lessons: z.number().optional(),
}).transform((val) => ({
  ...val.course,
  course: val.course,
  curriculum: val.curriculum || val.course.modules || [],
  modules: val.curriculum || val.course.modules || [],
  total_modules: val.total_modules ?? val.course.total_modules ?? (val.curriculum || []).length,
  total_lessons: val.total_lessons ?? val.course.total_lessons,
}))

export const CourseSchema = z.union([
  CourseDetailResponseSchema,
  CourseBaseSchema,
])

export const CourseListSchema = z.array(CourseSchema)

export const PaginatedCoursesSchema = z.object({
  result: z.array(CourseSchema),
  meta: PaginationMetaSchema.optional(),
}).passthrough()

export const LearningRoadmapStageSchema = z.object({
  stage_order: z.number().default(1),
  stage_title: z.string().default(''),
  stage_description: z.string().nullable().optional(),
  course_id: z.string().default(''),
  target_band: z.string().nullable().optional(),
  checkpoint_exam_id: z.string().nullable().optional(),
  passing_score: z.number().nullable().optional(),
  is_optional: z.boolean().optional(),
  course: CourseBaseSchema.nullable().optional(),
})

export const LearningRoadmapSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  skills_focus: z.string().default('2SKILLS'),
  target_score: z.number().default(500),
  min_entry_score: z.number().default(0),
  max_entry_score: z.number().default(990),
  stages: z.array(LearningRoadmapStageSchema).default([]),
  bundle_price: z.number().nullable().optional(),
  original_price: z.number().nullable().optional(),
  version: z.number().nullable().optional(),
  is_published: z.boolean().default(false),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export const RoadmapListSchema = z.array(LearningRoadmapSchema)

export type QuizQuestionItem = z.infer<typeof QuizQuestionItemSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type CourseModule = z.infer<typeof CourseModuleSchema>
export type Course = z.infer<typeof CourseBaseSchema>
export type PaginatedCourses = z.infer<typeof PaginatedCoursesSchema>
export type LearningRoadmap = z.infer<typeof LearningRoadmapSchema>
