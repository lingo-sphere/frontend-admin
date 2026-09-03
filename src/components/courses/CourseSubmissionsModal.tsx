/**
 * @file CourseSubmissionsModal.tsx
 * @description Modal quản trị cho giáo viên xem lại các bài nộp kỹ năng Speaking, Writing của học viên, nghe bản thu âm, đọc bản bóc tách Whisper STT, kiểm tra điểm AI và duyệt hoặc chỉnh sửa lại điểm cho học viên
 */

import { useState, useEffect, useCallback } from 'react'
import {
  X,
  Volume2,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Edit3,
  Bot,
  Save,
  RotateCcw,
  Headphones,
  FileCheck2,
} from 'lucide-react'
import { progressService, type SkillSubmissionItem } from '@/services/progress.service'
import { toast } from '@/store/toast-store'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
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
                Khóa học: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
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
                {s === 'ALL' ? 'Tất cả bài nộp' : s === 'SPEAKING' ? '🎙️ Speaking (Nói)' : '✍️ Writing (Viết)'}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tổng số: <strong className="text-slate-800 dark:text-slate-200">{filteredList.length}</strong> bài nộp
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
                Khi học viên làm bài thi Speaking thu âm giọng nói hoặc nộp bài luận Writing, dữ liệu sẽ xuất hiện tại đây để bạn nghe lại và điều chỉnh điểm.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredList.map((sub) => {
                const isSpeaking = sub.skill === 'SPEAKING'
                const isReviewed = sub.status === 'TEACHER_REVIEWED'

                return (
                  <div
                    key={sub._id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-xs space-y-3 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                            isSpeaking
                              ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                              : 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                          }`}
                        >
                          {isSpeaking ? <Volume2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {sub.user_name || 'Học viên'}
                            </span>
                            <span className="text-[11px] text-slate-400">({sub.user_email || 'Chưa có email'})</span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                isSpeaking
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                              }`}
                            >
                              {isSpeaking ? 'Speaking' : 'Writing'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Nộp lúc: {sub.created_at ? new Date(sub.created_at).toLocaleString('vi-VN') : 'Vừa xong'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[11px] font-semibold text-slate-500">Điểm chốt:</span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                              {sub.final_score}/100
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                              isReviewed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {isReviewed ? '✓ Giáo viên đã duyệt' : '🤖 AI đã chấm'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenReview(sub)}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Chấm / Sửa Điểm</span>
                        </button>
                      </div>
                    </div>

                    {isSpeaking && sub.audio_url && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          <Headphones className="h-3.5 w-3.5 text-indigo-500" />
                          <span>Bản ghi âm giọng nói của học viên:</span>
                        </div>
                        <audio controls src={sub.audio_url} className="w-full h-8" />
                      </div>
                    )}

                    {isSpeaking && sub.whisper_transcript && (
                      <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Bot className="h-3.5 w-3.5" /> Whisper STT bóc tách văn bản:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 italic">
                          &ldquo;{sub.whisper_transcript}&rdquo;
                        </p>
                      </div>
                    )}

                    {!isSpeaking && sub.essay_text && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Bài viết của học viên ({sub.essay_text.trim().split(/\s+/).length} từ):
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                          {sub.essay_text}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/50 text-purple-900 dark:text-purple-200 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Đánh giá của AI:
                          </span>
                          <span>{sub.ai_score}/100</span>
                        </div>
                        <p className="opacity-90 text-[10px] line-clamp-2">
                          {sub.ai_feedback?.detailed_comment}
                        </p>
                      </div>

                      {sub.teacher_feedback && (
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 text-emerald-900 dark:text-emerald-200 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-emerald-600" /> Lời phê của {sub.teacher_name || 'Giáo viên'}:
                            </span>
                            <span>{sub.teacher_score}/100</span>
                          </div>
                          <p className="opacity-90 text-[10px] line-clamp-2">{sub.teacher_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedSubmission && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-indigo-600" />
                  <span>Duyệt & Chỉnh Sửa Điểm Bài Nộp</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div><strong>Học viên:</strong> {selectedSubmission.user_name}</div>
                <div><strong>Kỹ năng:</strong> {selectedSubmission.skill}</div>
                <div><strong>Điểm AI chấm sơ bộ:</strong> {selectedSubmission.ai_score}/100</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Điểm của Giáo viên (Thang điểm 0 - 100):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editScore}
                  onChange={(e) => setEditScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lời nhận xét / Lời phê của Giáo viên:
                </label>
                <textarea
                  rows={3}
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  placeholder="Ghi nhận xét của bạn để gửi cho học viên..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveReview(selectedSubmission.ai_score)}
                  disabled={isSubmittingReview}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Duyệt điểm AI ({selectedSubmission.ai_score})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveReview()}
                    disabled={isSubmittingReview}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Lưu Điểm Mới</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
