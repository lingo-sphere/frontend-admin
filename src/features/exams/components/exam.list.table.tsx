/**
 * @file exam.list.table.tsx
 * @description Exam list table with sorting, pagination, search, and type filters
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { Pagination } from '@/components/pagination'
import { ExamTableFilters } from '@/features/exams/components/exam.table.filters'
import { ExamTableRow } from '@/features/exams/components/exam.table.row'

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
      nextOrder = 'desc'
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
      <ExamTableFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
        isVi={isVi}
      />

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
                  <ExamTableRow
                    key={exam._id}
                    exam={exam}
                    isVi={isVi}
                    onTogglePublish={onTogglePublish}
                    onDeleteExam={onDeleteExam}
                    onManageQuestions={onManageQuestions}
                  />
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
