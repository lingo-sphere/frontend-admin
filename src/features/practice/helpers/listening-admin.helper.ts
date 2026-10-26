import { normalizeToRelativePath } from '@/lib/media.utils'
import { blankOptions, listeningSubtypes, type ListeningPayload, type ListeningQuestion, type ListeningRecord, type ListeningType } from '../types/listening-admin.types'

export function listeningPayload(type: ListeningType, record?: Partial<ListeningRecord>): ListeningPayload {
  const row = record || {}
  const string = (key: keyof ListeningPayload) => typeof row[key] === 'string' ? row[key] as string : ''
  const subtype = listeningSubtypes[type]
  const questions: ListeningQuestion[] = row.questions?.length ? row.questions : (type === 'part3' || type === 'part4' ? Array.from({ length: 3 }, (_, index) => ({ question_index: index, question_text: '', question_type: 'DETAIL', options: blankOptions(4), correct_answer: '' })) : [])
  return {
    title: string('title'), title_vi: string('title_vi'), description: string('description'), description_vi: string('description_vi'),
    status: row.status || 'DRAFT', cefr_level: row.cefr_level || 'B1', difficulty_level: row.difficulty_level || 'MEDIUM', context_id: string('context_id'),
    audio_url: normalizeToRelativePath(string('audio_url')), media_id: string('media_id'), audio_media_id: string('audio_media_id'), image_url: normalizeToRelativePath(string('image_url')), image_media_id: string('image_media_id'),
    duration_seconds: row.audio_duration_seconds ?? row.duration_seconds ?? 0, transcript: string('transcript'), transcript_vi: string('transcript_vi'),
    ...(subtype.field ? { [subtype.field]: string(subtype.field as keyof ListeningPayload) || subtype.values.at(-1) } : {}),
    ...(type === 'part3' ? { speaker_1: row.speaker_1 || 'MALE', speaker_2: row.speaker_2 || 'FEMALE' } : type === 'part4' ? { speaker_gender: row.speaker_gender || 'MALE' } : {}),
    speaker_1_name: string('speaker_1_name'), speaker_2_name: string('speaker_2_name'), speaker_name: string('speaker_name'), speaker_role: string('speaker_role'),
    options: (row.options?.length ? row.options : (type === 'part1' || type === 'part2' ? blankOptions(type === 'part1' ? 4 : 3) : [])).map(option => ({ key: option.key, text: option.text || '', text_vi: option.text_vi || '', audio_url: normalizeToRelativePath(option.audio_url || ''), is_correct: option.key === row.correct_answer })),
    correct_answer: string('correct_answer'), explanation: string('explanation'), explanation_vi: string('explanation_vi'),
    questions: questions.map((question, index) => ({ question_index: index, question_text: question.question_text, question_text_vi: question.question_text_vi || '', question_type: question.question_type, correct_answer: question.correct_answer, options: question.options.map(option => ({ key: option.key, text: option.text, text_vi: option.text_vi || '', is_correct: option.key === question.correct_answer })), explanation: question.explanation || '', explanation_vi: question.explanation_vi || '', grammar_knowledge_id: question.grammar_knowledge_id || '', grammar_point_title: question.grammar_point_title || '', grammar_point_title_vi: question.grammar_point_title_vi || '' })),
    segments: (row.segments || []).map((segment, index) => ({ ...(segment._id ? { _id: segment._id } : {}), segment_index: index, start_time: segment.start_time, end_time: segment.end_time, text: segment.text, text_vi: segment.text_vi || '', speaker: segment.speaker || 'MALE', audio_segment_url: normalizeToRelativePath(segment.audio_segment_url || ''), blanks: (segment.blanks || []).map(blank => ({ start_char: blank.start_char, end_char: blank.end_char, correct_answer: blank.correct_answer, alternative_answers: blank.alternative_answers || [], blank_type: blank.blank_type || 'WORD', difficulty_weight: blank.difficulty_weight ?? 1, is_key_word: Boolean(blank.is_key_word) })) })),
    settings: { ...row.settings, ...(type === 'part2' ? { audio_mode: row.settings?.audio_mode || 'FULL_AUDIO' } : {}) },
    ...(type === 'dictation' ? { difficulty_settings: row.difficulty_settings || {
      easy: { hide_ratio: 0.2, blank_types: ['WORD'], show_first_letter: false, show_length: false, time_per_segment: 60, allow_replay: true, replay_limit: 3 },
      medium: { hide_ratio: 0.5, blank_types: ['WORD', 'PHRASE'], show_first_letter: true, show_length: true, time_per_segment: 90, allow_replay: true, replay_limit: 2 },
      hard: { hide_ratio: 0.9, blank_types: ['WORD', 'PHRASE', 'SENTENCE'], show_first_letter: false, show_length: false, time_per_segment: 120, allow_replay: true, replay_limit: 1 },
    } } : {}),
    target_lexical_item_ids: row.target_lexical_item_ids || [], target_grammar_knowledge_ids: row.target_grammar_knowledge_ids || [], target_phonetics_knowledge_ids: row.target_phonetics_knowledge_ids || [],
    ...(row._id ? { expected_revision: row.revision ?? 0 } : {}),
  }
}
