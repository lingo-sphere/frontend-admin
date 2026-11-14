// Định dạng hiển thị điểm số và nhãn loại bài nộp luyện tập.
import type { PracticeSubmission } from '@/features/submissions/services/practice.review.service'

export function practiceScoreLabel(item: PracticeSubmission, ai = false) {
  const toeic = item.grading_standard === 'TOEIC'
  const value = toeic ? (ai ? item.original_ai_raw_score : item.raw_score) : (ai ? item.ai_score : item.overall_score)
  return typeof value === 'number' ? `${value}/${toeic ? item.max_score ?? '—' : 100}` : 'Chưa có điểm'
}

export function practiceDateLabel(date?: string | null) {
  if (!date) return '—'
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? '—' : value.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })
}

export function practiceHistoryScoreLabel(entry: NonNullable<PracticeSubmission['review_history']>[number], item: PracticeSubmission) {
  const toeic = (entry.grading_standard || item.grading_standard) === 'TOEIC'
  const max = entry.max_score ?? (toeic ? item.max_score : 100)
  const before = toeic ? entry.previous_raw_score : entry.previous_score
  const after = toeic ? entry.raw_score : entry.score
  return `${typeof before === 'number' ? before : 'Chưa có điểm'} → ${typeof after === 'number' ? `${after}/${max ?? '—'}` : 'Chưa có điểm tác vụ'}`
}

export const practiceExerciseLabels: Record<string, string> = {
  READ_ALOUD: 'Đọc thành tiếng', PICTURE_DESCRIPTION: 'Miêu tả tranh',
  DESCRIBE_PICTURE: 'Miêu tả tranh', OPINION_RESPONSE: 'Trình bày quan điểm',
  EXPRESS_OPINION: 'Trình bày quan điểm', RESPOND_TO_QUESTIONS: 'Trả lời câu hỏi',
  PROPOSE_SOLUTION: 'Đề xuất giải pháp', DIALOGUE: 'Hội thoại',
  WORD_REORDERING: 'Sắp xếp từ', SENTENCE_COMPLETION: 'Hoàn thành câu',
  SENTENCE_REWRITING: 'Viết lại câu', PARAGRAPH_WRITING: 'Viết đoạn văn',
  WRITE_EMAIL: 'Viết email', EMAIL_WRITING: 'Viết email', ESSAY_WRITING: 'Viết bài luận',
  WRITE_SENTENCE: 'Viết câu', WRITE_SENTENCE_BASED_ON_PICTURE: 'Viết câu theo tranh',
}
