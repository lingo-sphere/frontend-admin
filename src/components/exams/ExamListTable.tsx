import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Search,
  Clock,
  HelpCircle,
  Trash2,
} from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'
import { Popconfirm } from '@/components/common/Popconfirm'
import { Pagination } from '@/components/common/Pagination'

interface ExamListTableProps {
  exams: ToeicExamItem[]
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedType: string
  onTypeChange: (val: string) => void
  onTogglePublish: (id: string, current: boolean) => void
  onDeleteExam: (id: string) => Promise<void> | void
}

export function ExamListTable({
  exams,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  onTogglePublish,
  onDeleteExam,
}: ExamListTableProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch = exam.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesType =
        selectedType === 'ALL' || exam.type === selectedType
      return matchesSearch && matchesType
    })
  }, [exams, searchQuery, selectedType])

  const totalPages = Math.ceil(filteredExams.length / pageSize) || 1

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage, pageSize])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder={isVi ? 'Tìm kiếm đề thi theo tên...' : 'Search exams by title...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'FULL_TEST', 'MINI_TEST', 'PRE_TEST', 'POST_MINI_TEST'].map(
            (type) => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                }`}
              >
                {type === 'ALL'
                  ? (isVi ? 'Tất cả' : 'All')
                  : type === 'FULL_TEST'
                    ? 'Full Test (200c)'
                    : type === 'MINI_TEST'
                      ? 'Mini Test'
                      : type === 'PRE_TEST'
                        ? 'Pre-Test'
                        : 'Post-Mini Test'}
              </button>
            )
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <th className="py-3.5 px-4">{isVi ? 'Tên đề thi' : 'Exam Title'}</th>
                <th className="py-3.5 px-4">{isVi ? 'Loại đề' : 'Type'}</th>
                <th className="py-3.5 px-4">{isVi ? 'Thời lượng' : 'Duration'}</th>
                <th className="py-3.5 px-4">{isVi ? 'Số câu' : 'Questions'}</th>
                <th className="py-3.5 px-4">{isVi ? 'Lượt thi' : 'Attempts'}</th>
                <th className="py-3.5 px-4">{isVi ? 'Điểm TB' : 'Avg Score'}</th>
                <th className="py-3.5 px-4">{isVi ? 'Trạng thái' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/60 dark:text-slate-200">
              {paginatedExams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {isVi ? 'Không tìm thấy đề thi nào phù hợp' : 'No matching exams found'}
                  </td>
                </tr>
              ) : (
                paginatedExams.map((exam) => (
                  <tr
                    key={exam.id || exam._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-indigo-500 shrink-0" />
                        <span>{exam.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                        {exam.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        {exam.duration_minutes} {isVi ? 'phút' : 'mins'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1">
                        <HelpCircle size={13} className="text-slate-400" />
                        {exam.total_questions} {isVi ? 'câu' : 'questions'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {(exam.total_attempts || 0).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-teal-600 dark:text-teal-400">
                      {exam.avg_score || 0} pts
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          onTogglePublish(exam.id || exam._id || '', exam.is_published ?? true)
                        }
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          exam.is_published
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {exam.is_published
                          ? (isVi ? 'Xuất bản' : 'Published')
                          : (isVi ? 'Bản nháp' : 'Draft')}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Popconfirm
                          title={isVi ? 'Xóa đề thi này?' : 'Delete this exam?'}
                          description={
                            isVi
                              ? 'Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu câu hỏi liên quan.'
                              : 'This action cannot be undone and will delete all related questions.'
                          }
                          okText={isVi ? 'Xóa' : 'Delete'}
                          cancelText={isVi ? 'Hủy' : 'Cancel'}
                          okType="danger"
                          placement="topRight"
                          onConfirm={() => onDeleteExam(exam.id || exam._id || '')}
                        >
                          <button
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                            title={isVi ? 'Xóa đề thi' : 'Delete exam'}
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredExams.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredExams.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}
