// Trang quản trị danh mục khóa học và giáo trình học tập.

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
import type { Course } from '@/features/courses/data/courses.data'
import { DataTable } from '@/components/data.table'
import { usePermission } from '@/features/rbac/hooks/use.permission'
import { Can } from '@/components/can'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAdminCoursesQuery,
  useDeleteCourseMutation,
  prefetchAdminCourses,
} from '@/features/courses/hooks/use.courses.admin.query'

import { CourseStatsOverview } from '@/features/courses/components/course.stats.overview'
import { CourseFilterBar } from '@/features/courses/components/course.filter.bar'
import { CourseGridCard } from '@/features/courses/components/course.grid.card'
import { getCourseColumns } from '@/features/courses/components/course.table.columns'
import type { FilterCategory, FilterStatus } from '@/features/courses/helpers/course.helper'

export function CoursesPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { can } = usePermission()
  const queryClient = useQueryClient()

  const { data: courses = [], isLoading, refetch } = useAdminCoursesQuery()
  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(refetch)
  const { mutateAsync: deleteCourseMutate } = useDeleteCourseMutation()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    const saved = storage.get<'table' | 'grid'>(STORAGE_KEYS.COURSES_VIEW_MODE)
    return saved === 'grid' || saved === 'table' ? saved : 'table'
  })

  const handleViewModeChange = useCallback((mode: 'table' | 'grid') => {
    setViewMode(mode)
    storage.set(STORAGE_KEYS.COURSES_VIEW_MODE, mode)
  }, [])

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const stats = useMemo(() => {
    const total = courses.length
    const published = courses.filter((c) => c.is_published).length
    const totalStudents = courses.reduce((acc, c) => acc + (c.enrollments || 0), 0)

    const scores = courses
      .map((c) => c.target_score)
      .filter((s): s is number => typeof s === 'number' && s > 0)
    let targetBand = '-'
    if (scores.length > 0) {
      const minScore = Math.min(...scores)
      const maxScore = Math.max(...scores)
      targetBand = minScore !== maxScore ? `${minScore} - ${maxScore}+` : `${maxScore}+`
    }

    return { total, published, totalStudents, targetBand }
  }, [courses])

  const filteredCourses = useMemo(() => {
    const list = courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = filterCategory === 'ALL' || c.category === filterCategory
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'PUBLISHED' && c.is_published) ||
        (filterStatus === 'DRAFT' && !c.is_published)

      return matchSearch && matchCategory && matchStatus
    })

    if (!sortKey || !sortOrder) return list

    return [...list].sort((a, b) => {
      if (sortKey === 'info') {
        const titleA = a.title.toLowerCase()
        const titleB = b.title.toLowerCase()
        const comp = titleA.localeCompare(titleB)
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'category') {
        const comp = a.category.localeCompare(b.category)
        return sortOrder === 'asc' ? comp : -comp
      }
      if (sortKey === 'target_score') {
        const scoreA = a.target_score || 0
        const scoreB = b.target_score || 0
        return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA
      }
      if (sortKey === 'price') {
        const getEffectivePrice = (item: Course) => (item.discount_price && item.discount_price > 0 ? item.discount_price : item.price || 0)
        const priceA = getEffectivePrice(a)
        const priceB = getEffectivePrice(b)
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
      }
      return 0
    })
  }, [courses, searchQuery, filterCategory, filterStatus, sortKey, sortOrder])

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCourses.slice(start, start + itemsPerPage)
  }, [filteredCourses, currentPage, itemsPerPage])

  const handleResetFilters = async () => {
    setSearchQuery('')
    setFilterCategory('ALL')
    setFilterStatus('ALL')
    setSortKey(null)
    setSortOrder(null)
    setCurrentPage(1)
    await refetch()
    toast.success(isVi ? 'Đã đặt lại bộ lọc khóa học' : 'Course filters reset')
  }

  const handleEditCourse = (courseId: string) => {
    navigate(`/courses/${courseId}/edit`)
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteCourseMutate(courseId)
      toast.success('Đã xóa khóa học thành công!')
    } catch {
      toast.error('Xóa khóa học thất bại')
    }
  }

  const columns = useMemo(() => {
    return getCourseColumns({
      isVi,
      canEdit: can('PUT', '/courses/:id'),
      canDelete: can('DELETE', '/courses/:id'),
      onEdit: handleEditCourse,
      onDelete: handleDeleteCourse,
      onViewSubmissions: (course) => navigate(`/submissions?courseId=${encodeURIComponent(course.id)}`),
      onViewStudentScores: (course) => navigate(`/courses/${course.id}/scores`),
    })
  }, [isVi, can, navigate])

  return (
    <div className="space-y-6">
      <CourseStatsOverview stats={stats} />

      <DataTable<Course>
        title={isVi ? 'Quản Lý Khóa Học' : 'Course Management'}
        subtitle={
          isVi
            ? 'Soạn thảo giáo trình, modules bài giảng video, bài tập và hệ thống ngân hàng câu hỏi'
            : 'Author curriculum, video lecture modules, exercises, and question bank system'
        }
        isLoading={isLoading}
        columns={columns}
        data={paginatedCourses}
        rowKey={(c) => c.id}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        renderGridItem={(course) => (
          <CourseGridCard
            course={course}
            isVi={isVi}
            canEdit={can('PUT', '/courses/:id')}
            canDelete={can('DELETE', '/courses/:id')}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
            onViewSubmissions={(c) => navigate(`/submissions?courseId=${encodeURIComponent(c.id)}`)}
            onViewScores={(c) => navigate(`/courses/${c.id}/scores`)}
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
          <>
            <button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className="flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
              <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
            </button>
            <Can do="POST" on="/courses">
              <button
                onClick={() => navigate('/courses/create')}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isVi ? 'Thêm khóa học mới' : 'Add New Course'}</span>
              </button>
            </Can>
          </>
        }
        filterSlot={
          <CourseFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
          />
        }
        pagination={{
          currentPage,
          pageSize: itemsPerPage,
          totalItems: filteredCourses.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (limit) => {
            setItemsPerPage(limit)
            setCurrentPage(1)
          },
          onPrefetchPage: (page) => {
            prefetchAdminCourses(queryClient, { current: page, pageSize: itemsPerPage })
          },
        }}
      />
    </div>
  )
}
