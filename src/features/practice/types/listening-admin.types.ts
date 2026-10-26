export const listeningTypes = ['part1', 'part2', 'part3', 'part4', 'dictation'] as const
export type ListeningType = typeof listeningTypes[number]
export const listeningLabels: Record<ListeningType, string> = { part1: 'Part 1 · Mô tả tranh', part2: 'Part 2 · Hỏi đáp', part3: 'Part 3 · Hội thoại', part4: 'Part 4 · Bài nói', dictation: 'Dictation' }
export const listeningSubtypes: Record<ListeningType, { field: string; label: string; values: string[] }> = {
  part1: { field: 'picture_type', label: 'Loại ảnh', values: ['SINGLE_PERSON', 'MULTIPLE_PEOPLE', 'OBJECT', 'SCENE'] },
  part2: { field: 'question_type', label: 'Loại câu hỏi', values: ['WH', 'YES_NO', 'CHOICE', 'TAG', 'REQUEST', 'SUGGEST'] },
  part3: { field: 'conversation_type', label: 'Loại hội thoại', values: ['BUSINESS', 'SOCIAL', 'SERVICE', 'TECHNICAL', 'GENERAL'] },
  part4: { field: 'talk_type', label: 'Loại bài nói', values: ['ANNOUNCEMENT', 'NEWS_REPORT', 'TALK_SPEECH', 'ADVERTISEMENT', 'INSTRUCTION'] },
  dictation: { field: '', label: '', values: [] },
}
export interface ListeningOption { key: string; text: string; text_vi?: string; audio_url?: string; is_correct?: boolean }
export interface ListeningQuestion { question_index: number; question_text: string; question_text_vi?: string; question_type: string; options: ListeningOption[]; correct_answer: string; explanation?: string; explanation_vi?: string; grammar_knowledge_id?: string; grammar_point_title?: string; grammar_point_title_vi?: string }
export interface ListeningBlank { start_char: number; end_char: number; correct_answer: string; alternative_answers: string[]; blank_type: 'WORD' | 'PHRASE' | 'SENTENCE'; difficulty_weight: number; is_key_word: boolean }
export interface ListeningSegment { _id?: string; segment_index?: number; start_time: number; end_time: number; text: string; text_vi?: string; speaker?: string; audio_segment_url?: string; blanks: ListeningBlank[] }
export interface ListeningSettings { allow_replay?: boolean; replay_limit?: number; time_per_question?: number; show_image_before?: boolean; show_questions_before_audio?: boolean; auto_advance?: boolean; audio_mode?: string; show_transcript_after?: boolean; show_answers_immediately?: boolean; enable_hints?: boolean; max_hints_per_segment?: number; playback_speeds?: number[]; default_playback_speed?: number }
export interface ListeningDifficulty { hide_ratio: number; blank_types: string[]; show_first_letter: boolean; show_length: boolean; time_per_segment: number; allow_replay: boolean; replay_limit: number }
export interface ListeningPayload {
  title: string; title_vi: string; description: string; description_vi: string; status: string; cefr_level: string; difficulty_level: string; context_id: string
  audio_url: string; media_id: string; audio_media_id: string; image_url: string; image_media_id: string; duration_seconds: number; transcript: string; transcript_vi: string
  picture_type?: string; question_type?: string; conversation_type?: string; talk_type?: string; speaker_1?: string; speaker_2?: string; speaker_gender?: string
  speaker_1_name: string; speaker_2_name: string; speaker_name: string; speaker_role: string
  options: ListeningOption[]; correct_answer: string; explanation: string; explanation_vi: string; questions: ListeningQuestion[]; segments: ListeningSegment[]; settings: ListeningSettings
  difficulty_settings?: Record<'easy' | 'medium' | 'hard', ListeningDifficulty>
  target_lexical_item_ids: string[]; target_grammar_knowledge_ids: string[]; target_phonetics_knowledge_ids: string[]; expected_revision?: number
}
export interface ListeningRecord extends ListeningPayload { _id: string; revision: number; audio_duration_seconds?: number; total_segments?: number; total_words?: number; total_blanks?: number; created_at?: string; updated_at?: string }
export const blankOptions = (count: number): ListeningOption[] => 'ABCD'.slice(0, count).split('').map(key => ({ key, text: '', text_vi: '' }))
