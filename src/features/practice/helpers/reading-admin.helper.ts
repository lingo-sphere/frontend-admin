import type { ReadingPayload, ReadingQuestion, ReadingRecord, ReadingType } from '../types/reading-admin.types'
export function readingPayload(type: ReadingType, row: Partial<ReadingRecord> = {}): ReadingPayload {
  const metadata = row.passage_metadata
  return {
    title: row.title ?? '',
    title_vi: row.title_vi ?? '',
    content: row.content ?? '',
    content_summary: row.content_summary ?? '',
    source: row.source ?? '',
    source_url: row.source_url ?? '',
    author: row.author ?? '',
    context_id: row.context_id ?? '',
    media_id: row.media_id ?? '',
    published_date: row.published_date ? row.published_date.slice(0, 10) : '', reading_type: type, status: row.status || 'DRAFT', cefr_level: row.cefr_level || 'B1', difficulty_level: row.difficulty_level || 'MEDIUM', tags: row.tags || [], media_type: row.media_id ? row.media_type || 'IMAGE' : '',
    passage_metadata: {
      scenario_title: metadata?.scenario_title || '', scenario_description: metadata?.scenario_description || '',
      requirements: (metadata?.requirements || []).map(item => ({ id: item.id || crypto.randomUUID(), label: item.label || '', ...(item.fulfilled !== undefined ? { fulfilled: item.fulfilled } : {}) })),
      info_paragraphs: (metadata?.info_paragraphs || []).map(item => ({ key: item.key || '', title: item.title || '', text: item.text || '' })),
      data_cards: (metadata?.data_cards || []).map(card => {
        const entries = card.detail_entries
        if (entries && (new Set(entries.map(item => item.name)).size !== entries.length || entries.some(item => !item.name.trim() || /[.$]/.test(item.name) || ['__proto__', 'constructor', 'prototype'].includes(item.name)))) throw new Error('Tên chi tiết thẻ phải duy nhất, không trống và không chứa dấu chấm/$')
        return { id: card.id || crypto.randomUUID(), title: card.title || '', subtitle: card.subtitle || '', tags: card.tags || [], details: entries ? Object.fromEntries(entries.map(item => [item.name, item.value || ''])) : card.details || {} }
      }),
    },
    questions: (row.questions || []).map((question, index): ReadingQuestion => ({
      ...(question._id ? { _id: question._id } : {}), question_number: index + 1, question_type: question.question_type || 'MULTIPLE_CHOICE', exercise_type: question.exercise_type || 'MAIN_IDEA', question_text_en: question.question_text_en || '', question_text_vi: question.question_text_vi || '', instruction_en: question.instruction_en || '', instruction_vi: question.instruction_vi || '', grammar_knowledge_id: question.grammar_knowledge_id || '', vocabulary_ids: question.vocabulary_ids || [],
      ...Object.fromEntries((['line_start', 'line_end', 'paragraph_index'] as const).filter(key => question[key] != null).map(key => [key, question[key]])),
      question_data: { options: (question.question_data?.options || []).map(option => ({ key: option.key, text: option.text || '', is_correct: option.key === question.question_data?.correct_answer })), correct_answer: question.question_data?.correct_answer || '', alternative_answers: question.question_data?.alternative_answers || [], explanation: question.question_data?.explanation || '', explanation_vi: question.question_data?.explanation_vi || '' },
    })),
    ...(row._id ? { expected_revision: row.revision ?? 0 } : {}),
  }
}
export function readingFormValues(type: ReadingType, row?: Partial<ReadingRecord>): ReadingPayload {
  const data = readingPayload(type, row)
  data.passage_metadata.data_cards = data.passage_metadata.data_cards.map(card => ({ ...card, detail_entries: Object.entries(card.details).map(([name, value]) => ({ name, value })) }))
  return data
}
// order[newIndex] = oldIndex. Remap in one pass so swaps never rewrite a marker twice.
export function remapReadingMarkers(content: string, order: number[]) {
  return content.replace(/\[(\d+)\]/g, (_marker, number) => { const index = order.indexOf(Number(number) - 1); return index < 0 ? '' : `[${index + 1}]` })
}
