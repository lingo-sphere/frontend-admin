// Hàm tiện ích chuẩn hóa dữ liệu bảng âm và bài tập ngữ âm IPA.
import { normalizeToRelativePath } from '@/lib/media.utils'
import { ipaAudioFields, type IpaExerciseRecord, type IpaSymbolRecord, type SaveIpaExercise, type SaveIpaSymbol } from '@/features/practice/types/ipa-admin.types'

export function symbolPayload(record: IpaSymbolRecord): SaveIpaSymbol {
  return {
    symbol_type: record.symbol_type, description_en: record.description_en || '', description_vi: record.description_vi || '',
    example_word: record.example_word, example_word_ipa: record.example_word_ipa, related_symbols: record.related_symbols || [], cefr_min_level: record.cefr_min_level || 'A1', status: record.status,
    ...Object.fromEntries(ipaAudioFields.map(field => [field, normalizeToRelativePath(record[field] || '')])), expected_revision: record.revision || 0,
  }
}
export function exercisePayload(record: IpaExerciseRecord): SaveIpaExercise {
  return {
    title: record.title, title_vi: record.title_vi || '', exercise_type: record.exercise_type,
    prompt_text: record.prompt_text || '', prompt_text_vi: record.prompt_text_vi || '', instruction: record.instruction || '', instruction_vi: record.instruction_vi || '',
    target_phonemes: record.target_phonemes || [], target_words: record.target_words || [], target_ipa: record.target_ipa || '', target_ipa_uk: record.target_ipa_uk || '',
    audio_id: normalizeToRelativePath(record.audio_id || ''), options: record.options || [], correct_answer: record.correct_answer || '',
    minimal_pair: record.exercise_type === 'MINIMAL_PAIR_LISTEN' && record.minimal_pair ? { ...record.minimal_pair, audio_a: normalizeToRelativePath(record.minimal_pair.audio_a), audio_b: normalizeToRelativePath(record.minimal_pair.audio_b) } : null,
    context_id: record.context_id || '', cefr_level: record.cefr_level || 'A1', difficulty_level: record.difficulty_level || 'MEDIUM', status: record.status || 'DRAFT',
    ...(record._id ? { expected_revision: record.revision || 0 } : {}),
  }
}
export function ipaError(error: unknown) { return error instanceof Error ? error.message : 'Không lưu được dữ liệu. Vui lòng thử lại.' }
export const mediaKeyRule = { validator: (_: unknown, value?: string) => !value || (!/[:?#\\\s%]/u.test(value) && !value.startsWith('/') && !value.split('/').some(part => part === '.' || part === '..')) ? Promise.resolve() : Promise.reject(new Error('Dùng storage key tương đối, không nhập URL đầy đủ')) }
