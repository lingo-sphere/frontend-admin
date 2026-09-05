/**
 * @file ExamListTable.tsx
 * @description Component giao diện ExamListTable phục vụ khu vực Quản trị Admin
 */

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
import { Popconfirm } from '@/components/common/popconfirm'
import { Pagination } from '@/components/common/pagination'

interface ExamListTableProps {
  exams: ToeicExamItem[]
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedType: string
  onTypeChange: (val: string) => void
  onTogglePublish: (id: string, current: boolean) => void
  onDeleteExam: (id: string) => Promise<void> | void
  onManageQuestions?: (exam: ToeicExamItem) => void
}

export function ExamListTable({
  exams,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  onTogglePublish,
  onDeleteExam,
  onManageQuestions,
}: ExamListTableProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const handleSort = (key: string) => {
    let nextOrder: 'asc' | 'desc' = 'asc'
    if (sortKey === key && sortOrder) {
      nextOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
      if (filteredExams.length >= 2) {
        const getVal = (item: ToeicExamItem) => {
          if (key === 'title') return item.title.toLowerCase()
          if (key === 'duration') return item.duration_minutes || 0
          if (key === 'questions') return item.total_questions || 0
          if (key === 'attempts') return item.total_attempts || 0
          if (key === 'score') return item.avg_score || 0
          return ''
        }
        const first = getVal(filteredExams[0])
        const last = getVal(filteredExams[filteredExams.length - 1])
        const isCurrentAsc = typeof first === 'number' && typeof last === 'number' ? first <= last : String(first).localeCompare(String(last)) <= 0
        nextOrder = isCurrentAsc ? 'desc' : 'asc'
      } else {
        nextOrder = 'desc'
      }
    }
    setSortKey(key)
    setSortOrder(nextOrder)
    setCurrentPage(1)
  }

  const filteredExams = useMemo(() => {
    const list = exams.filter((exam) => {
      const matchesSearch = exam.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesType =
        selectedType === 'ALL' || exam.type === selectedType
      return matchesSearch && matchesType
    })

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      if (sortKey === 'title') {
        const comp = a.title.localeCompare(b.title)
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'duration') {
        const diff = (a.duration_minutes || 0) - (b.duration_minutes || 0)
        return sortOrder === 'asc' ? diff : -diff
      }
      if (sortKey === 'questions') {
        const diff = (a.total_questions || 0) - (b.total_questions || 0)
        return sortOrder === 'asc' ? diff : -diff
      }
      if (sortKey === 'attempts') {
        const diff = (a.total_attempts || 0) - (b.total_attempts || 0)
        return sortOrder === 'asc' ? diff : -diff
      }
      if (sortKey === 'score') {
        const diff = (a.avg_score || 0) - (b.avg_score || 0)
        return sortOrder === 'asc' ? diff : -diff
      }
      return 0
    })
  }, [exams, searchQuery, selectedType, sortKey, sortOrder])

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

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 text-[13.5px] sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                <th
                  onClick={() => handleSort('title')}
                  className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isVi ? 'Tên đề thi' : 'Exam Title'}</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">{isVi ? 'Loại đề' : 'Type'}</th>
                <th
                  onClick={() => handleSort('duration')}
                  className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isVi ? 'Thời lượng' : 'Duration'}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('questions')}
                  className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isVi ? 'Số câu' : 'Questions'}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('attempts')}
                  className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isVi ? 'Lượt thi' : 'Attempts'}</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="py-3.5 px-4 cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isVi ? 'Điểm TB' : 'Avg Score'}</span>
                  </div>
                </th>
                <th className="py-3.5 px-4">{isVi ? 'Trạng thái' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-200 text-xs">
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
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-[background-color] duration-100"
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
                      {exam.total_questions === 0 || (!exam.questions?.length && exam.total_questions === 0) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          0 {isVi ? 'câu (Chưa có câu hỏi)' : 'questions (Empty)'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                          <HelpCircle size={13} className="text-slate-400" />
                          {exam.questions?.length ?? exam.total_questions} {isVi ? 'câu' : 'questions'}
                        </span>
                      )}
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
                        {onManageQuestions && (
                          <button
                            type="button"
                            onClick={() => onManageQuestions(exam)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors cursor-pointer"
                            title={isVi ? 'Soạn / Quản lý câu hỏi' : 'Manage Questions'}
                          >
                            <HelpCircle size={13} />
                            <span className="hidden sm:inline">{isVi ? 'Soạn câu hỏi' : 'Questions'}</span>
                          </button>
                        )}
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
