// Định nghĩa các cột hiển thị bảng bài nộp kỹ năng Speaking và Writing của học viên.

import {
  BookOpen,
  Sparkles,
  Volume2,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { DataTableColumn } from '@/components/data.table'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'
import { TableRowActions, renderTableDate } from '@/components/table.row.actions'

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
      minWidth: 160,
      render: (sub) => (
        <div className="space-y-0.5 min-w-0 w-full">
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate" title={sub.user_name || sub.user_email || sub.user_id}>
            {sub.user_name || sub.user_email || sub.user_id}
          </div>
          <div className="text-[11px] text-slate-400 truncate w-full" title={sub.user_email || undefined}>
            {sub.user_email}
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      title: isVi ? 'Khóa Học' : 'Course',
      sortable: true,
      minWidth: 170,
      render: (sub) => (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 max-w-full min-w-0"
          title={sub.course_title || 'Khóa học'}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="truncate min-w-0">{sub.course_title || 'Khóa học'}</span>
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
              preload="none"
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
      width: '120px',
      align: 'center',
      sortable: true,
      render: (sub) => (
        <div className="space-y-0.5 text-center whitespace-nowrap">
          <span className="inline-flex items-center gap-1 font-black text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
            <Sparkles className="w-3 h-3" />
            {sub.ai_score == null ? (isVi ? 'Chưa có điểm' : 'Not graded') : `${sub.ai_score}/100`}
          </span>
        </div>
      ),
    },
    {
      key: 'teacher_score',
      title: isVi ? 'Điểm Giáo Viên' : 'Teacher Score',
      width: '150px',
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
      width: '130px',
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
      key: 'created_at',
      title: isVi ? 'Thời Gian Nộp' : 'Submitted At',
      align: 'center',
      width: '160px',
      sortable: true,
      render: (sub) => renderTableDate(sub.created_at),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Action',
      width: '100px',
      align: 'center',
      render: (sub) => {
        const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
        return (
          <TableRowActions
            onEdit={() => onOpenReview(sub)}
            editTitle={isReviewed ? (isVi ? 'Sửa điểm' : 'Edit') : (isVi ? 'Chấm bài' : 'Grade')}
          />
        )
      },
    },
  ]
}
