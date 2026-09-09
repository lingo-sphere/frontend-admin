// Thẻ hiển thị bài nộp Speaking hoặc Writing của học viên.
import {
  BookOpen,
  Sparkles,
  Volume2,
  FileText,
  Bot,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Clock,
  Headphones,
} from 'lucide-react'
import type { SkillSubmissionItem } from '@/services/progress.service'
import { resolveMediaUrl } from '@/utils/media.utils'

interface LearnerSubmissionCardProps {
  sub: SkillSubmissionItem
  onOpenReview: (submission: SkillSubmissionItem) => void
  isVi?: boolean
}

export function LearnerSubmissionCard({
  sub,
  onOpenReview,
  isVi = true,
}: LearnerSubmissionCardProps) {
  const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                sub.skill === 'SPEAKING'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {sub.skill === 'SPEAKING' ? <Volume2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {sub.user_name || 'Học viên'}
              </h4>
              <p className="text-xs text-slate-400">{sub.user_email || 'Email chưa cập nhật'}</p>
            </div>
          </div>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isReviewed
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
              }`}
            >
              {isReviewed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>{isVi ? 'Đã duyệt' : 'Reviewed'}</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{isVi ? 'Chờ chấm' : 'Pending'}</span>
                </>
              )}
            </span>
        </div>

        {sub.course_title && (
          <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate">{sub.course_title}</span>
          </div>
        )}

        {sub.skill === 'SPEAKING' && sub.audio_url && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Bản ghi âm học viên:' : 'Learner Audio:'}</span>
              </span>
              <a
                href={resolveMediaUrl(sub.audio_url)}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                {isVi ? 'Tải về' : 'Download'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <audio
              controls
              className="w-full h-8"
              src={resolveMediaUrl(sub.audio_url)}
              preload="metadata"
            />
          </div>
        )}

        {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-500" /> {isVi ? 'Bóc tách Whisper AI:' : 'Whisper AI Transcript:'}
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic font-mono text-xs leading-relaxed">
              &ldquo;{sub.whisper_transcript}&rdquo;
            </p>
          </div>
        )}

        {sub.skill === 'WRITING' && sub.essay_text && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">
              {isVi ? 'Bài viết luận của học viên:' : 'Learner Essay:'}
            </div>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-3">
              {sub.essay_text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {isVi ? 'Điểm AI:' : 'AI Score:'}
              </span>
              <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                {sub.ai_score}/100
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {isVi ? 'Giáo Viên:' : 'Teacher:'}
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                {sub.teacher_score !== undefined ? `${sub.teacher_score}/100` : (isVi ? 'Chưa duyệt' : 'Pending')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : 'Mới nộp'}
        </span>
        <button
          type="button"
          onClick={() => onOpenReview(sub)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isReviewed ? (isVi ? 'Sửa điểm' : 'Edit Review') : (isVi ? 'Chấm bài' : 'Grade')}</span>
        </button>
      </div>
    </div>
  )
}
