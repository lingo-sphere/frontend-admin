// Định nghĩa các cột hiển thị cho DataTable quản lý bài thi.
import { TableStatusSwitch } from '@/components/table.status.switch'
import { BookOpen, Clock, AlertCircle, Sparkles } from 'lucide-react'
import type { DataTableColumn } from '@/components/data.table'
import { TableTextCell } from '@/components/table.text.cell'
import { TableRowActions } from '@/components/table.row.actions'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { getExamTypeBadge } from '@/features/courses/components/course.exam.grid.card'

interface GetCourseExamColumnsProps {
  isVi: boolean
  onTogglePublish: (exam: ToeicExamItem) => void
  publishingExamId?: string | null
  onOpenEdit: (exam: ToeicExamItem) => void
  onDelete: (examId?: string) => void
}

export function getCourseExamColumns({
  isVi,
  onTogglePublish,
  publishingExamId,
  onOpenEdit,
  onDelete,
}: GetCourseExamColumnsProps): DataTableColumn<ToeicExamItem>[] {
  return [
    {
      key: 'exam_info',
      title: isVi ? 'Tên Bài Thi & Đánh Giá' : 'Exam Title & Details',
      width: '280px',
      minWidth: 240,
      sortable: true,
      render: (exam) => (
        <TableTextCell
          text={exam.title}
          className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm"
        />
      ),
    },
    {
      key: 'course',
      title: isVi ? 'Khóa Học Áp Dụng' : 'Applied Course',
      width: '190px',
      minWidth: 160,
      sortable: true,
      render: (exam) =>
        exam.is_system_placement || exam.type === 'DIAGNOSTIC_TEST' || (!exam.course_id && !exam.course_title) ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span>Toàn Hệ Thống ({exam.skills_enabled === 'ALL' || exam.placement_type === '4SKILLS' ? '4 Kỹ năng' : '2 Kỹ năng'})</span>
          </span>
        ) : exam.course_title ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 max-w-full min-w-0"
            title={exam.course_title}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate min-w-0">{exam.course_title}</span>
          </span>
        ) : (
          <span className="text-slate-400 text-xs italic whitespace-nowrap">Toàn hệ thống</span>
        ),
    },
    {
      key: 'type',
      title: isVi ? 'Loại Bài Thi' : 'Exam Type',
      width: '140px',
      minWidth: 125,
      align: 'center',
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
      width: '120px',
      minWidth: 95,
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
      width: '160px',
      minWidth: 150,
      align: 'center',
      sortable: true,
      render: (exam) => {
        const isPlacement = Boolean(
          exam.is_system_placement ||
          exam.type === 'DIAGNOSTIC_TEST' ||
          !exam.course_id
        )
        const qCount = Array.isArray(exam.questions) && exam.questions.length > 0 ? exam.questions.length : (exam.total_questions || 0)
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
      width: '105px',
      minWidth: 85,
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
      width: '105px',
      minWidth: 85,
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
      width: '120px',
      minWidth: 110,
      align: 'center',
      render: (exam) => {
        const isPublished = Boolean(exam.is_published)
        const isUpdating = publishingExamId === exam._id
        const isOtherUpdating = Boolean(publishingExamId && publishingExamId !== exam._id)

        return (
          <TableStatusSwitch
            checked={isPublished}
            loading={isUpdating}
            disabled={isOtherUpdating}
            checkedChildren="Bật"
            unCheckedChildren="Ẩn"
            ariaLabel={isPublished ? (isVi ? 'Đã xuất bản' : 'Published') : (isVi ? 'Bản nháp' : 'Draft')}
            onChange={() => onTogglePublish(exam)}
          />
        )
      },
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Actions',
      width: '110px',
      minWidth: 100,
      align: 'center',
      render: (exam) => {
        const examId = exam._id
        return (
          <TableRowActions
            onEdit={() => onOpenEdit(exam)}
            onDelete={examId ? () => onDelete(examId) : undefined}
            deleteTitle={isVi ? 'Xóa bài thi này?' : 'Delete this exam?'}
            deleteDescription={
              isVi
                ? 'Bạn có chắc chắn muốn xóa bài thi này khỏi hệ thống?'
                : 'Are you sure you want to delete this exam?'
            }
          />
        )
      },
    },
  ]
}
