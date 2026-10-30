// Trang xem chi tiết bài làm kiểm tra khóa học, sửa điểm và nhận xét học viên.

import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Image, Spin } from 'antd'
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
  Edit3,
  Save,
  MessageSquare,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import { progressService } from '@/features/progress/services/progress.service'
import { userService } from '@/features/users/services/user.service'
import { courseService } from '@/features/courses/services/course.service'
import { resolveMediaUrl, IMAGE_FALLBACK_PLACEHOLDER } from '@/features/media/utils/media.utils'
import { toast } from '@/store/toast.store'

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
  const queryClient = useQueryClient()

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

  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [teacherFeedback, setTeacherFeedback] = useState<string>('')
  const [questionReviews, setQuestionReviews] = useState<Record<number, { is_correct?: boolean; feedback?: string }>>({})
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!session) return
    setOverallScore(session.score ?? null)
    setTeacherFeedback(session.teacher_feedback || '')
    const map: Record<number, { is_correct?: boolean; feedback?: string }> = {}
    if (Array.isArray(session.question_reviews)) {
      session.question_reviews.forEach((qr) => {
        map[qr.question_index] = {
          is_correct: qr.is_correct,
          feedback: qr.feedback || '',
        }
      })
    }
    setQuestionReviews(map)
    setIsDirty(false)
  }, [session])

  const reviewMutation = useMutation({
    mutationFn: (payload: {
      score?: number
      teacher_feedback?: string
      question_reviews?: Array<{
        question_index: number
        is_correct?: boolean
        feedback?: string
      }>
    }) => progressService.reviewCourseTestSession(courseId, sessionId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['course-test-session-detail', courseId, sessionId], updated)
      void queryClient.invalidateQueries({ queryKey: ['course-test-session-detail', courseId, sessionId] })
      void queryClient.invalidateQueries({ queryKey: ['course-test-sessions', courseId] })
      setIsDirty(false)
      toast.success('Đã lưu nhận xét và cập nhật điểm bài kiểm tra thành công!')
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu nhận xét.'
      toast.error(msg)
    },
  })

  const handleSaveAll = () => {
    const reviewsArray = Object.entries(questionReviews).map(([idxStr, rev]) => ({
      question_index: Number(idxStr),
      is_correct: rev.is_correct,
      feedback: rev.feedback || '',
    }))

    reviewMutation.mutate({
      score: overallScore != null ? overallScore : undefined,
      teacher_feedback: teacherFeedback.trim(),
      question_reviews: reviewsArray,
    })
  }

  const handleSaveSingleQuestion = (index: number) => {
    const rev = questionReviews[index]
    reviewMutation.mutate({
      question_reviews: [
        {
          question_index: index,
          is_correct: rev?.is_correct,
          feedback: rev?.feedback || '',
        },
      ],
    })
  }

  const handleToggleQuestionCorrect = (index: number, newCorrect: boolean) => {
    setQuestionReviews((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        is_correct: newCorrect,
      },
    }))
    setIsDirty(true)
  }

  const handleResetQuestionOverride = (index: number) => {
    setQuestionReviews((prev) => {
      const next = { ...prev }
      if (next[index]) {
        const { is_correct, ...rest } = next[index]
        next[index] = rest
      }
      return next
    })
    setIsDirty(true)
  }

  const handleQuestionFeedbackChange = (index: number, feedbackText: string) => {
    setQuestionReviews((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        feedback: feedbackText,
      },
    }))
    setIsDirty(true)
  }

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

      let autoIsCorrect = false
      if (selectedOption && correctAns) {
        if (selectedOption.trim().toUpperCase() === correctAns.trim().toUpperCase()) {
          autoIsCorrect = true
        } else if (answer?.selected_index != null) {
          const optValue = options[answer.selected_index]
          const optText = typeof optValue === 'object' && optValue ? text((optValue as Record<string, unknown>).text) : text(optValue)
          if (optText.trim().toLowerCase() === correctAns.trim().toLowerCase()) {
            autoIsCorrect = true
          }
        }
      }

      const review = questionReviews[index]
      const isOverridden = review?.is_correct !== undefined
      const isCorrect = isOverridden ? Boolean(review.is_correct) : autoIsCorrect

      if (isCorrect) correct++
      else if (isAnswered) wrong++

      return {
        index,
        isAnswered,
        isCorrect,
        isOverridden,
        autoIsCorrect,
      }
    })

    return {
      total: questions.length,
      correct,
      wrong,
      answered,
      statuses: statusesList,
    }
  }, [session, questionReviews])

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

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null)

  const handleScrollToQuestion = (index: number) => {
    setActiveQuestionIndex(index)
    const el = document.getElementById(`question-card-${index}`)
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  useEffect(() => {
    if (!session?.raw_questions || session.raw_questions.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible && visible.target.id) {
          const idx = Number(visible.target.id.replace('question-card-', ''))
          if (!Number.isNaN(idx)) {
            setActiveQuestionIndex(idx)
          }
        }
      },
      {
        rootMargin: '-180px 0px -60% 0px',
        threshold: 0,
      }
    )

    session.raw_questions.forEach((_, idx) => {
      const el = document.getElementById(`question-card-${idx}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [session?.raw_questions])

  const effectivePassingScore = session?.passing_score ?? 80
  const isPassed = overallScore != null ? overallScore >= effectivePassingScore : (session?.is_passed ?? false)

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="small"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => { void refetch() }}
            className="rounded-xl text-xs font-semibold"
          >
            Tải lại bài làm
          </Button>

          <Button
            type="primary"
            size="small"
            loading={reviewMutation.isPending}
            disabled={!isDirty && !reviewMutation.isPending}
            icon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSaveAll}
            className="rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500"
          >
            Lưu thay đổi
          </Button>
        </div>
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
                  {overallScore == null ? '—' : overallScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
                <span
                  className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isPassed
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {isPassed ? 'Đạt' : 'Chưa đạt'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Điểm sàn đạt: {effectivePassingScore} điểm · Trạng thái: {statuses[session.status] || session.status}
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

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Nhận xét & Sửa điểm bài kiểm tra (Toàn bài)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Giảng viên và quản trị viên có thể điều chỉnh điểm tổng kết hoặc ghi nhận xét chung cho toàn bộ bài làm.
                  </p>
                </div>
              </div>

              {session.reviewed_at && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Đã đánh giá bởi {session.teacher_name || 'Giáo viên'} ({formatDate(session.reviewed_at)})
                  </span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Điểm tổng kết (thang 100):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={overallScore ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value)
                      setOverallScore(val)
                      setIsDirty(true)
                    }}
                    placeholder="0 - 100"
                    className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  <span
                    className={`ml-auto px-2.5 py-1 rounded-full text-xs font-bold ${
                      isPassed
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {isPassed ? 'Đạt chuẩn' : 'Chưa đạt'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const calculated = Math.round((questionStats.correct / Math.max(1, questionStats.total)) * 100)
                    setOverallScore(calculated)
                    setIsDirty(true)
                    toast.success(`Đã tự động tính lại điểm: ${calculated}/100 dựa trên ${questionStats.correct}/${questionStats.total} câu đúng.`)
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tự động tính từ số câu đúng ({questionStats.correct}/{questionStats.total})</span>
                </button>
              </div>

              <div className="lg:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nhận xét chung toàn bài kiểm tra:
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {teacherFeedback.length} ký tự
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={teacherFeedback}
                  onChange={(e) => {
                    setTeacherFeedback(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Nhập nhận xét tổng quan, đánh giá năng lực, hướng dẫn ôn tập cho học viên..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                {isDirty && (
                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Có thay đổi chưa lưu</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  loading={reviewMutation.isPending}
                  onClick={handleSaveAll}
                  icon={<Save className="w-3.5 h-3.5" />}
                  className="rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500"
                >
                  Lưu tất cả nhận xét & Điểm số
                </Button>
              </div>
            </div>
          </div>

          {questionStats.total > 0 && (
            <div className="sticky top-[68px] z-30 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-md space-y-3 transition-all">
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

              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {questionStats.statuses.map((item) => {
                  const isActive = activeQuestionIndex === item.index
                  return (
                    <button
                      key={item.index}
                      type="button"
                      onClick={() => handleScrollToQuestion(item.index)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center border transition-all cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-xs z-10'
                          : ''
                      } ${
                        item.isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400'
                          : item.isAnswered
                            ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-400'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {item.index + 1}
                    </button>
                  )
                })}
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
              const isOverridden = statItem?.isOverridden ?? false

              return (
                <div
                  key={index}
                  id={`question-card-${index}`}
                  className={`scroll-mt-56 p-5 rounded-2xl border bg-white dark:bg-slate-900 space-y-4 shadow-2xs transition-all ${
                    activeQuestionIndex === index
                      ? 'ring-2 ring-indigo-500/40 dark:ring-indigo-400/40 border-indigo-300 dark:border-indigo-700'
                      : isCorrect
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

                    <div className="shrink-0 flex items-center gap-2">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isOverridden ? 'Chính xác (Đã điều chỉnh)' : 'Chính xác'}</span>
                        </span>
                      ) : isAnswered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isOverridden ? 'Chưa chính xác (Đã điều chỉnh)' : 'Chưa chính xác'}</span>
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

                  <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 dark:border-indigo-900/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Đánh giá & Nhận xét câu {index + 1}:
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleQuestionCorrect(index, true)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Công nhận đúng</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleQuestionCorrect(index, false)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            !isCorrect && isAnswered
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          <span>Đánh dấu sai</span>
                        </button>

                        {isOverridden && (
                          <button
                            type="button"
                            onClick={() => handleResetQuestionOverride(index)}
                            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer ml-1"
                          >
                            Đặt lại tự động
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={questionReviews[index]?.feedback || ''}
                        onChange={(e) => handleQuestionFeedbackChange(index, e.target.value)}
                        placeholder={`Ghi chú / Nhận xét riêng cho câu ${index + 1}...`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        disabled={reviewMutation.isPending}
                        onClick={() => handleSaveSingleQuestion(index)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                      >
                        Lưu câu này
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
