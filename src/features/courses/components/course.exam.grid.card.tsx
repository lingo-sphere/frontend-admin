// Card hiển thị bài thi dạng lưới (Grid View) chuẩn phong cách SaaS cao cấp.

import { BookOpen, Clock, Edit3, Trash2, Sparkles, Layers, Check, AlertCircle } from 'lucide-react'
import { Popconfirm } from '@/components/popconfirm'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'

export const getExamTypeBadge = (type?: string, exam?: ToeicExamItem) => {
  if (exam?.is_system_placement || type === 'DIAGNOSTIC_TEST') {
    const is4Skills = exam?.placement_type === '4SKILLS' || exam?.skills_enabled === 'ALL'
    return {
      label: is4Skills ? 'Đầu vào Hệ thống (4 Kỹ năng)' : 'Đầu vào Hệ thống (2 Kỹ năng)',
      color: is4Skills
        ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
        : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
    }
  }
  if (type === 'FULL_TEST') {
    return {
      label: 'Thi Tốt Nghiệp',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    }
  }
  return {
    label: 'Thử Thách Chương',
    color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
  }
}

interface CourseExamGridCardProps {
  exam: ToeicExamItem
  isVi: boolean
  onOpenEdit: (exam: ToeicExamItem) => void
  onTogglePublish?: (exam: ToeicExamItem) => void
  onDelete: (examId?: string) => void
}

export function CourseExamGridCard({
  exam,
  isVi,
  onOpenEdit,
  onTogglePublish,
  onDelete,
}: CourseExamGridCardProps) {
  const badge = getExamTypeBadge(exam.type, exam)
  const examId = exam._id || exam.id || ''

  const isPlacement = Boolean(
    exam.is_system_placement || exam.type === 'DIAGNOSTIC_TEST' || !exam.course_id
  )
  const qCount =
    Array.isArray(exam.questions) && exam.questions.length > 0
      ? exam.questions.length
      : exam.total_questions || 0

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group p-5">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}
          >
            {isPlacement && <Sparkles className="w-3 h-3 shrink-0" />}
            <span>{badge.label}</span>
          </span>

          {onTogglePublish ? (
            <button
              type="button"
              onClick={() => onTogglePublish(exam)}
              title={isVi ? 'Nhấp để đổi trạng thái xuất bản' : 'Toggle publish status'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                exam.is_published
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {exam.is_published ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{isVi ? 'Đã xuất bản' : 'Published'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                  <span>{isVi ? 'Bản nháp' : 'Draft'}</span>
                </>
              )}
            </button>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                exam.is_published
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {exam.is_published ? (isVi ? 'Đã xuất bản' : 'Published') : isVi ? 'Bản nháp' : 'Draft'}
            </span>
          )}
        </div>

        <div>
          <h4
            onClick={() => onOpenEdit(exam)}
            className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2 cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          >
            {exam.title}
          </h4>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            {isPlacement ? (
              <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Toàn Hệ Thống</span>
              </div>
            ) : exam.course_title ? (
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[200px]">{exam.course_title}</span>
              </div>
            ) : null}

            {exam.module_title && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{exam.module_title}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              {isVi ? 'Thời lượng' : 'Duration'}
            </span>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{exam.duration_minutes || 30}p</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              {isVi ? 'Số câu hỏi' : 'Questions'}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {qCount} câu
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              {isVi ? 'Tiêu chí' : 'Passing'}
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5 block truncate">
              {isPlacement ? 'Baseline' : `≥ ${exam.passing_score ?? 70}%`}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
            {isVi ? 'Lượt thi:' : 'Attempts:'}{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-bold">{exam.total_attempts || 0}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
            {isVi ? 'Điểm TB:' : 'Avg:'}{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{exam.avg_score || 0}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenEdit(exam)}
            title={isVi ? 'Chỉnh sửa cấu hình & câu hỏi đề thi' : 'Edit Exam'}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            <span>{isVi ? 'Chỉnh sửa' : 'Edit'}</span>
          </button>

          <Popconfirm
            title={isVi ? 'Xóa bài thi này?' : 'Delete this exam?'}
            description={
              isVi
                ? 'Bạn có chắc chắn muốn xóa bài thi này khỏi hệ thống?'
                : 'Are you sure you want to delete this exam?'
            }
            onConfirm={() => onDelete(examId)}
          >
            <button
              type="button"
              title={isVi ? 'Xóa bài thi' : 'Delete Exam'}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  )
}
