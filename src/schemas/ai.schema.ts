/**
 * @file ai.schema.ts
 * @description Zod Schemas định nghĩa cấu trúc dữ liệu cho dịch vụ ai
 */

import { z } from 'zod'

export const GenerateQuizItemSchema = z.object({
  question_text: z.string(),
  options: z.array(z.string()),
  correct_index: z.number().default(0),
  correct_answer: z.string().optional(),
  explanation_vi: z.string().optional(),
  explanation: z.string().optional(),
}).passthrough()

export const TeacherGenerateQuizResponseSchema = z.object({
  topic: z.string().optional(),
  passage_summary: z.string().optional(),
  target_cefr: z.string().optional(),
  model_used: z.string().optional(),
  questions: z.array(GenerateQuizItemSchema),
}).passthrough()

export const AiModelItemSchema = z.object({
  model_name: z.string(),
  provider: z.string(),
  is_active: z.boolean(),
}).passthrough()

export const AiModelListSchema = z.array(AiModelItemSchema)

export type GenerateQuizItem = z.infer<typeof GenerateQuizItemSchema>
export type TeacherGenerateQuizResponse = z.infer<typeof TeacherGenerateQuizResponseSchema>
export type AiModelItem = z.infer<typeof AiModelItemSchema>
