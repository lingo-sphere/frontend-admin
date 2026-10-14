// Bảng quản lý danh sách toàn bộ các đề thi đánh giá năng lực đầu vào hệ thống bao gồm bản nháp và bản công khai.
import { useState, useMemo } from 'react'
import {
  Search,
  SlidersHorizontal,
  Headphones,
  Sparkles,
  Clock,
  FileText,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { Pagination } from '@/components/pagination'
import { Popconfirm } from '@/components/popconfirm'
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
  onCreateExam,
  isMutatingPublish = false,
  active2SkillsExamId,
  active4SkillsExamId,
}: PlacementExamsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const skillOptions: SelectOption[] = [
    { value: 'ALL', label: isVi ? 'Tất cả kỹ năng' : 'All Skills' },
    { value: '2SKILLS', label: isVi ? '2 Kỹ Năng (Listening & Reading)' : '2 Skills (LR)' },
    { value: '4SKILLS', label: isVi ? '4 Kỹ Năng (Full Skills)' : '4 Skills (Full Skills)' },
  ]

  const statusOptions: SelectOption[] = [
    { value: 'ALL', label: isVi ? 'Tất cả trạng thái' : 'All Statuses' },
    { value: 'PUBLISHED', label: isVi ? 'Đang công khai (Public)' : 'Published' },
    { value: 'DRAFT', label: isVi ? 'Bản nháp / Chưa public' : 'Draft / Private' },
  ]

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

  const totalPages = Math.ceil(filteredExams.length / pageSize) || 1

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage, pageSize])

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleSkillChange = (val: string) => {
    setSelectedSkill(val)
    setCurrentPage(1)
  }

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val)
    setCurrentPage(1)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {isVi ? 'Danh Sách Tất Cả Đề Thi Đầu Vào' : 'All System Placement Tests'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {filteredExams.length} / {exams.length} {isVi ? 'đề thi' : 'exams'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi
              ? 'Toàn bộ kho đề thi đầu vào trong hệ thống (bao gồm cả các bản nháp chưa công khai và bản chính thức)'
              : 'Complete repository of placement exams including private drafts and active published tests'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={isVi ? 'Tìm tên đề, mã đề, ID...' : 'Search by title, code, ID...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>

          <div className="w-48">
            <CustomSelect
              value={selectedSkill}
              onChange={handleSkillChange}
              options={skillOptions}
              size="sm"
            />
          </div>

          <div className="w-44">
            <CustomSelect
              value={selectedStatus}
              onChange={handleStatusChange}
              options={statusOptions}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">{isVi ? 'Đề thi & Mã đề' : 'Exam & Code'}</th>
              <th className="py-3 px-4">{isVi ? 'Kỹ năng' : 'Skills'}</th>
              <th className="py-3 px-4">{isVi ? 'Cấu hình' : 'Config'}</th>
              <th className="py-3 px-4">{isVi ? 'Điểm chuẩn' : 'Passing Score'}</th>
              <th className="py-3 px-4">{isVi ? 'Lượt thi & TB' : 'Attempts & Avg'}</th>
              <th className="py-3 px-4">{isVi ? 'Trạng thái xuất bản' : 'Publish Status'}</th>
              <th className="py-3 px-4 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {paginatedExams.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <SlidersHorizontal className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {isVi ? 'Không tìm thấy đề thi đầu vào phù hợp' : 'No placement tests found'}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {isVi
                          ? 'Thử thay đổi bộ lọc tìm kiếm hoặc tạo đề thi đầu vào mới.'
                          : 'Try changing your search query or create a new placement exam.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => onCreateExam('2SKILLS')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Tạo đề 2 Kỹ Năng' : 'Create 2-Skill Test'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCreateExam('4SKILLS')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Tạo đề 4 Kỹ Năng' : 'Create 4-Skill Test'}</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedExams.map((exam) => {
                const examId = exam._id || exam.id || ''
                const isFourSkills =
                  exam.skills_enabled === 'ALL' ||
                  exam.skills_enabled === 'LRWS' ||
                  exam.placement_type === '4SKILLS' ||
                  (Boolean(exam.title) && exam.title.includes('4 Kỹ Năng'))

                const isActiveOfficial =
                  exam.is_published &&
                  (examId === active2SkillsExamId || examId === active4SkillsExamId)

                const qCount =
                  Array.isArray(exam.questions) && exam.questions.length > 0
                    ? exam.questions.length
                    : exam.total_questions || 0

                return (
                  <tr
                    key={examId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                            {exam.title}
                          </span>
                          {isActiveOfficial && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <ShieldCheck className="w-3 h-3 text-amber-500" />
                              <span>{isVi ? 'Đang áp dụng' : 'Active Standard'}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{exam.code ? exam.code : `ID: ${examId}`}</span>
                          {exam.created_at && (
                            <>
                              <span>•</span>
                              <span>{new Date(exam.created_at).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isFourSkills ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Sparkles className="w-3 h-3" />
                          <span>{isVi ? '4 Kỹ Năng (Full)' : '4 Skills (Full)'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Headphones className="w-3 h-3" />
                          <span>{isVi ? '2 Kỹ Năng (LR)' : '2 Skills (LR)'}</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.duration_minutes || 0} {isVi ? 'phút' : 'mins'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{qCount} {isVi ? 'câu hỏi' : 'questions'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exam.passing_score !== undefined && exam.passing_score !== null
                          ? `${exam.passing_score} / 990`
                          : '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {(exam.total_attempts || 0).toLocaleString()} {isVi ? 'lượt' : 'attempts'}
                        </div>
                        <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                          {exam.avg_score && exam.avg_score > 0 ? `${exam.avg_score} pts` : '-'}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onTogglePublish(exam, !exam.is_published)}
                          disabled={isMutatingPublish}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                            exam.is_published ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={exam.is_published ? (isVi ? 'Chuyển về Bản nháp' : 'Set to Draft') : (isVi ? 'Công khai bài thi này' : 'Publish this exam')}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              exam.is_published ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            exam.is_published
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              exam.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {exam.is_published
                            ? (isVi ? 'Đang công khai' : 'Published')
                            : (isVi ? 'Bản nháp / Ẩn' : 'Draft / Private')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onManageQuestions(exam)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-indigo-500/10"
                          title={isVi ? 'Soạn câu hỏi & Cấu hình' : 'Edit Questions & Config'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isVi ? 'Soạn câu hỏi & Cấu hình' : 'Questions & Config'}</span>
                        </button>

                        <Popconfirm
                          title={isVi ? 'Xóa đề thi đầu vào này?' : 'Delete this placement exam?'}
                          description={
                            isVi
                              ? 'Hành động này sẽ xóa vĩnh viễn đề thi và toàn bộ ngân hàng câu hỏi đi kèm.'
                              : 'This will permanently delete this exam and all associated questions.'
                          }
                          okText={isVi ? 'Xóa' : 'Delete'}
                          cancelText={isVi ? 'Hủy' : 'Cancel'}
                          okType="danger"
                          onConfirm={() => onDeleteExam(examId)}
                        >
                          <button
                            type="button"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title={isVi ? 'Xóa đề thi' : 'Delete exam'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredExams.length > pageSize && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setCurrentPage(1)
            }}
            totalItems={filteredExams.length}
            showTotal={true}
          />
        </div>
      )}
    </div>
  )
}
