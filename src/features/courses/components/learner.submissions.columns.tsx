// Định nghĩa các cột hiển thị bảng bài nộp kỹ năng Speaking và Writing của học viên.

import {
  BookOpen,
  Sparkles,
  Volume2,
  FileText,
  Edit3,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { DataTableColumn } from '@/components/data.table'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'

interface CreateLearnerSubmissionsColumnsParams {
  isVi: boolean
  onOpenReview: (submission: SkillSubmissionItem) => void
}

export function createLearnerSubmissionsColumns({
  isVi,
  onOpenReview,
}: CreateLearnerSubmissionsColumnsParams): DataTableColumn<SkillSubmissionItem>[] {
  return [
    {
      key: 'student',
      title: isVi ? 'Học Viên' : 'Student',
      sortable: true,
      render: (sub) => (
        <div className="space-y-0.5 min-w-[150px]">
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
            {sub.user_name}
          </div>
          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
            {sub.user_email}
          </div>
          <div className="text-[10px] text-slate-400">
            {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : 'Mới nộp'}
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      title: isVi ? 'Khóa Học' : 'Course',
      sortable: true,
      render: (sub) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate max-w-[160px]">{sub.course_title || 'Khóa học'}</span>
        </span>
      ),
    },
    {
      key: 'skill_content',
      title: isVi ? 'Kỹ Năng & Bài Làm' : 'Skill & Submission Content',
      render: (sub) => (
        <div className="space-y-1.5 max-w-md">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              sub.skill === 'SPEAKING'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
            }`}
          >
            {sub.skill === 'SPEAKING' ? <Volume2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
            <span>{sub.skill === 'SPEAKING' ? 'Speaking' : 'Writing'}</span>
          </span>

          {sub.skill === 'SPEAKING' && sub.audio_url && (
            <audio
              controls
              className="w-full h-7 mt-1"
              src={resolveMediaUrl(sub.audio_url)}
              preload="metadata"
            />
          )}

          {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
            <p className="text-slate-600 dark:text-slate-400 italic text-xs line-clamp-2">
              &ldquo;{sub.whisper_transcript}&rdquo;
            </p>
          )}

          {sub.skill === 'WRITING' && sub.essay_text && (
            <p className="text-slate-700 dark:text-slate-300 text-xs line-clamp-2 font-mono">
              {sub.essay_text}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'ai_score',
      title: isVi ? 'Điểm AI' : 'AI Score',
      align: 'center',
      sortable: true,
      render: (sub) => (
        <div className="space-y-0.5 text-center whitespace-nowrap">
          <span className="inline-flex items-center gap-1 font-black text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
            <Sparkles className="w-3 h-3" />
            {sub.ai_score}/100
          </span>
        </div>
      ),
    },
    {
      key: 'teacher_score',
      title: isVi ? 'Điểm Giáo Viên' : 'Teacher Score',
      align: 'center',
      sortable: true,
      render: (sub) =>
        sub.teacher_score !== undefined ? (
          <span className="inline-block font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
            {sub.teacher_score}/100
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic whitespace-nowrap">
            {isVi ? 'Chưa duyệt' : 'Pending'}
          </span>
        ),
    },
    {
      key: 'review_status',
      title: isVi ? 'Trạng Thái' : 'Status',
      align: 'center',
      render: (sub) => {
        const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
        return (
          <span
            className={`inline-flex items-center gap-1 justify-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
              isReviewed
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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
        )
      },
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Action',
      align: 'right',
      render: (sub) => {
        const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
        return (
          <button
            type="button"
            onClick={() => onOpenReview(sub)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap ml-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isReviewed ? (isVi ? 'Sửa điểm' : 'Edit') : (isVi ? 'Chấm bài' : 'Grade')}</span>
          </button>
        )
      },
    },
  ]
}
