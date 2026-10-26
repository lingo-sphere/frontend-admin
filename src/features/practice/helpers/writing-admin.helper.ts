import { rubricFields, type WritingPayload, type WritingRecord, type WritingType } from '../types/writing-admin.types'
export function writingPayload(type: WritingType, row: Partial<WritingRecord> = {}): WritingPayload {
  return {
  grading_standard: row.grading_standard || 'PRACTICAL', task_requirements: row.task_requirements || [], image_description: row.image_description || '',
  title: row.title ?? '',
  title_vi: row.title_vi ?? '',
  description: row.description ?? '',
  description_vi: row.description_vi ?? '',
  context_id: row.context_id ?? '',
  grammar_knowledge_id: row.grammar_knowledge_id ?? '',
  instruction_en: row.instruction_en ?? '',
  instruction_vi: row.instruction_vi ?? '',
  prompt_text: row.prompt_text ?? '',
  prompt_text_vi: row.prompt_text_vi ?? '',
  prompt_image_id: row.prompt_image_id ?? '',
  source_text: row.source_text ?? '',
  source_text_vi: row.source_text_vi ?? '',
  word_pool_instruction: row.word_pool_instruction ?? '',
  reference_answer: row.reference_answer ?? '',
  word_pool: row.word_pool ?? [],
  alternative_answers: row.alternative_answers ?? [],
  keywords: row.keywords ?? [],
  target_grammar_structures: row.target_grammar_structures ?? [],
    exercise_type: type, status: row.status || 'DRAFT', cefr_level: row.cefr_level || 'B1', difficulty_level: row.difficulty_level || 'MEDIUM', min_words: row.min_words ?? 0, max_words: row.max_words ?? 0,
    rubric: Object.fromEntries(rubricFields.map(field => [field, row.rubric?.[field] ?? 0])) as WritingPayload['rubric'], ...(row._id ? { expected_revision: row.revision ?? 0 } : {}),
  }
}
