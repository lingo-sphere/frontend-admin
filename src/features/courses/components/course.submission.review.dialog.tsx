// Dialog chấm điểm và viết nhận xét phúc khảo bài nộp của học viên.

import { X, Volume2, FileText, Sparkles, CheckCircle2, Edit3, Bot, Save, Headphones, PenLine, MessageSquare, Lightbulb } from 'lucide-react'
import { NumberInput } from '@/components/number.input'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'

interface CourseSubmissionReviewDialogProps {
  submission: SkillSubmissionItem
  editScore: number
  editFeedback: string
  isSubmitting: boolean
  onScoreChange: (score: number) => void
  onFeedbackChange: (feedback: string) => void
  onClose: () => void
  onSaveReview: (overrideScore?: number) => void
}

export function CourseSubmissionReviewDialog({
  submission,
  editScore,
  editFeedback,
  isSubmitting,
  onScoreChange,
  onFeedbackChange,
  onClose,
  onSaveReview,
}: CourseSubmissionReviewDialogProps) {
  const isSpeaking = submission.skill === 'SPEAKING'

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 dark:bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 space-y-5 ring-1 ring-black/5 dark:ring-white/10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isSpeaking
                  ? 'Chấm Điểm & Đánh Giá Bài Nói (Speaking)'
                  : 'Chấm Điểm & Đánh Giá Bài Luận (Writing)'}
              </h3>
              <div className="text-xs text-slate-400">
                Học viên:{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {submission.user_name}
                </strong>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            {isSpeaking ? (
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

          {isSpeaking && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              {submission.audio_url ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Bản ghi âm bài nói:</span>
                    </span>
                  </div>
                  <audio
                    controls
                    className="w-full h-9 rounded-lg"
                    src={resolveMediaUrl(submission.audio_url)}
                    preload="none"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Không tìm thấy tệp ghi âm.</p>
              )}

              {submission.whisper_transcript ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>Bản bóc tách Whisper STT:</span>
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

          {!isSpeaking && (
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
                onClick={() => onScoreChange(submission.ai_score)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 cursor-pointer shadow-2xs"
              >
                Áp dụng điểm AI ({submission.ai_score})
              </button>
            </div>

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
                  onChange={onScoreChange}
                  className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-base font-black text-indigo-600 dark:text-indigo-400 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[+5, +10, -5, -10].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => onScoreChange(Math.min(100, Math.max(0, editScore + delta)))}
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
                onChange={(e) => onFeedbackChange(e.target.value)}
                placeholder="Nhập nhận xét chi tiết: khen ngợi điểm mạnh, chỉ rõ lỗi ngữ pháp/phát âm cụ thể và hướng dẫn bài tập rèn luyện thêm..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed shadow-2xs"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onSaveReview(submission.ai_score)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Duyệt điểm AI ({submission.ai_score})</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onSaveReview()}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Lưu Điểm Mới</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
