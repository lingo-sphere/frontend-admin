// Trang xem chi tiết bài làm kiểm tra khóa học và đối chiếu đáp án học viên.

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button, Image, Spin, Tooltip } from 'antd'
import {
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Award,
  Lightbulb,
  User,
  Volume2,
} from 'lucide-react'
import { progressService, type CourseTestSession } from '@/features/progress/services/progress.service'
import { userService } from '@/features/users/services/user.service'
import { courseService } from '@/features/courses/services/course.service'
import { resolveMediaUrl, IMAGE_FALLBACK_PLACEHOLDER } from '@/features/media/utils/media.utils'

const testTypes: Record<string, string> = {
  challenge: 'Challenge',
  'post-mini': 'Kiểm tra chương',
  'final-test': 'Kiểm tra cuối khóa',
}

const statuses: Record<string, string> = {
  IN_PROGRESS: 'Đang làm',
  SUBMITTED: 'Đã nộp',
  EXPIRED: 'Hết hạn',
  AWAITING_GRADING: 'Chờ chấm',
  FINALIZING: 'Đang xử lý',
}

const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleString('vi-VN') : '—')
const text = (value: unknown) => (typeof value === 'string' || typeof value === 'number' ? String(value) : '')

interface CourseTestSessionDetailPageProps {
  courseId: string
  sessionId: string
}

