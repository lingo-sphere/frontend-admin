/**
 * @file course.progress.table.tab.tsx
 * @description Bảng dữ liệu tiến độ học tập của học viên, bộ lọc theo khóa học, trạng thái hoàn thành và tìm kiếm
 */

import { Search, RotateCcw } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/common/data.table'
import type { StudentProgressItem } from '@/services/progress.service'

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
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={progressSearch}
              onChange={(e) => onProgressSearchChange(e.target.value)}
              placeholder={isVi ? 'Tìm theo tên, email, ID học viên...' : 'Search learner name, email, ID...'}
              className="w-full pl-9.5 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => onSelectCourseId(e.target.value)}
              className="py-2 pl-3 pr-8 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer max-w-[220px] truncate"
            >
              <option value="ALL">{isVi ? 'Tất cả khóa học' : 'All Courses'}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
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
                  ? isVi ? 'Hoàn thành (100%)' : 'Completed'
                  : status === 'IN_PROGRESS'
                  ? isVi ? 'Đang học' : 'In Progress'
                  : isVi ? 'Mới bắt đầu' : 'Started'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(progressSearch || selectedCourseId !== 'ALL' || progressStatusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Đặt lại bộ lọc' : 'Reset'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <DataTable
          columns={progressColumns}
          data={paginatedStudents}
          isLoading={isLoadingProgress}
          sortKey={progressSortKey}
          sortOrder={progressSortOrder}
          onSortChange={onSort}
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
      </div>
    </div>
  )
}
