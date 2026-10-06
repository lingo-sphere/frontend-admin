// Các hàm tiện ích chuẩn hóa, tạo snapshot và khởi tạo bộ câu hỏi bài thi TOEIC.

import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import type { ExamQuestionItem, RawExamQuestion } from '@/features/courses/types/exam.question.types'

export function normalizeQuestions(
  rawList: Array<ExamQuestionItem | RawExamQuestion | Record<string, unknown>>
): ExamQuestionItem[] {
  return rawList.map((q) => {
    const raw = q as RawExamQuestion
    const rawPart = raw.part_number
    const isSpk = rawPart === 'speaking' || raw.question_type === 'SPEAKING' || raw.skill_type === 'SPEAKING'
    const isWrt = rawPart === 'writing' || raw.question_type === 'WRITING' || raw.skill_type === 'WRITING'
    const numPart = typeof rawPart === 'number' ? rawPart : parseInt(String(rawPart), 10)
    const hasExplicitPart = !isNaN(numPart) && numPart >= 1 && numPart <= 7
    const rawMediaIsImage = Boolean(raw.media_url && /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(raw.media_url))
    const rawMediaIsAudio = Boolean(raw.media_url && !rawMediaIsImage)

    const isListen =
      raw.skill_type === 'LISTENING' ||
      (!isSpk && !isWrt && Boolean(raw.audio_url || rawMediaIsAudio)) ||
      (hasExplicitPart && numPart <= 4)

    const derivedSkill: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' = isSpk
      ? 'SPEAKING'
      : isWrt
        ? 'WRITING'
        : isListen
          ? 'LISTENING'
          : 'READING'

    return {
      id: raw.id || raw._id || '',
      skill_type: derivedSkill,
      part_number: isSpk ? 'speaking' : isWrt ? 'writing' : hasExplicitPart ? numPart : undefined,
      part_name: raw.part_name || '',
      question_type: isSpk ? 'SPEAKING' : isWrt ? 'WRITING' : 'MULTIPLE_CHOICE',
      question_text: raw.question_text || raw.question_text_en || '',
      options: Array.isArray(raw.options)
        ? raw.options.map((opt) => (typeof opt === 'string' ? opt : opt.textEn || opt.text || ''))
        : [],
      correct_answer: (raw.correct_answer || raw.correct_option || '').toString().toUpperCase(),
      explanation: raw.explanation || raw.explanation_vi || raw.explanation_en || '',
      media_url: raw.media_url || raw.audio_url || '',
      image_url: raw.image_url || raw.image_media_id || '',
      prep_time_seconds: raw.prep_time_seconds,
      response_time_seconds: raw.response_time_seconds,
      min_words: raw.min_words,
      context_id: raw.context_id || null,
    }
  })
}

export function getQuestionsSnapshot(qs: ExamQuestionItem[], audio: string): string {
  return JSON.stringify({
    audio: (audio || '').trim(),
    qs: (qs || []).map((q) => ({
      skill_type: q.skill_type || 'READING',
      part_number: q.part_number !== undefined ? String(q.part_number) : '',
      question_type: q.question_type || 'MULTIPLE_CHOICE',
      question_text: (q.question_text || '').trim(),
      options: Array.isArray(q.options) ? q.options.map((opt) => (opt || '').trim()) : [],
      correct_answer: (q.correct_answer || '').toString().trim().toUpperCase(),
      explanation: (q.explanation || '').trim(),
      media_url: (q.media_url || q.audio_url || '').trim(),
      image_url: (q.image_url || '').trim(),
      prep_time_seconds: q.prep_time_seconds ?? null,
      response_time_seconds: q.response_time_seconds ?? null,
      min_words: q.min_words ?? null,
      context_id: q.context_id || null,
    })),
  })
}

export function computeInitialBundle(
  exam: ToeicExamItem | null | undefined,
  initialQuestions: ExamQuestionItem[] | undefined,
  initialGlobalAudioUrl: string | undefined
) {
  const rawQs = exam?.questions || initialQuestions || []
  const qs = normalizeQuestions(Array.isArray(rawQs) ? rawQs : [])
  const audio = (exam?.audio_url || initialGlobalAudioUrl || '').trim()
  const snap = getQuestionsSnapshot(qs, audio)
  const initialMedia = new Set<string>()
  if (audio) initialMedia.add(audio)
  qs.forEach((q) => {
    if (q.media_url) initialMedia.add(q.media_url)
    if (q.audio_url) initialMedia.add(q.audio_url)
    if (q.image_url) initialMedia.add(q.image_url)
  })
  return { qs, audio, snap, initialMedia }
}
