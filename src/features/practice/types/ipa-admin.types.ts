export const ipaTypes = ['MINIMAL_PAIR_LISTEN', 'PHONEME_LISTEN', 'WORD_TRANSCRIPTION'] as const
export type IpaExerciseType = typeof ipaTypes[number]
export const ipaTypeLabels: Record<IpaExerciseType, string> = {
  MINIMAL_PAIR_LISTEN: 'Cặp âm tối thiểu', PHONEME_LISTEN: 'Nghe chọn âm', WORD_TRANSCRIPTION: 'Chọn phiên âm',
}
export const ipaLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const ipaAudioFields = ['audio_url', 'audio_url_us', 'audio_url_uk', 'example_audio_url', 'example_audio_url_us', 'example_audio_url_uk'] as const
export interface IpaSymbolRecord {
  _id: string; id: string; symbol: string; symbol_type: string
  description_en?: string; description_vi?: string; example_word: string; example_word_ipa: string
  audio_url?: string; audio_url_us?: string; audio_url_uk?: string
  example_audio_url?: string; example_audio_url_us?: string; example_audio_url_uk?: string
  related_symbols: string[]; cefr_min_level: string; status: string
  revision: number; created_at?: string; updated_at?: string
}
export interface IpaExerciseRecord {
  _id: string; title: string; title_vi?: string; exercise_type: IpaExerciseType
  prompt_text?: string; prompt_text_vi?: string; instruction?: string; instruction_vi?: string
  target_phonemes: string[]; target_words: string[]; target_ipa?: string; target_ipa_uk?: string
  audio_id?: string; options: string[]; correct_answer?: string
  minimal_pair?: { word_a: string; word_b: string; ipa_a: string; ipa_b: string; phoneme_contrast: string; audio_a?: string; audio_b?: string } | null
  context_id?: string; cefr_level: string; difficulty_level: string; status: string
  revision: number; isDeleted?: boolean; created_at?: string; updated_at?: string
}
export interface IpaAdminQuery { page: number; limit: number; search?: string; filters?: string; sort?: string; order?: string; trash?: string }
export interface IpaPage<T> { items: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
export type SaveIpaSymbol = Omit<IpaSymbolRecord, '_id' | 'id' | 'symbol' | 'revision' | 'created_at' | 'updated_at'> & { expected_revision: number }
export type SaveIpaExercise = Omit<IpaExerciseRecord, '_id' | 'revision' | 'isDeleted' | 'created_at' | 'updated_at'> & { expected_revision?: number }
