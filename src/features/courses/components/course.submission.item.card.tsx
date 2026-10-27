/**
 * @file course.submission.item.card.tsx
 * @description Card hiển thị chi tiết một bài nộp Speaking hoặc Writing của học viên trong danh sách bài nộp
 */

import { Volume2, FileText, Sparkles, User, Edit3, Bot, Headphones } from 'lucide-react'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'

interface CourseSubmissionItemCardProps {
  submission: SkillSubmissionItem
  onOpenReview: (submission: SkillSubmissionItem) => void
}

export function CourseSubmissionItemCard({
  submission,
  onOpenReview,
}: CourseSubmissionItemCardProps) {
  const isSpeaking = submission.skill === 'SPEAKING'
  const isReviewed = submission.status === 'TEACHER_REVIEWED'

  return (
    <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
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
                {submission.user_name}
              </span>
              {submission.user_email && (
                <span className="text-[11px] text-slate-400">
                  ({submission.user_email})
                </span>
              )}
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
              Nộp lúc:{' '}
              {submission.created_at
                ? new Date(submission.created_at).toLocaleString('vi-VN')
                : 'Vừa xong'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[11px] font-semibold text-slate-500">Điểm chốt:</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {submission.final_score}/100
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
            onClick={() => onOpenReview(submission)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Chấm / Sửa Điểm</span>
          </button>
        </div>
      </div>

      {isSpeaking && submission.audio_url && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <Headphones className="h-3.5 w-3.5 text-indigo-500" />
            <span>Bản ghi âm giọng nói của học viên:</span>
          </div>
          <audio
            controls
            src={resolveMediaUrl(submission.audio_url)}
            className="w-full h-8"
            preload="none"
          />
        </div>
      )}

      {isSpeaking && submission.whisper_transcript && (
        <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Bot className="h-3.5 w-3.5" /> Whisper STT bóc tách văn bản:
          </span>
          <p className="text-slate-700 dark:text-slate-300 italic">
            &ldquo;{submission.whisper_transcript}&rdquo;
          </p>
        </div>
      )}

      {!isSpeaking && submission.essay_text && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Bài viết của học viên ({submission.essay_text.trim().split(/\s+/).length} từ):
          </span>
          <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
            {submission.essay_text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/50 text-purple-900 dark:text-purple-200 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Đánh giá của AI:
            </span>
            <span>{submission.ai_score}/100</span>
          </div>
          <p className="opacity-90 text-[10px] line-clamp-2">
            {submission.ai_feedback?.detailed_comment}
          </p>
        </div>

        {submission.teacher_feedback && (
          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-emerald-600" /> Lời phê của{' '}
                {submission.teacher_name || 'Giáo viên'}:
              </span>
              <span>{submission.teacher_score}/100</span>
            </div>
            <p className="opacity-90 text-[10px] line-clamp-2">
              {submission.teacher_feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
