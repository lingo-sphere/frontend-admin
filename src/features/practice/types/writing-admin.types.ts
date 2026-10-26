export const writingTypes = ['DESCRIBE_PICTURE', 'WRITE_EMAIL', 'EXPRESS_OPINION', 'SENTENCE_COMPLETION'] as const
export type WritingType = typeof writingTypes[number]
export const writingLabels: Record<WritingType, string> = { DESCRIBE_PICTURE: 'Mô tả tranh', WRITE_EMAIL: 'Viết email', EXPRESS_OPINION: 'Trình bày ý kiến', SENTENCE_COMPLETION: 'Hoàn thành câu' }
export const rubricFields = ['task_achievement', 'vocabulary', 'grammar', 'coherence_cohesion', 'naturalness', 'register'] as const
export interface WritingPayload {
  grading_standard: 'PRACTICAL' | 'TOEIC'; task_requirements: string[]; image_description: string
  title: string; title_vi: string; description: string; description_vi: string; context_id: string; grammar_knowledge_id: string; instruction_en: string; instruction_vi: string; prompt_text: string; prompt_text_vi: string; prompt_image_id: string; source_text: string; source_text_vi: string; word_pool_instruction: string; reference_answer: string
  word_pool: string[]; alternative_answers: string[]; keywords: string[]; target_grammar_structures: string[]
  exercise_type: WritingType; status: string; cefr_level: string; difficulty_level: string; min_words: number; max_words: number; rubric: Record<typeof rubricFields[number], number>; expected_revision?: number
}
export interface WritingRecord extends WritingPayload { _id: string; revision: number; created_at?: string; updated_at?: string }
export interface WritingGrammarOption { _id: string; code: string; name_en: string; name_vi?: string }
