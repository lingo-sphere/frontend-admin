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
import { resolveMediaUrl } from '@/utils/media.utils'

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
                        <audio
                          controls
                          src={resolveMediaUrl(sub.audio_url)}
                          className="w-full h-8"
                          preload="metadata"
                        />
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
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedSubmission(null)
            }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 dark:bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
          >
            <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 space-y-5 ring-1 ring-black/5 dark:ring-white/10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedSubmission.skill === 'SPEAKING'
                        ? 'Chấm Điểm & Đánh Giá Bài Nói (Speaking)'
                        : 'Chấm Điểm & Đánh Giá Bài Luận (Writing)'}
                    </h3>
                    <div className="text-xs text-slate-400">
                      Học viên: <strong className="text-slate-700 dark:text-slate-200">{selectedSubmission.user_name}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  {selectedSubmission.skill === 'SPEAKING' ? (
                    <>
                      <Volume2 className="w-4 h-4 text-indigo-500" />
                      <span>1. Nội dung bài nói của học viên</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>1. Nội dung bài viết của học viên</span>
                    </>
                  )}
                </span>

                {selectedSubmission.skill === 'SPEAKING' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                    {selectedSubmission.audio_url ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span>🎧 Bản ghi âm bài nói:</span>
                        </div>
                        <audio
                          controls
                          className="w-full h-9 rounded-lg"
                          src={resolveMediaUrl(selectedSubmission.audio_url)}
                          preload="metadata"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Không tìm thấy tệp ghi âm.</p>
                    )}

                    {selectedSubmission.whisper_transcript ? (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                          <Bot className="w-4 h-4" />
                          <span>Bản bóc tách Whisper STT:</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 italic font-mono text-xs leading-relaxed">
                          &ldquo;{selectedSubmission.whisper_transcript}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có bản bóc tách Whisper.</p>
                    )}
                  </div>
                )}

                {selectedSubmission.skill === 'WRITING' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>✍️ Toàn văn bài luận:</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {selectedSubmission.essay_text?.trim().split(/\s+/).filter(Boolean).length || 0} từ
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {selectedSubmission.essay_text || 'Chưa có nội dung bài viết.'}
                    </div>
                  </div>
                )}
              </div>

              
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>2. Kết quả phân tích & Chấm điểm từ AI</span>
                </span>

                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                        Điểm AI đề xuất:
                      </span>
                      <span className="text-base font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-3 py-1 rounded-xl">
                        {selectedSubmission.ai_score}/100
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditScore(selectedSubmission.ai_score)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 cursor-pointer shadow-2xs"
                    >
                      Áp dụng điểm AI ({selectedSubmission.ai_score})
                    </button>
                  </div>

                  {selectedSubmission.ai_feedback?.detailed_comment && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                      <span className="font-bold text-purple-900 dark:text-purple-200 block">
                        💬 Nhận xét chi tiết của AI:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedSubmission.ai_feedback.detailed_comment}
                      </p>
                    </div>
                  )}

                  {Array.isArray(selectedSubmission.ai_feedback?.improvement_tips) &&
                    selectedSubmission.ai_feedback.improvement_tips.length > 0 && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                        <span className="font-bold text-purple-900 dark:text-purple-200 block">
                          💡 Gợi ý cải thiện:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                          {selectedSubmission.ai_feedback.improvement_tips.map((tip, tIdx) => (
                            <li key={tIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-500" />
                  <span>3. Giáo viên Duyệt & Hiệu chỉnh điểm số</span>
                </span>

                <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Điểm chính thức của Giáo Viên (Thang 0 - 100):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editScore}
                        onChange={(e) => setEditScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-base font-black text-indigo-600 dark:text-indigo-400 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[+5, +10, -5, -10].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            onClick={() => setEditScore((prev) => Math.min(100, Math.max(0, prev + delta)))}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs transition-colors"
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Lời phê & Nhận xét của Giáo Viên gửi cho học viên:
                    </label>
                    <textarea
                      rows={3}
                      value={editFeedback}
                      onChange={(e) => setEditFeedback(e.target.value)}
                      placeholder="Nhập nhận xét chi tiết: khen ngợi điểm mạnh, chỉ rõ lỗi ngữ pháp/phát âm cụ thể và hướng dẫn bài tập rèn luyện thêm..."
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
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
