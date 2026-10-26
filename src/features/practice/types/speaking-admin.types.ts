export const speakingTypes = ['READ_ALOUD', 'DESCRIBE_PICTURE', 'SHORT_DIALOGUE', 'ANSWER_QUESTION', 'OPINION_RESPONSE'] as const
export type SpeakingType = typeof speakingTypes[number]
export const speakingLabels: Record<SpeakingType, string> = { READ_ALOUD: 'Đọc to', DESCRIBE_PICTURE: 'Mô tả tranh', SHORT_DIALOGUE: 'Hội thoại ngắn', ANSWER_QUESTION: 'Hỏi đáp', OPINION_RESPONSE: 'Trình bày ý kiến' }
export const speakingVoices = [{ value: 'en-US-JennyNeural', label: 'Anh Mỹ · Jenny' }, { value: 'en-GB-SoniaNeural', label: 'Anh Anh · Sonia' }, { value: 'en-AU-NatashaNeural', label: 'Anh Úc · Natasha' }]
export interface SpeakingGuidance { goal_vi: string; turn_goal_vi: string; suggested_phrases: string[]; expected_keywords: string[] }
export interface SpeakingTurn { turn_id?: string; turn_number: number; speaker: 'AI' | 'USER'; speaker_name: string; text_en: string; text_vi: string; prompt_audio_id: string; tts_voice: string; tts_text_hash: string; user_guidance?: SpeakingGuidance | null }
export interface SpeakingScenario { setting: string; setting_vi: string; user_role: string; ai_role: string; overall_goals_vi: string[]; turns: SpeakingTurn[] }
export interface SpeakingTier { preparation_time_seconds: number; response_time_seconds: number; show_hints: boolean; max_record_attempts: number }
export const rubricFields = ['pronunciation', 'fluency', 'vocabulary', 'grammar', 'coherence', 'content'] as const
export type SpeakingRubric = Record<typeof rubricFields[number], number>
export interface SpeakingPayload {
  title: string; title_vi: string; description: string; description_vi: string; exercise_type: SpeakingType; status: string; cefr_level: string; difficulty_level: string; context_id: string
  prompt_text_en: string; prompt_text_vi: string; prompt_media_id: string; reference_media_id: string; source_text: string; source_text_vi: string
  dialogue_scenario: SpeakingScenario | null; tiered_time_limits: Partial<Record<'easy' | 'medium' | 'hard', SpeakingTier>> | null
  expected_keywords: string[]; expected_structure: string[]; rubric: SpeakingRubric; max_score: number; preparation_time_seconds: number; response_time_seconds: number; estimated_minutes: number
  target_lexical_item_ids: string[]; target_phonetics_knowledge_ids: string[]; target_grammar_knowledge_ids: string[]; expected_revision?: number
}
export interface SpeakingRecord extends SpeakingPayload { _id: string; revision: number; created_at?: string; updated_at?: string }
export interface SpeakingTtsResult { media_id: string; storage_key: string; tts_text_hash: string; voice: string; duration_seconds: number; cached: boolean }
export const newSpeakingTurn = (speaker: 'AI' | 'USER', index: number): SpeakingTurn => ({ turn_number: index + 1, speaker, speaker_name: speaker === 'AI' ? 'AI' : 'Bạn', text_en: '', text_vi: '', prompt_audio_id: '', tts_voice: speakingVoices[0].value, tts_text_hash: '', user_guidance: speaker === 'USER' ? { goal_vi: '', turn_goal_vi: '', suggested_phrases: [], expected_keywords: [] } : null })