export function CourseTestSessionDetailPage({
  courseId,
  sessionId,
}: CourseTestSessionDetailPageProps) {
  const navigate = useNavigate()

  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['course-test-session-detail', courseId, sessionId],
    queryFn: () => progressService.getCourseTestSession(courseId, sessionId),
  })

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', session?.user_id],
    enabled: !!session?.user_id,
    queryFn: () => userService.getProfileById(session!.user_id).catch(() => null),
  })

  const { data: courseDetail } = useQuery({
    queryKey: ['course-detail', courseId],
    enabled: !!courseId,
    queryFn: () => courseService.getCourseById(courseId).catch(() => null),
  })

  const questionStats = useMemo(() => {
    if (!session || !session.raw_questions) {
      return { total: 0, correct: 0, wrong: 0, answered: 0, statuses: [] }
    }
    const questions = session.raw_questions
    let correct = 0
    let wrong = 0
    let answered = 0

    const statusesList = questions.map((q, index) => {
      const answer = session.interim_answers?.find((a) => a.question_index === index)
      const options = Array.isArray(q.options) ? q.options : []
      const selectedOption =
        answer?.selected_option ??
        (answer?.selected_index != null
          ? String.fromCharCode(65 + answer.selected_index)
          : null)

      const correctAns = text(q.correct_answer) || text(q.correct_option) || ''
      const isAnswered = Boolean(selectedOption)
      if (isAnswered) answered++

      let isCorrect = false
      if (selectedOption && correctAns) {
        if (selectedOption.trim().toUpperCase() === correctAns.trim().toUpperCase()) {
          isCorrect = true
        } else if (answer?.selected_index != null) {
          const optValue = options[answer.selected_index]
          const optText = typeof optValue === 'object' && optValue ? text((optValue as Record<string, unknown>).text) : text(optValue)
          if (optText.trim().toLowerCase() === correctAns.trim().toLowerCase()) {
            isCorrect = true
          }
        }
      }

      if (isCorrect) correct++
      else if (isAnswered) wrong++

      return {
        index,
        isAnswered,
        isCorrect,
      }
    })

    return {
      total: questions.length,
      correct,
      wrong,
      answered,
      statuses: statusesList,
    }
  }, [session])

  const calculateDuration = (startStr?: string, endStr?: string | null) => {
    if (!startStr || !endStr) return '—'
    const start = new Date(startStr).getTime()
    const end = new Date(endStr).getTime()
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—'
    const diffSec = Math.floor((end - start) / 1000)
    const mins = Math.floor(diffSec / 60)
    const secs = diffSec % 60
    return `${mins} phút ${secs} giây`
  }

  const isPassed = session?.is_passed ?? (session?.score != null && session?.passing_score != null ? session.score >= session.passing_score : null)

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/submissions/courses?courseId=${encodeURIComponent(courseId)}`)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại danh sách bài kiểm tra</span>
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Chi tiết bài làm kiểm tra khóa học
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {courseDetail?.title || 'Khóa học'} · {session ? testTypes[session.test_type] || session.test_type : '...'}
            </p>
          </div>
        </div>

        <Button
          size="small"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={() => { void refetch() }}
          className="rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          Tải lại bài làm
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Spin size="large" />
          <p className="mt-3 text-xs text-slate-500">Đang tải câu hỏi và kết quả bài làm…</p>
        </div>
      )}

      {isError && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400">
          <p className="font-semibold text-sm">Không thể tải chi tiết bài làm.</p>
          <p className="text-xs mt-1">{error instanceof Error ? error.message : 'Lỗi không xác định.'}</p>
          <Button
            type="primary"
            danger
            size="small"
            className="mt-3 rounded-lg text-xs"
            onClick={() => { void refetch() }}
          >
            Thử lại
          </Button>
        </div>
      )}

      {session && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Học viên</span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {userProfile?.full_name || userProfile?.email || session.user_id}
                </p>
                <p className="text-xs text-slate-400 truncate font-mono">
                  {userProfile?.email || session.user_id}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>Khóa học & Loại bài</span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {courseDetail?.title || 'Khóa học'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {testTypes[session.test_type] || session.test_type}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Kết quả & Điểm số</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {session.score == null ? '—' : session.score}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
                {isPassed != null && (
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isPassed
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {isPassed ? 'Đạt' : 'Chưa đạt'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Điểm sàn đạt: {session.passing_score ?? '80'} điểm · Trạng thái: {statuses[session.status] || session.status}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Thời gian làm bài</span>
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">
                {calculateDuration(session.started_at, session.submitted_at)}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Nộp bài: {formatDate(session.submitted_at)}
              </p>
            </div>
          </div>

          {questionStats.total > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mục lục câu hỏi ({questionStats.correct}/{questionStats.total} câu đúng)
                </span>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Đúng ({questionStats.correct})</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Sai ({questionStats.wrong})</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>Chưa trả lời ({questionStats.total - questionStats.answered})</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {questionStats.statuses.map((item) => (
                  <button
                    key={item.index}
                    type="button"
                    onClick={() => {
                      document.getElementById(`question-card-${item.index}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      })
                    }}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center border transition-all cursor-pointer ${
                      item.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400'
                        : item.isAnswered
                          ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {item.index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {session.raw_questions.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                Phiên kiểm tra này không lưu nội dung chi tiết từng câu hỏi.
              </div>
            )}

            {session.raw_questions.map((q, index) => {
              const answer = session.interim_answers?.find((a) => a.question_index === index)
              const options = Array.isArray(q.options) ? q.options : []
              const selectedOptionLetter =
                answer?.selected_option ??
                (answer?.selected_index != null
                  ? String.fromCharCode(65 + answer.selected_index)
                  : null)

              const correctAns = text(q.correct_answer) || text(q.correct_option) || ''
              const rawText = text(q.question_text) || text(q.prompt)
              const cleanQuestionText =
                rawText.replace(/^(?:\[[^\]]*\]\s*)?Câu\s*\d+\s*:\s*/i, '').trim() || rawText

              const statItem = questionStats.statuses[index]
              const isCorrect = statItem?.isCorrect ?? false
              const isAnswered = statItem?.isAnswered ?? false

              return (
                <div
                  key={index}
                  id={`question-card-${index}`}
                  className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 space-y-4 shadow-2xs transition-all ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/60'
                      : isAnswered
                        ? 'border-rose-200 dark:border-rose-900/60'
                        : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed">
                        {cleanQuestionText || `Câu ${index + 1}`}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Chính xác</span>
                        </span>
                      ) : isAnswered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Chưa chính xác</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Chưa trả lời
                        </span>
                      )}
                    </div>
                  </div>

                  {typeof q.image_url === 'string' && q.image_url && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 inline-block max-w-md bg-slate-50 dark:bg-slate-900/40">
                      <Image
                        className="max-h-64 max-w-full object-contain rounded-lg"
                        src={resolveMediaUrl(q.image_url)}
                        fallback={IMAGE_FALLBACK_PLACEHOLDER}
                        alt={`Hình ảnh câu ${index + 1}`}
                        preview={{ mask: 'Nhấp để xem ảnh lớn' }}
                      />
                    </div>
                  )}

                  {!!(q.audio_url || q.media_url) && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <audio
                        controls
                        preload="metadata"
                        className="w-full h-8"
                        src={resolveMediaUrl(text(q.audio_url) || text(q.media_url))}
                      />
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Các phương án lựa chọn:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {options.map((option, optIdx) => {
                        const optLetter = String.fromCharCode(65 + optIdx)
                        const optText =
                          typeof option === 'object' && option
                            ? text((option as Record<string, unknown>).text)
                            : text(option)

                        const isUserChoice =
                          selectedOptionLetter === optLetter ||
                          (answer?.selected_index === optIdx) ||
                          (optText && selectedOptionLetter && optText.trim().toLowerCase() === selectedOptionLetter.trim().toLowerCase())

                        const isAnswerMatch =
                          (correctAns && optLetter.toUpperCase() === correctAns.trim().toUpperCase()) ||
                          (correctAns && optText && optText.trim().toLowerCase() === correctAns.trim().toLowerCase())

                        let cardStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        if (isUserChoice && isAnswerMatch) {
                          cardStyle = 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold'
                        } else if (isUserChoice && !isAnswerMatch) {
                          cardStyle = 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold'
                        } else if (isAnswerMatch) {
                          cardStyle = 'border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${cardStyle}`}
                          >
                            <span className="w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 bg-white dark:bg-slate-900 border border-inherit">
                              {optLetter}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="leading-relaxed">{optText}</p>
                              {isUserChoice && (
                                <span className={`inline-block mt-1 text-[10px] font-bold ${isAnswerMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {isAnswerMatch ? '✓ Lựa chọn của học viên' : '✗ Lựa chọn của học viên'}
                                </span>
                              )}
                              {!isUserChoice && isAnswerMatch && (
                                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ✓ Đáp án đúng
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <span className="text-slate-400">Học viên chọn: </span>
                      <strong className={`font-mono ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : isAnswered ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                        {selectedOptionLetter || 'Chưa trả lời'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Đáp án chuẩn: </span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                        {correctAns || '—'}
                      </strong>
                    </div>
                  </div>

                  {!!q.explanation && (
                    <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-[11px] uppercase tracking-wider block text-amber-800 dark:text-amber-300">
                          Giải thích đáp án
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {text(q.explanation)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
