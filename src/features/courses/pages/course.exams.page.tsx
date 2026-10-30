// Trang quản lý bài thi và đánh giá năng lực khóa học.
import { useCallback, useMemo } from 'react'
import { UserCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { DataTable } from '@/components/data.table'
import { CourseExamStatsOverview } from '@/features/courses/components/course.exam.stats.overview'
import { CourseExamFilterBar } from '@/features/courses/components/course.exam.filter.bar'
import { CourseExamHeaderActions } from '@/features/courses/components/course.exam.header.actions'
import { CourseExamGridCard } from '@/features/courses/components/course.exam.grid.card'
import { useNavigate, Link } from 'react-router-dom'
import { getCourseExamColumns } from '@/features/courses/components/course.exam.table.columns'
import { useCourseExams } from '@/features/courses/hooks/use.course.exams'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export function CourseExamsPage() {
  const navigate = useNavigate()

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
    publishingExamId,
  } = useCourseExams()

  const handleManageQuestions = useCallback(
    (exam: ToeicExamItem) => {
      storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, exam)
      navigate(`/course-exams/${exam._id}/questions`)
    },
    [navigate]
  )

  const columns = useMemo(
    () =>
      getCourseExamColumns({
        isVi,
        onTogglePublish: handleTogglePublish,
        publishingExamId,
        onOpenEdit: handleManageQuestions,
        onDelete: handleDeleteExam,
      }),
    [isVi, handleTogglePublish, publishingExamId, handleManageQuestions, handleDeleteExam]
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CourseExamStatsOverview stats={stats} isVi={isVi} />

      {typeFilter === 'DIAGNOSTIC_TEST' && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-indigo-900 dark:text-indigo-200">
            <span className="font-bold block mb-0.5">
              {isVi ? 'Quản lý & Tạo đề thi đầu vào hệ thống' : 'System Placement Test Management'}
            </span>
            <span className="opacity-90">
              {isVi
                ? 'Các bài thi đánh giá năng lực đầu vào 2 Kỹ Năng (LR) và 4 Kỹ Năng (Full Skills) được cấu hình và xuất bản tại trang chuyên biệt.'
                : 'Placement diagnostic tests for 2 Skills (LR) and 4 Skills (Full Skills) are authored and configured in the dedicated Placement Tests studio.'}
            </span>
          </div>
          <Link
            to="/practice/placement-tests"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isVi ? 'Đến trang Đề thi đầu vào' : 'Go to Placement Tests'}</span>
          </Link>
        </div>
      )}

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
            ? 'Soạn thảo và quản lý các bài thử thách từng chương (Challenge) và bài thi tốt nghiệp kết thúc khóa học'
            : 'Author and manage chapter challenge tests and final course graduation exams'
        }
        isLoading={isLoading}
        emptyText={
          typeFilter === 'DIAGNOSTIC_TEST'
            ? (isVi
                ? 'Đề thi đầu vào hệ thống được quản lý tại mục "Đề thi đầu vào". Bấm nút "Đề thi đầu vào" ở góc phải để tạo và quản lý.'
                : 'System placement tests are managed in the dedicated "Placement Tests" section. Click the "Placement Tests" button at top right.')
            : undefined
        }
        columns={columns}
        data={paginatedExams}
        rowKey={(e) => e._id ?? ''}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        renderGridItem={(exam) => (
          <CourseExamGridCard
            key={exam._id}
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
        scroll={{ x: 1200 }}
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
