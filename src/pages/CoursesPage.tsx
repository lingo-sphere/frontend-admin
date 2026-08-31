import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw } from 'lucide-react'
import type { Course } from '@/data/courses-data'
import type { Course as ApiCourse, CourseModule as ApiCourseModule } from '@/types/api.types'
import { DataTable } from '@/components/common/DataTable'
import { useAdminStore } from '@/store/admin-store'
import { usePermission } from '@/hooks/use-permission'
import { Can } from '@/components/common/Can'
import { courseService } from '@/services/course.service'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'

import { CourseStatsOverview } from '@/components/courses/CourseStatsOverview'
import { CourseFilterBar } from '@/components/courses/CourseFilterBar'
import { CourseGridCard } from '@/components/courses/CourseGridCard'
import { getCourseColumns } from '@/components/courses/course-table-columns'
import type { FilterCategory, FilterLevel, FilterStatus } from '@/helpers/course.helper'

export function CoursesPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const { can } = usePermission()

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0)

  const fetchCourses = useCallback(async () => {
    setIsLoading(true)
    try {
      const [res, analyticsRes] = await Promise.allSettled([
        courseService.getAllCourses({ pageSize: 50 }),
        userService.getSystemAnalytics(),
      ])

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setTotalStudentsCount(analyticsRes.value.overview?.total_users || 0)
      }

      if (res.status === 'fulfilled' && res.value) {
        const raw = res.value
        const data: ApiCourse[] = Array.isArray(raw) ? raw : (raw?.result || [])
        if (data && data.length > 0) {
          const mappedCourses: Course[] = data.map((c: ApiCourse) => ({
            id: c._id || '',
            title: c.title,
            slug: c.slug || '',
            description: c.description || '',
            thumbnail_url: c.thumbnail_url || '',
            target_score: c.target_score || 500,
            category: (c.category as Course['category']) || 'TOEIC_2_SKILLS',
            level: (c.level as Course['level']) || 'BEGINNER',
            total_modules: c.total_modules || c.modules?.length || 0,
            total_lessons:
              c.total_lessons ||
              (c.modules || []).reduce((acc: number, m: ApiCourseModule) => acc + (m.lessons?.length || 0), 0) ||
              0,
            price: c.price || 0,
            is_published: c.is_published ?? true,
            author_id: c.author_id || '',
            author_name: 'LingoSphere Instructor',
            created_at: c.created_at || new Date().toISOString(),
            enrollments: c.students_count || 0,
            completed_count: Math.round((c.students_count || 0) * 0.4),
            avg_progress: 58,
          }))
          setCourses(mappedCourses)
        } else {
          setCourses([])
        }
      }
    } catch (err) {
      console.warn('Error loading courses:', err)
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const stats = useMemo(() => {
    const total = courses.length
    const published = courses.filter((c) => c.is_published).length
    const totalStudents =
      totalStudentsCount > 0
        ? totalStudentsCount
        : courses.reduce((acc, c) => acc + (c.enrollments || 0), 0)

    const scores = courses.map((c) => c.target_score).filter(Boolean)
    const minScore = scores.length ? Math.min(...scores) : 450
    const maxScore = scores.length ? Math.max(...scores) : 850
    const targetBand = scores.length > 1 && minScore !== maxScore ? `${minScore} - ${maxScore}+` : `${maxScore || 750}+`

    return { total, published, totalStudents, targetBand }
  }, [courses, totalStudentsCount])

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCategory = filterCategory === 'ALL' || c.category === filterCategory
      const matchLevel = filterLevel === 'ALL' || c.level === filterLevel
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'PUBLISHED' && c.is_published) ||
        (filterStatus === 'DRAFT' && !c.is_published)

      return matchSearch && matchCategory && matchLevel && matchStatus
    })
  }, [courses, searchQuery, filterCategory, filterLevel, filterStatus])

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCourses.slice(start, start + itemsPerPage)
  }, [filteredCourses, currentPage, itemsPerPage])

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterCategory('ALL')
    setFilterLevel('ALL')
    setFilterStatus('ALL')
    setCurrentPage(1)
  }

  const handleEditCourse = (courseId: string) => {
    setActiveNavItem(`course-edit:${courseId}`)
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId)
      setCourses((prev) => prev.filter((c) => c.id !== courseId))
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
    })
  }, [isVi, can])

  return (
    <div className="space-y-6">
      <CourseStatsOverview stats={stats} />

      <DataTable<Course>
        title="Quản Lý Khóa Học & Lộ Trình"
        subtitle="Soạn thảo giáo trình, modules bài giảng video, bài tập và hệ thống ngân hàng câu hỏi"
        isLoading={isLoading}
        columns={columns}
        data={paginatedCourses}
        rowKey={(c) => c.id}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        renderGridItem={(course) => (
          <CourseGridCard
            course={course}
            isVi={isVi}
            canEdit={can('PUT', '/courses/:id')}
            canDelete={can('DELETE', '/courses/:id')}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
          />
        )}
        onResetFilters={handleResetFilters}
        extraActions={
          <>
            <button
              onClick={fetchCourses}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
              <span>Làm mới</span>
            </button>
            <Can do="POST" on="/courses">
              <button
                onClick={() => setActiveNavItem('course-create')}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm khóa học mới</span>
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
            filterLevel={filterLevel}
            onLevelChange={setFilterLevel}
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
        }}
      />
    </div>
  )
}
