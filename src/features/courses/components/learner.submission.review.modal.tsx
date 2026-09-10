// Modal chấm điểm bài nộp Speaking và Writing của học viên.

import { useState, useEffect } from 'react'
import {
  Volume2,
  FileText,
  Bot,
  Sparkles,
  Edit3,
  Save,
  X,
  ExternalLink,
  Headphones,
  PenLine,
  MessageSquare,
  Lightbulb,
} from 'lucide-react'
import { NumberInput } from '@/components/number.input'
import { progressService, type SkillSubmissionItem } from '@/features/progress/services/progress.service'
import { toast } from '@/store/toast.store'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'

interface LearnerSubmissionReviewModalProps {
  submission: SkillSubmissionItem | null
  onClose: () => void
  onSuccess: () => void
}

export function LearnerSubmissionReviewModal({
  submission,
  onClose,
  onSuccess,
}: LearnerSubmissionReviewModalProps) {
  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    if (submission) {
      setEditScore(submission.teacher_score !== undefined ? submission.teacher_score : submission.ai_score)
      setEditFeedback(submission.teacher_feedback || '')
    }
  }, [submission])

  if (!submission) return null

  const handleSaveReview = async (overrideScore?: number) => {
    const scoreToSave = overrideScore !== undefined ? overrideScore : editScore
    setIsSubmitting(true)
    try {
      await progressService.reviewSubmission(submission._id, {
        teacher_score: scoreToSave,
        teacher_feedback: editFeedback || 'Giáo viên đã xác nhận và chuẩn hóa điểm số bài nộp.',
      })
      toast.success(`Đã cập nhật điểm thành công: ${scoreToSave}/100!`)
      onSuccess()
      onClose()
    } catch {
      toast.error('Lỗi khi lưu điểm đánh giá của giáo viên.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                submission.skill === 'SPEAKING'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {submission.skill === 'SPEAKING' ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {submission.skill === 'SPEAKING'
                  ? 'Chấm Điểm & Đánh Giá Bài Nói (Speaking)'
                  : 'Chấm Điểm & Đánh Giá Bài Luận (Writing)'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>
                  Học viên: <strong className="text-slate-700 dark:text-slate-200">{submission.user_name}</strong>
                </span>
                {submission.course_title && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    • {submission.course_title}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              {submission.skill === 'SPEAKING' ? (
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
            <span className="text-[11px] text-slate-400">
              {submission.created_at
                ? new Date(submission.created_at).toLocaleString('vi-VN')
                : 'Gần đây'}
            </span>
          </div>

          {submission.skill === 'SPEAKING' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              {submission.audio_url ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Bản ghi âm bài nói:</span>
                    </span>
                    <a
                      href={resolveMediaUrl(submission.audio_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Tải audio gốc <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <audio
                    controls
                    className="w-full h-9 rounded-lg"
                    src={resolveMediaUrl(submission.audio_url)}
                    preload="metadata"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Không tìm thấy tệp ghi âm.</p>
              )}

              {submission.whisper_transcript ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>Bản bóc tách văn bản từ giọng nói (Whisper STT):</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 italic font-mono text-xs leading-relaxed">
                    &ldquo;{submission.whisper_transcript}&rdquo;
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Chưa có bản bóc tách Whisper.</p>
              )}
            </div>
          )}

          {submission.skill === 'WRITING' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5 text-teal-600" />
                  <span>Toàn văn bài luận:</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {submission.essay_text?.trim().split(/\s+/).filter(Boolean).length || 0} từ
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {submission.essay_text || 'Chưa có nội dung bài viết.'}
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
                  {submission.ai_score}/100
                </span>
              </div>

              <button
                type="button"
                onClick={() => setEditScore(submission.ai_score)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 cursor-pointer shadow-2xs"
              >
                Áp dụng điểm AI ({submission.ai_score})
              </button>
            </div>

            
            {submission.ai_feedback && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {submission.skill === 'SPEAKING' && (
                  <>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Phát âm</span>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                        {submission.ai_feedback.pronunciation_score ?? submission.ai_score}/100
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">Lưu loát</span>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                        {submission.ai_feedback.fluency_score ?? submission.ai_score}/100
                      </span>
                    </div>
                  </>
                )}

                {submission.skill === 'WRITING' && (
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Ngữ pháp</span>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                      {submission.ai_feedback.grammar_score ?? submission.ai_score}/100
                    </span>
                  </div>
                )}

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Từ vựng</span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    {submission.ai_feedback.vocabulary_score ?? submission.ai_score}/100
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Độ chính xác</span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    {submission.ai_score}/100
                  </span>
                </div>
              </div>
            )}

            
            {submission.ai_feedback?.detailed_comment && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nhận xét chi tiết của AI:</span>
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {submission.ai_feedback.detailed_comment}
                </p>
              </div>
            )}

            
            {Array.isArray(submission.ai_feedback?.improvement_tips) &&
              submission.ai_feedback.improvement_tips.length > 0 && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                    <span>Gợi ý cải thiện:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {submission.ai_feedback.improvement_tips.map((tip, tIdx) => (
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
                <NumberInput
                  min={0}
                  max={100}
                  fallbackValue={0}
                  value={editScore}
                  onChange={setEditScore}
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

        
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSaveReview()}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu điểm & Gửi học viên'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
