// Trang quản lý bài thi và đánh giá năng lực khóa học.

import { useMemo } from 'react'
import { UserCheck, ShieldCheck } from 'lucide-react'
import { DataTable } from '@/components/data.table'
import { CourseExamStatsOverview } from '@/features/courses/components/course.exam.stats.overview'
import { CourseExamFilterBar } from '@/features/courses/components/course.exam.filter.bar'
import { CourseExamHeaderActions } from '@/features/courses/components/course.exam.header.actions'
import { CourseExamGridCard } from '@/features/courses/components/course.exam.grid.card'
import { getCourseExamColumns } from '@/features/courses/components/course.exam.table.columns'
import { useCourseExams } from '@/features/courses/hooks/use.course.exams'
import { useAdminStore } from '@/store/admin.store'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export function CourseExamsPage() {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const {
    isVi,
    isTeacher,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    exams,
    filteredExams,
    paginatedExams,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
    stats,
    loadData,
    handleResetFilters,
    handleDeleteExam,
    handleTogglePublish,
  } = useCourseExams()

  const handleManageQuestions = (exam: ToeicExamItem) => {
    storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, exam)
    setActiveNavItem(`course-exam-questions:${exam._id || exam.id}`)
  }

  const columns = useMemo(
    () =>
      getCourseExamColumns({
        isVi,
        onTogglePublish: handleTogglePublish,
        onOpenEdit: handleManageQuestions,
        onDelete: handleDeleteExam,
      }),
    [isVi, handleTogglePublish, handleDeleteExam, setActiveNavItem]
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CourseExamStatsOverview stats={stats} isVi={isVi} />

      <DataTable<ToeicExamItem>
        title={
          <div className="flex items-center gap-2.5 flex-wrap">
            <span>{isVi ? 'Quản Lý Bài Thi & Đánh Giá Khóa Học' : 'Course Exam & Assessment Management'}</span>
            {isTeacher ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <UserCheck className="w-3.5 h-3.5" />
                {isVi ? 'Giảng viên' : 'Teacher Mode'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isVi ? 'Quản trị viên' : 'Admin Mode'}
              </span>
            )}
          </div>
        }
        subtitle={
          isVi
            ? 'Soạn thảo và quản lý các bài kiểm tra đánh giá năng lực đầu vào hệ thống, bài thử thách từng chương (Challenge), và bài thi tốt nghiệp kết thúc khóa học'
            : 'Author and manage system placement tests, chapter challenge tests, and final course graduation exams'
        }
        isLoading={isLoading}
        columns={columns}
        data={paginatedExams}
        rowKey={(e) => e._id || ''}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        renderGridItem={(exam) => (
          <CourseExamGridCard
            key={exam._id || ''}
            exam={exam}
            isVi={isVi}
            onOpenEdit={handleManageQuestions}
            onTogglePublish={handleTogglePublish}
            onDelete={handleDeleteExam}
          />
        )}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={(k, o) => {
          setSortKey(k)
          setSortOrder(o)
          setCurrentPage(1)
        }}
        onResetFilters={handleResetFilters}
        extraActions={
          <CourseExamHeaderActions
            isVi={isVi}
            isLoading={isLoading}
            courses={courses}
            exams={exams}
            selectedCourseId={selectedCourseId}
            onSelectCourseId={(id) => {
              setSelectedCourseId(id)
              setCurrentPage(1)
            }}
            onRefresh={loadData}
            onOpenCreateModal={() => setActiveNavItem('course-exam-create')}
          />
        }
        filterSlot={
          <CourseExamFilterBar
            isVi={isVi}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q)
              setCurrentPage(1)
            }}
            typeFilter={typeFilter}
            onTypeFilterChange={(t) => {
              setTypeFilter(t)
              setCurrentPage(1)
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(s) => {
              setStatusFilter(s)
              setCurrentPage(1)
            }}
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
    </div>
  )
}
