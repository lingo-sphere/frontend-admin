/**
 * @file course.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ course và roadmap
 */

import { z } from 'zod'
import { PaginationMetaSchema } from './user.schema'

export const QuizQuestionItemSchema = z.object({
  id: z.string().optional(),
  question_text: z.string(),
  options: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string().optional(),
  media_url: z.string().optional(),
  audio_url: z.string().optional(),
  image_url: z.string().optional(),
  image_media_id: z.string().optional(),
  audio_media_id: z.string().optional(),
  skill_type: z.string().optional(),
  question_type: z.string().optional(),
  score_weight: z.number().optional(),
  part_number: z.union([z.number(), z.string()]).optional(),
  part_name: z.string().optional(),
  order_index: z.number().optional(),
  prep_time_seconds: z.number().optional(),
  response_time_seconds: z.number().optional(),
  min_words: z.number().optional(),
})

export const LessonSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  module_id: z.string().default(''),
  title: z.string(),
  order_index: z.number().default(1),
  duration_seconds: z.number().default(0),
  video_url: z.string().optional(),
  content_html: z.string().optional(),
  is_free_preview: z.boolean().optional(),
  status: z.string().optional(),
  questions: z.array(QuizQuestionItemSchema).optional(),
  lesson_order: z.number().optional(),
  duration_minutes: z.number().optional(),
  content: z.string().optional(),
  is_preview: z.boolean().optional(),
})

export const CourseModuleSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  course_id: z.string().default(''),
  title: z.string(),
  order_index: z.number().default(1),
  module_order: z.number().optional(),
  description: z.string().optional(),
  is_free_preview: z.boolean().optional(),
  passing_score: z.number().optional(),
  challenge_test_exam_id: z.string().optional(),
  challenge_passing_score: z.number().optional(),
  challenge_duration_minutes: z.number().optional(),
  challenge_questions: z.array(QuizQuestionItemSchema).optional(),
  post_mini_test_exam_id: z.string().optional(),
  post_mini_passing_score: z.number().optional(),
  post_mini_duration_minutes: z.number().optional(),
  post_mini_questions: z.array(QuizQuestionItemSchema).optional(),
  test_audio_url: z.string().optional(),
  challenge_audio_url: z.string().optional(),
  audio_url: z.string().optional(),
  lessons: z.array(LessonSchema).optional(),
  test_questions: z.array(QuizQuestionItemSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const CourseBaseSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  title: z.string().default(''),
  slug: z.string().optional(),
  description: z.string().default(''),
  category: z.string().default('TOEIC'),
  level: z.string().default('BEGINNER'),
  target_score: z.number().optional(),
  price: z.number().default(0),
  discount_price: z.number().optional(),
  thumbnail_url: z.string().optional(),
  author_id: z.string().optional(),
  author_name: z.string().optional(),
  author_email: z.string().optional(),
  author_avatar: z.string().optional(),
  author_title: z.string().optional(),
  author_bio: z.string().optional(),
  approval_status: z.string().default('DRAFT'),
  is_published: z.boolean().default(false).optional(),
  pre_test_exam_id: z.string().optional(),
  final_test_exam_id: z.string().optional(),
  final_test_passing_score: z.number().optional(),
  final_test_questions: z.array(QuizQuestionItemSchema).optional(),
  final_test_audio_url: z.string().optional(),
  final_test_speaking_prompt: z.string().optional(),
  final_test_speaking_file_url: z.string().optional(),
  final_test_writing_prompt: z.string().optional(),
  final_test_writing_file_url: z.string().optional(),
  rating: z.number().optional(),
  students_count: z.number().optional(),
  total_modules: z.number().optional(),
  total_lessons: z.number().optional(),
  skills: z.array(z.string()).optional(),
  modules: z.array(CourseModuleSchema).optional(),
  curriculum: z.array(CourseModuleSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
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
})

export const LearningRoadmapStageSchema = z.object({
  stage_order: z.number().default(1),
  stage_title: z.string().default(''),
  stage_description: z.string().optional(),
  course_id: z.string().default(''),
  target_band: z.string().optional(),
  checkpoint_exam_id: z.string().optional(),
  passing_score: z.number().optional(),
  is_optional: z.boolean().optional(),
  course: CourseBaseSchema.nullable().optional(),
})

export const LearningRoadmapSchema = z.object({
  _id: z.string().default(''),
  id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  skills_focus: z.enum(['2SKILLS', '4SKILLS']).default('2SKILLS'),
  target_score: z.number().default(500),
  min_entry_score: z.number().default(0),
  max_entry_score: z.number().default(990),
  stages: z.array(LearningRoadmapStageSchema).default([]),
  bundle_price: z.number().optional(),
  original_price: z.number().optional(),
  version: z.number().optional(),
  is_published: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const RoadmapListSchema = z.array(LearningRoadmapSchema)

export type QuizQuestionItem = z.infer<typeof QuizQuestionItemSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type CourseModule = z.infer<typeof CourseModuleSchema>
export type Course = z.infer<typeof CourseBaseSchema>
export type PaginatedCourses = z.infer<typeof PaginatedCoursesSchema>
export type LearningRoadmap = z.infer<typeof LearningRoadmapSchema>
