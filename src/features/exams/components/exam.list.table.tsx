// Bảng danh sách đề thi TOEIC chuẩn hóa theo thiết kế DataTable dùng chung.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { DataTable } from '@/components/data.table'
import { ExamTableFilters } from '@/features/exams/components/exam.table.filters'
import { getExamColumns } from '@/features/exams/components/exam.table.columns'

interface ExamListTableProps {
  exams: ToeicExamItem[]
  searchQuery: string
  onSearchChange: (val: string) => void
  selectedSkill?: string
  onSkillChange?: (val: string) => void
  onTogglePublish: (id: string, current: boolean) => void
  onDeleteExam: (id: string) => Promise<void> | void
  onManageQuestions?: (exam: ToeicExamItem) => void
}

export function ExamListTable({
  exams,
  searchQuery,
  onSearchChange,
  selectedSkill = 'ALL',
  onSkillChange,
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

  const columns = useMemo(
    () =>
      getExamColumns({
        isVi,
        onTogglePublish,
        onDeleteExam,
        onManageQuestions,
      }),
    [isVi, onTogglePublish, onDeleteExam, onManageQuestions]
  )

  const filteredExams = useMemo(() => {
    const list = exams.filter((exam) => {
      const matchesSearch = exam.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesSkill =
        !selectedSkill ||
        selectedSkill === 'ALL' ||
        (selectedSkill === '4SKILLS'
          ? exam.skills_enabled === 'ALL' || exam.skills_enabled === '4SKILLS' || exam.skills_enabled === 'LRSW'
          : exam.skills_enabled !== 'ALL' && exam.skills_enabled !== '4SKILLS' && exam.skills_enabled !== 'LRSW')
      return matchesSearch && matchesSkill
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
      if (sortKey === 'type') {
        const comp = (a.type || '').localeCompare(b.type || '')
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'status') {
        const statA = a.is_published ? 1 : 0
        const statB = b.is_published ? 1 : 0
        return sortOrder === 'asc' ? statA - statB : statB - statA
      }
      return 0
    })
  }, [exams, searchQuery, selectedSkill, sortKey, sortOrder])

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage, pageSize])

  const handleResetFilters = () => {
    onSearchChange('')
    if (onSkillChange) onSkillChange('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
  }

  return (
    <DataTable<ToeicExamItem>
      columns={columns}
      data={paginatedExams}
      rowKey={(exam) => exam._id || exam.title}
      sortKey={sortKey}
      sortOrder={sortOrder}
      onSortChange={(k, o) => {
        setSortKey(k)
        setSortOrder(o)
        setCurrentPage(1)
      }}
      onResetFilters={handleResetFilters}
      filterSlot={
        <ExamTableFilters
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            onSearchChange(q)
            setCurrentPage(1)
          }}
          selectedSkill={selectedSkill}
          onSkillChange={(s) => {
            if (onSkillChange) onSkillChange(s)
            setCurrentPage(1)
          }}
          isVi={isVi}
        />
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
