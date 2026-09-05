/**
 * @file course.exam.table.columns.tsx
 * @description Định nghĩa các cột hiển thị cho DataTable quản lý bài thi
 */

import { BookOpen, Clock, AlertCircle, Check, HelpCircle, Edit3, Trash2, Sparkles } from 'lucide-react'
import type { DataTableColumn } from '@/components/common/data.table'
import { Popconfirm } from '@/components/common/popconfirm'
import type { ToeicExamItem } from '@/services/exam.service'
import { getExamTypeBadge } from './course.exam.grid.card'

interface GetCourseExamColumnsProps {
  isVi: boolean
  onTogglePublish: (exam: ToeicExamItem) => void
  onOpenEdit: (exam: ToeicExamItem) => void
  onManageQuestions: (exam: ToeicExamItem) => void
  onDelete: (examId?: string) => void
}

export function getCourseExamColumns({
  isVi,
  onTogglePublish,
  onOpenEdit,
  onManageQuestions,
  onDelete,
}: GetCourseExamColumnsProps): DataTableColumn<ToeicExamItem>[] {
  return [
    {
      key: 'exam_info',
      title: isVi ? 'Tên Bài Thi & Đánh Giá' : 'Exam Title & Details',
      sortable: true,
      render: (exam) => {
        const examId = exam.id || exam._id || ''
        return (
          <div className="space-y-1">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
              {exam.title}
            </div>
            {exam.module_title && (
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-sm">
                {exam.module_title}
              </div>
            )}
            <div className="text-[10px] text-slate-400">
              Mã: <span className="font-mono">{examId}</span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'course',
      title: isVi ? 'Khóa Học Áp Dụng' : 'Applied Course',
      sortable: true,
      render: (exam) =>
        exam.is_system_placement || exam.type === 'DIAGNOSTIC_TEST' || (!exam.course_id && !exam.course_title) ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span>Toàn Hệ Thống ({exam.skills_enabled === 'ALL' || exam.placement_type === '4SKILLS' ? '4 Kỹ năng' : '2 Kỹ năng'})</span>
          </span>
        ) : exam.course_title ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[180px]">{exam.course_title}</span>
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic whitespace-nowrap">Toàn hệ thống</span>
        ),
    },
    {
      key: 'type',
      title: isVi ? 'Loại Bài Thi' : 'Exam Type',
      render: (exam) => {
        const badge = getExamTypeBadge(exam.type, exam)
        return (
          <span
            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${badge.color}`}
          >
            {badge.label}
          </span>
        )
      },
    },
    {
      key: 'duration',
      title: isVi ? 'Thời Lượng' : 'Duration',
      align: 'center',
      sortable: true,
      render: (exam) => (
        <span className="inline-flex items-center justify-center gap-1 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {exam.duration_minutes || 30}p
        </span>
      ),
    },
    {
      key: 'questions',
      title: isVi ? 'Số Câu / Đánh Giá' : 'Questions / Evaluation',
      align: 'center',
      sortable: true,
      render: (exam) => {
        const isPlacement = Boolean(
          exam.is_system_placement ||
          exam.type === 'DIAGNOSTIC_TEST' ||
          !exam.course_id
        )
        const qCount = Array.isArray(exam.questions) ? exam.questions.length : (exam.total_questions || 0)
        const isZero = qCount === 0
        return (
          <div className="space-y-0.5 whitespace-nowrap text-center">
            {isZero ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>0 câu</span>
              </span>
            ) : (
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block whitespace-nowrap">
                {qCount} câu
              </span>
            )}
            {isPlacement ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/80 inline-block whitespace-nowrap">
                {isVi ? 'Đánh giá Baseline' : 'Baseline Score'}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                Đạt: ≥ {exam.passing_score ?? 70}%
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'attempts',
      title: isVi ? 'Lượt Thi' : 'Attempts',
      align: 'center',
      sortable: true,
      render: (exam) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
          {exam.total_attempts || 0}
        </span>
      ),
    },
    {
      key: 'score',
      title: isVi ? 'Điểm TB' : 'Avg Score',
      align: 'center',
      sortable: true,
      render: (exam) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          {exam.avg_score || 0}
        </span>
      ),
    },
    {
      key: 'status',
      title: isVi ? 'Trạng Thái' : 'Status',
      align: 'center',
      render: (exam) => (
        <button
          type="button"
          onClick={() => onTogglePublish(exam)}
          title={isVi ? 'Nhấp để đổi trạng thái xuất bản' : 'Click to toggle publish status'}
          className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            exam.is_published
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
          }`}
        >
          {exam.is_published ? (
            <>
              <Check className="w-3 h-3" />
              <span>{isVi ? 'Đã xuất bản' : 'Published'}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              <span>{isVi ? 'Bản nháp' : 'Draft'}</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Actions',
      align: 'right',
      render: (exam) => {
        const examId = exam.id || exam._id || ''
        return (
          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => onManageQuestions(exam)}
              title={isVi ? 'Soạn / Quản lý câu hỏi đề thi' : 'Manage Question Bank'}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden xl:inline">{isVi ? 'Soạn câu hỏi' : 'Questions'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenEdit(exam)}
              title={isVi ? 'Chỉnh sửa thông tin bài thi' : 'Edit Exam'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <Popconfirm
              title={isVi ? 'Xóa bài thi này?' : 'Delete this exam?'}
              description={isVi ? 'Bạn có chắc chắn muốn xóa bài thi này khỏi hệ thống?' : 'Are you sure you want to delete this exam?'}
              onConfirm={() => onDelete(examId)}
            >
              <button
                type="button"
                title={isVi ? 'Xóa bài thi' : 'Delete exam'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Popconfirm>
          </div>
        )
      },
    },
  ]
}
