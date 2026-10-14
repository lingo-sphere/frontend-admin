// Modal bien soan bo cau hoi trac nghiem va import ZIP cho bai hoc.

import { ExamQuestionStudioModal } from '@/features/courses/components/exam.question.studio.modal'
import type { ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'
import type { CourseLesson, LessonQuestion } from '@/features/courses/components/course.basic.info.tab'

export interface LessonQuizStudioModalProps {
  isOpen: boolean
  lesson: CourseLesson | null
  chapterIndex?: number
  lessonIndex?: number
  isVi: boolean
  onClose: () => void
  onSave: (questions: LessonQuestion[]) => void
}

export function LessonQuizStudioModal({
  isOpen,
  lesson,
  chapterIndex = 0,
  lessonIndex = 0,
  isVi,
  onClose,
  onSave,
}: LessonQuizStudioModalProps) {
  if (!isOpen || !lesson) return null

  const modalTitle = isVi
    ? `Bộ câu hỏi ôn tập củng cố - Bài ${chapterIndex + 1}.${lessonIndex + 1}`
    : `Lesson Practice Quiz - Lesson ${chapterIndex + 1}.${lessonIndex + 1}`

  const initialQuestions: ExamQuestionItem[] = (lesson.questions || []).map((q, idx) => ({
    id: q.id || `q_init_${idx}`,
    question_text: q.question_text || '',
    options:
      q.options && q.options.length
        ? q.options.map((opt) => (typeof opt === 'string' ? opt : opt?.text || ''))
        : ['', '', '', ''],
    correct_answer: q.correct_answer || 'A',
    explanation: q.explanation || '',
    media_url: q.media_url || q.audio_url || '',
    image_url: q.image_url || '',
  }))

  const handleSave = (savedQuestions: ExamQuestionItem[]) => {
    const formatted: LessonQuestion[] = savedQuestions.map((sq, i) => ({
      id: sq.id || `q_${Date.now()}_${i}`,
      question_text: sq.question_text,
      options: sq.options,
      correct_answer: sq.correct_answer,
      explanation: sq.explanation || undefined,
      audio_url: sq.media_url || sq.audio_url || undefined,
      image_url: sq.image_url || undefined,
    }))
    onSave(formatted)
    onClose()
  }

  return (
    <ExamQuestionStudioModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={lesson.title || (isVi ? 'Bài học video' : 'Video Lesson')}
      is4Skills={false}
      isLessonMode={true}
      isVi={isVi}
      initialQuestions={initialQuestions}
      onSave={handleSave}
    />
  )
}
