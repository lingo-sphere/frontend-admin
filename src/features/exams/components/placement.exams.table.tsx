// Bảng quản lý danh sách đề thi đầu vào chuẩn hóa theo thiết kế DataTable dùng chung.

import { useState, useMemo } from 'react'
import {
  Search,
  Headphones,
  Sparkles,
  Clock,
  FileText,
  Edit3,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Button, Switch, Tooltip } from 'antd'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { TableRowActions } from '@/components/table.row.actions'
import { CustomSelect, type SelectOption } from '@/components/custom.select'

interface PlacementExamsTableProps {
  exams: ToeicExamItem[]
  isVi: boolean
  onManageQuestions: (exam: ToeicExamItem) => void
  onTogglePublish: (exam: ToeicExamItem, nextStatus: boolean) => void
  onDeleteExam: (id: string) => Promise<void> | void
  onCreateExam: (type: '2SKILLS' | '4SKILLS') => void
  isMutatingPublish?: boolean
  active2SkillsExamId?: string
  active4SkillsExamId?: string
}

export function PlacementExamsTable({
  exams,
  isVi,
  onManageQuestions,
  onTogglePublish,
  onDeleteExam,
  isMutatingPublish = false,
  active2SkillsExamId,
  active4SkillsExamId,
}: PlacementExamsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const skillOptions: SelectOption[] = useMemo(
    () => [
      { value: 'ALL', label: isVi ? 'Tất cả kỹ năng' : 'All Skills' },
      { value: '2SKILLS', label: isVi ? '2 Kỹ Năng (Listening & Reading)' : '2 Skills (LR)' },
      { value: '4SKILLS', label: isVi ? '4 Kỹ Năng (Full Skills)' : '4 Skills (Full Skills)' },
    ],
    [isVi]
  )

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: 'ALL', label: isVi ? 'Tất cả trạng thái' : 'All Statuses' },
      { value: 'PUBLISHED', label: isVi ? 'Đang công khai (Public)' : 'Published' },
      { value: 'DRAFT', label: isVi ? 'Bản nháp / Chưa public' : 'Draft / Private' },
    ],
    [isVi]
  )

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const q = searchQuery.trim().toLowerCase()
      const titleMatches = (exam.title || '').toLowerCase().includes(q)
      const codeMatches = (exam.code || '').toLowerCase().includes(q)
      const idMatches = (exam._id || exam.id || '').toLowerCase().includes(q)
      const matchesSearch = !q || titleMatches || codeMatches || idMatches

      const isFour =
        exam.skills_enabled === 'ALL' ||
        exam.skills_enabled === 'LRWS' ||
        exam.placement_type === '4SKILLS' ||
        (Boolean(exam.title) && exam.title.includes('4 Kỹ Năng'))

      const matchesSkill =
        selectedSkill === 'ALL' ||
        (selectedSkill === '4SKILLS' && isFour) ||
        (selectedSkill === '2SKILLS' && !isFour)

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'PUBLISHED' && exam.is_published) ||
        (selectedStatus === 'DRAFT' && !exam.is_published)

      return matchesSearch && matchesSkill && matchesStatus
    })
  }, [exams, searchQuery, selectedSkill, selectedStatus])

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage, pageSize])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedSkill('ALL')
    setSelectedStatus('ALL')
    setCurrentPage(1)
  }

  const columns: DataTableColumn<ToeicExamItem>[] = useMemo(
    () => [
      {
        key: 'title',
        dataIndex: 'title',
        title: isVi ? 'Tên đề thi' : 'Exam Title',
        sortable: true,
        minWidth: 300,
        align: 'left',
        render: (exam) => {
          const examId = exam._id || exam.id || ''
          const isActiveOfficial =
            exam.is_published &&
            (examId === active2SkillsExamId || examId === active4SkillsExamId)

          return (
            <div className="flex items-center gap-2 min-w-0 w-full">
              <Tooltip title={exam.title} placement="topLeft">
                <button
                  type="button"
                  onClick={() => onManageQuestions(exam)}
                  className="font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-left cursor-pointer truncate flex-1 min-w-0"
                >
                  {exam.title}
                </button>
              </Tooltip>
              {isActiveOfficial && (
                <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  <span>{isVi ? 'Đang áp dụng' : 'Active Standard'}</span>
                </span>
              )}
            </div>
          )
        },
      },
      {
        key: 'skills',
        dataIndex: 'skills_enabled',
        title: isVi ? 'Kỹ năng' : 'Skills',
        sortable: true,
        width: 150,
        align: 'center',
        render: (exam) => {
          const isFourSkills =
            exam.skills_enabled === 'ALL' ||
            exam.skills_enabled === 'LRWS' ||
            exam.placement_type === '4SKILLS' ||
            (Boolean(exam.title) && exam.title.includes('4 Kỹ Năng'))

          return isFourSkills ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              <span>{isVi ? '4 Kỹ Năng (Full)' : '4 Skills (Full)'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
              <Headphones className="w-3 h-3" />
              <span>{isVi ? '2 Kỹ Năng (LR)' : '2 Skills (LR)'}</span>
            </span>
          )
        },
      },
      {
        key: 'config',
        title: isVi ? 'Cấu hình' : 'Config',
        width: 140,
        align: 'center',
        render: (exam) => {
          const qCount =
            Array.isArray(exam.questions) && exam.questions.length > 0
              ? exam.questions.length
              : exam.total_questions || 0

          return (
            <div className="space-y-1 text-slate-600 dark:text-slate-300 text-center">
              <div className="flex items-center justify-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{exam.duration_minutes || 0} {isVi ? 'phút' : 'mins'}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{qCount} {isVi ? 'câu hỏi' : 'questions'}</span>
              </div>
            </div>
          )
        },
      },
      {
        key: 'passing_score',
        dataIndex: 'passing_score',
        title: isVi ? 'Điểm chuẩn' : 'Passing Score',
        sortable: true,
        width: 130,
        align: 'center',
        render: (exam) => (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
            {exam.passing_score !== undefined && exam.passing_score !== null
              ? `${exam.passing_score} / 990`
              : '—'}
          </span>
        ),
      },
      {
        key: 'attempts',
        dataIndex: 'total_attempts',
        title: isVi ? 'Lượt thi & TB' : 'Attempts & Avg',
        sortable: true,
        width: 130,
        align: 'center',
        render: (exam) => (
          <div className="space-y-0.5 text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {(exam.total_attempts || 0).toLocaleString()} {isVi ? 'lượt' : 'attempts'}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold font-mono">
              {exam.avg_score && exam.avg_score > 0 ? `${exam.avg_score} pts` : '—'}
            </div>
          </div>
        ),
      },
      {
        key: 'status',
        dataIndex: 'is_published',
        title: isVi ? 'Trạng thái' : 'Status',
        sortable: true,
        width: 110,
        align: 'center',
        render: (exam) => (
          <div className="inline-flex flex-col items-center gap-0.5">
            <Switch
              size="small"
              aria-label={`Xuất bản ${exam.title}`}
              checked={Boolean(exam.is_published)}
              disabled={isMutatingPublish}
              onChange={(checked) => onTogglePublish(exam, checked)}
            />
            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              {exam.is_published ? (isVi ? 'Đã xuất bản' : 'Published') : (isVi ? 'Bản nháp' : 'Draft')}
            </span>
          </div>
        ),
      },
      {
        key: 'actions',
        title: isVi ? 'Thao tác' : 'Actions',
        width: 110,
        align: 'center',
        render: (exam) => {
          const examId = exam._id || exam.id || ''
          return (
            <TableRowActions
              isVi={isVi}
              onDelete={() => onDeleteExam(examId)}
              deleteTitle={isVi ? 'Xóa đề thi đầu vào này?' : 'Delete this placement exam?'}
              deleteDescription={
                isVi
                  ? 'Hành động này sẽ xóa vĩnh viễn đề thi và toàn bộ ngân hàng câu hỏi đi kèm.'
                  : 'This will permanently delete this exam and all associated questions.'
              }
              extraActions={
                <Tooltip title={isVi ? 'Soạn câu hỏi & Cấu hình' : 'Edit Questions & Config'}>
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<Edit3 size={14} />}
                    onClick={() => onManageQuestions(exam)}
                    className="!text-amber-600 !border-amber-200/80 !bg-amber-50/80 hover:!bg-amber-100 hover:!border-amber-300 dark:!bg-amber-950/60 dark:!border-amber-800 dark:!text-amber-400 dark:hover:!bg-amber-900/60 shadow-2xs"
                  />
                </Tooltip>
              }
            />
          )
        },
      },
    ],
    [isVi, active2SkillsExamId, active4SkillsExamId, onManageQuestions, onTogglePublish, isMutatingPublish, onDeleteExam]
  )

  return (
    <DataTable<ToeicExamItem>
      columns={columns}
      data={paginatedExams}
      rowKey={(exam) => exam._id || exam.id || exam.title}
      onResetFilters={handleResetFilters}
      filterSlot={
        <>
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={isVi ? 'Tìm kiếm đề thi...' : 'Search exams...'}
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-48">
            <CustomSelect
              value={selectedSkill}
              onChange={(val) => {
                setSelectedSkill(val)
                setCurrentPage(1)
              }}
              options={skillOptions}
            />
          </div>

          <div className="w-44">
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val)
                setCurrentPage(1)
              }}
              options={statusOptions}
            />
          </div>
        </>
      }
      pagination={{
        currentPage,
        pageSize,
        totalItems: filteredExams.length,
        onPageChange: setCurrentPage,
        onPageSizeChange: (limit) => {
          setPageSize(limit)
          setCurrentPage(1)
        },
      }}
    />
  )
}
