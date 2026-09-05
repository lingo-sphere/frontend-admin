/**
 * @file course.exam.grid.card.tsx
 * @description Card hiển thị bài thi dạng lưới (Grid View)
 */

import { BookOpen, Edit3, HelpCircle, Trash2 } from 'lucide-react'
import { Popconfirm } from '@/components/common/popconfirm'
import type { ToeicExamItem } from '@/services/exam.service'

export const getExamTypeBadge = (type?: string, exam?: ToeicExamItem) => {
  if (exam?.is_system_placement || type === 'DIAGNOSTIC_TEST') {
    const is4Skills = exam?.placement_type === '4SKILLS' || exam?.skills_enabled === 'ALL'
    return {
      label: is4Skills ? 'Đầu vào Hệ thống (4 Kỹ năng)' : 'Đầu vào Hệ thống (2 Kỹ năng)',
      color: is4Skills
        ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800'
        : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
    }
  }
  if (type === 'FULL_TEST') {
    return {
      label: 'Final Test (Tốt nghiệp)',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    }
  }
  return {
    label: 'Challenge',
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
  }
}

interface CourseExamGridCardProps {
  exam: ToeicExamItem
  isVi: boolean
  onOpenEdit: (exam: ToeicExamItem) => void
  onManageQuestions: (exam: ToeicExamItem) => void
  onDelete: (examId?: string) => void
}

export function CourseExamGridCard({
  exam,
  isVi,
  onOpenEdit,
  onManageQuestions,
  onDelete,
}: CourseExamGridCardProps) {
  const badge = getExamTypeBadge(exam.type, exam)
  const examId = exam._id

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
            {badge.label}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              exam.is_published
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {exam.is_published ? 'Đã xuất bản' : 'Bản nháp'}
          </span>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2">
            {exam.title}
          </h4>
          {exam.course_title && (
            <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="truncate">{exam.course_title}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Thời lượng</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {exam.duration_minutes || 30}p
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Số câu</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {Array.isArray(exam.questions) ? exam.questions.length : exam.total_questions || 30}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Lượt thi</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {exam.total_attempts || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          Điểm TB: {exam.avg_score || 0}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onManageQuestions(exam)}
            title={isVi ? 'Soạn câu hỏi đề thi' : 'Manage Question Bank'}
            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenEdit(exam)}
            title={isVi ? 'Chỉnh sửa bài thi' : 'Edit Exam'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Xóa bài thi này?"
            description="Bạn có chắc chắn muốn xóa bài thi này?"
            onConfirm={() => onDelete(examId)}
          >
            <button
              type="button"
              title={isVi ? 'Xóa bài thi' : 'Delete Exam'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  )
}
