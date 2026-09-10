// Hiển thị danh sách các bài nộp kỹ năng Nói và Viết của học viên kèm điểm số và gỡ băng âm thanh.

import { FileCheck2, Volume2, FileText, Edit3 } from 'lucide-react'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'

interface LearnerSubmissionsListProps {
  submissions: SkillSubmissionItem[]
  onOpenReview: (sub: SkillSubmissionItem) => void
}

export function LearnerSubmissionsList({
  submissions,
  onOpenReview,
}: LearnerSubmissionsListProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-indigo-500" />
          <span>Bài nộp kỹ năng Nói & Viết ({submissions.length})</span>
        </h3>
      </div>

      {submissions.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-6 text-center">
          Học viên chưa có bài nộp bài tập nói Speaking hoặc viết Writing nào trong khóa học này.
        </p>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const isSpeaking = sub.skill === 'SPEAKING'
            const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'

            return (
              <div
                key={sub._id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-3"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isSpeaking
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Speaking' : 'Writing'}</span>
                    </span>

                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Điểm AI: <span className="text-purple-600 dark:text-purple-400">{sub.ai_score}đ</span>
                      {sub.teacher_score !== undefined && (
                        <span className="text-emerald-600 dark:text-emerald-400 ml-1.5">
                          • Giáo viên: {sub.teacher_score}đ
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenReview(sub)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isReviewed ? 'Sửa điểm' : 'Chấm điểm'}</span>
                  </button>
                </div>

                {isSpeaking && sub.audio_url && (
                  <audio
                    controls
                    className="w-full h-8"
                    src={resolveMediaUrl(sub.audio_url)}
                    preload="metadata"
                  />
                )}

                {isSpeaking && sub.whisper_transcript && (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Gỡ băng giọng nói (Whisper STT):</span>
                    &ldquo;{sub.whisper_transcript}&rdquo;
                  </div>
                )}

                {!isSpeaking && sub.essay_text && (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Bài viết luận:</span>
                    {sub.essay_text}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
