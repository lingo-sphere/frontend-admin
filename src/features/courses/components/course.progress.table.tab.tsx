// Bảng dữ liệu tiến độ học tập của học viên, bộ lọc theo khóa học và trạng thái.

import { useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import type { StudentProgressItem } from '@/features/progress/services/progress.service'

interface CourseSimple {
  id: string
  title: string
  thumbnail_url?: string
  author_id?: string
  students_count?: number
}

interface CourseProgressTableTabProps {
  isVi: boolean
  courses: CourseSimple[]
  selectedCourseId: string
  onSelectCourseId: (id: string) => void
  progressSearch: string
  onProgressSearchChange: (v: string) => void
  progressStatusFilter: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'STARTED'
  onProgressStatusFilterChange: (f: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'STARTED') => void
  onResetFilters: () => void
  onRefresh: () => void
  isLoadingProgress: boolean
  filteredStudents: StudentProgressItem[]
  paginatedStudents: StudentProgressItem[]
  progressColumns: DataTableColumn<StudentProgressItem>[]
  progressCurrentPage: number
  progressPageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
  progressSortKey: string | null
  progressSortOrder: 'asc' | 'desc' | null
  onSort: (key: string, order: 'asc' | 'desc' | null) => void
}

export function CourseProgressTableTab({
  isVi,
  courses,
  selectedCourseId,
  onSelectCourseId,
  progressSearch,
  onProgressSearchChange,
  progressStatusFilter,
  onProgressStatusFilterChange,
  onResetFilters,
  onRefresh,
  isLoadingProgress,
  filteredStudents,
  paginatedStudents,
  progressColumns,
  progressCurrentPage,
  progressPageSize,
  onPageChange,
  onPageSizeChange,
  progressSortKey,
  progressSortOrder,
  onSort,
}: CourseProgressTableTabProps) {
  const courseOptions: SelectOption[] = useMemo(() => [
    {
      value: 'ALL',
      label: isVi ? 'Tất cả khóa học' : 'All Courses',
      badge: courses.length > 0 ? String(courses.length) : undefined,
    },
    ...courses.map((c) => ({
      value: c.id,
      label: c.title,
      badge: typeof c.students_count === 'number' && c.students_count > 0 ? `${c.students_count} HV` : undefined,
    })),
  ], [courses, isVi])

  return (
    <DataTable<StudentProgressItem>
      title={isVi ? 'Bảng Điểm & Tiến Độ Học Viên' : 'Learner Progress & Gradebook'}
      subtitle={
        isVi
          ? 'Theo dõi điểm bài thi đầu vào, tiến độ học tập, bài thi chặng và điểm tốt nghiệp của từng học viên'
          : 'Track baseline placement scores, course progress, chapter challenges, and final scores'
      }
      isLoading={isLoadingProgress}
      columns={progressColumns}
      data={paginatedStudents}
      sortKey={progressSortKey}
      sortOrder={progressSortOrder}
      onSortChange={onSort}
      onResetFilters={onResetFilters}
      filterSlot={
        <>
          <div className="flex items-center gap-2 w-full sm:w-72 h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              value={progressSearch}
              onChange={(e) => onProgressSearchChange(e.target.value)}
              placeholder={isVi ? 'Tìm học viên, email...' : 'Search learner...'}
              className="w-full bg-transparent border-none outline-none placeholder:text-slate-400 text-xs font-medium"
            />
            {progressSearch && (
              <button
                type="button"
                onClick={() => onProgressSearchChange('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <CustomSelect
            value={selectedCourseId}
            onChange={onSelectCourseId}
            options={courseOptions}
            className="w-56"
            placeholder={isVi ? 'Chọn khóa học...' : 'Select course...'}
            showSearch={courses.length > 5}
          />

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {(['ALL', 'COMPLETED', 'IN_PROGRESS', 'STARTED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onProgressStatusFilterChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  progressStatusFilter === status
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {status === 'ALL'
                  ? isVi ? 'Tất cả' : 'All'
                  : status === 'COMPLETED'
                  ? isVi ? 'Hoàn thành' : 'Completed'
                  : status === 'IN_PROGRESS'
                  ? isVi ? 'Đang học' : 'In Progress'
                  : isVi ? 'Mới bắt đầu' : 'Started'}
              </button>
            ))}
          </div>
        </>
      }
      pagination={{
        currentPage: progressCurrentPage,
        pageSize: progressPageSize,
        totalItems: filteredStudents.length,
        onPageChange,
        onPageSizeChange,
      }}
      emptyText={
        isVi
          ? 'Không có dữ liệu tiến độ học viên nào phù hợp với bộ lọc.'
          : 'No learner progress data found.'
      }
    />
  )
}
