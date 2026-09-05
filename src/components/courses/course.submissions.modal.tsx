/**
 * @file course.submissions.modal.tsx
 * @description Modal quản trị cho giáo viên xem lại các bài nộp kỹ năng Speaking, Writing của học viên, nghe bản thu âm, đọc bản bóc tách Whisper STT, kiểm tra điểm AI và duyệt hoặc chỉnh sửa lại điểm cho học viên
 */

import { useState, useEffect, useCallback } from 'react'
import { X, Headphones, FileCheck2 } from 'lucide-react'
import { progressService, type SkillSubmissionItem } from '@/services/progress.service'
import { toast } from '@/store/toast.store'
import { CourseSubmissionItemCard } from './course.submission.item.card'
import { CourseSubmissionReviewDialog } from './course.submission.review.dialog'

interface CourseSubmissionsModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
}

export function CourseSubmissionsModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}: CourseSubmissionsModalProps) {
  const [submissions, setSubmissions] = useState<SkillSubmissionItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filterSkill, setFilterSkill] = useState<'ALL' | 'SPEAKING' | 'WRITING'>('ALL')
  const [selectedSubmission, setSelectedSubmission] = useState<SkillSubmissionItem | null>(null)

  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  const fetchSubmissions = useCallback(async () => {
    if (!courseId) return
    setIsLoading(true)
    try {
      const data = await progressService.getCourseSubmissions(courseId)
      setSubmissions(data || [])
    } catch {
      toast.error('Không thể tải danh sách bài nộp của học viên.')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions()
    } else {
      setSelectedSubmission(null)
    }
  }, [isOpen, fetchSubmissions])

  if (!isOpen) return null

  const filteredList = submissions.filter((sub) => {
    if (filterSkill === 'ALL') return true
    return sub.skill === filterSkill
  })

  const handleOpenReview = (sub: SkillSubmissionItem) => {
    setSelectedSubmission(sub)
    setEditScore(sub.teacher_score !== undefined ? sub.teacher_score : sub.ai_score)
    setEditFeedback(sub.teacher_feedback || '')
  }

  const handleSaveReview = async (overrideScore?: number) => {
    if (!selectedSubmission) return
    const scoreToSave = overrideScore !== undefined ? overrideScore : editScore

    setIsSubmittingReview(true)
    try {
      await progressService.reviewSubmission(selectedSubmission._id, {
        teacher_score: scoreToSave,
        teacher_feedback: editFeedback || 'Giáo viên đã xác nhận và chuẩn hóa điểm số.',
      })
      toast.success(`Đã cập nhật điểm thành công: ${scoreToSave}/100!`)
      setSelectedSubmission(null)
      fetchSubmissions()
    } catch {
      toast.error('Lỗi khi lưu điểm đánh giá của giáo viên.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Phúc Khảo & Chấm Bài Nộp Kỹ Năng (Speaking & Writing)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khóa học:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {courseTitle}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            {(['ALL', 'SPEAKING', 'WRITING'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSkill(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterSkill === s
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {s === 'ALL'
                  ? 'Tất cả bài nộp'
                  : s === 'SPEAKING'
                    ? '🎙️ Speaking (Nói)'
                    : '✍️ Writing (Viết)'}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tổng số:{' '}
            <strong className="text-slate-800 dark:text-slate-200">{filteredList.length}</strong> bài
            nộp
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <span className="text-xs font-medium">Đang tải danh sách bài nộp...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-2">
              <Headphones className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Chưa có bài nộp nào từ học viên
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Khi học viên làm bài thi Speaking thu âm giọng nói hoặc nộp bài luận Writing, dữ liệu
                sẽ xuất hiện tại đây để bạn nghe lại và điều chỉnh điểm.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((sub) => (
                <CourseSubmissionItemCard
                  key={sub._id}
                  submission={sub}
                  onOpenReview={handleOpenReview}
                />
              ))}
            </div>
          )}
        </div>

        {selectedSubmission && (
          <CourseSubmissionReviewDialog
            submission={selectedSubmission}
            editScore={editScore}
            editFeedback={editFeedback}
            isSubmitting={isSubmittingReview}
            onScoreChange={setEditScore}
            onFeedbackChange={setEditFeedback}
            onClose={() => setSelectedSubmission(null)}
            onSaveReview={handleSaveReview}
          />
        )}
      </div>
    </div>
  )
}
