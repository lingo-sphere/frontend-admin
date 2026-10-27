// Hàm tiện ích chuẩn hóa dữ liệu bài tập nói Speaking.
import { newSpeakingTurn, rubricFields, speakingVoices, type SpeakingPayload, type SpeakingRecord, type SpeakingRubric, type SpeakingType } from '@/features/practice/types/speaking-admin.types'
export function speakingPayload(type: SpeakingType, row: Partial<SpeakingRecord> = {}): SpeakingPayload {
  const text = (key: keyof SpeakingPayload) => typeof row[key] === 'string' ? row[key] as string : ''
  return {
    title: text('title'), title_vi: text('title_vi'), description: text('description'), description_vi: text('description_vi'), exercise_type: type, status: row.status || 'DRAFT', cefr_level: row.cefr_level || 'B1', difficulty_level: row.difficulty_level || 'MEDIUM', context_id: text('context_id'),
    prompt_text_en: text('prompt_text_en'), prompt_text_vi: text('prompt_text_vi'), prompt_media_id: text('prompt_media_id'), reference_media_id: text('reference_media_id'), source_text: text('source_text'), source_text_vi: text('source_text_vi'),
    dialogue_scenario: type === 'SHORT_DIALOGUE' ? {
      setting: row.dialogue_scenario?.setting || '', setting_vi: row.dialogue_scenario?.setting_vi || '', user_role: row.dialogue_scenario?.user_role || '', ai_role: row.dialogue_scenario?.ai_role || '', overall_goals_vi: row.dialogue_scenario?.overall_goals_vi || [],
      turns: (row.dialogue_scenario?.turns || [newSpeakingTurn('AI', 0), newSpeakingTurn('USER', 1)]).map((turn, index) => ({ ...(turn.turn_id ? { turn_id: turn.turn_id } : {}), turn_number: index + 1, speaker: turn.speaker, speaker_name: turn.speaker_name || '', text_en: turn.text_en || '', text_vi: turn.text_vi || '', prompt_audio_id: turn.speaker === 'AI' ? turn.prompt_audio_id || '' : '', tts_voice: turn.tts_voice || speakingVoices[0].value, tts_text_hash: turn.tts_text_hash || '', user_guidance: turn.speaker === 'USER' ? { goal_vi: turn.user_guidance?.goal_vi || '', turn_goal_vi: turn.user_guidance?.turn_goal_vi || '', suggested_phrases: turn.user_guidance?.suggested_phrases || [], expected_keywords: turn.user_guidance?.expected_keywords || [] } : null })),
    } : null,
    tiered_time_limits: row.tiered_time_limits ? Object.fromEntries(Object.entries(row.tiered_time_limits).filter(([, tier]) => Boolean(tier)).map(([level, tier]) => [level, { preparation_time_seconds: tier!.preparation_time_seconds ?? 0, response_time_seconds: tier!.response_time_seconds ?? 45, show_hints: tier!.show_hints ?? true, max_record_attempts: tier!.max_record_attempts ?? 3 }])) : null,
    expected_keywords: row.expected_keywords || [], expected_structure: row.expected_structure || [], rubric: Object.fromEntries(rubricFields.map(field => [field, row.rubric?.[field] ?? 0])) as SpeakingRubric,
    max_score: row.max_score ?? 5, preparation_time_seconds: row.preparation_time_seconds ?? 30, response_time_seconds: row.response_time_seconds ?? 45, estimated_minutes: row.estimated_minutes ?? 5,
    target_lexical_item_ids: row.target_lexical_item_ids || [], target_phonetics_knowledge_ids: row.target_phonetics_knowledge_ids || [], target_grammar_knowledge_ids: row.target_grammar_knowledge_ids || [], ...(row._id ? { expected_revision: row.revision ?? 0 } : {}),
  }
}
