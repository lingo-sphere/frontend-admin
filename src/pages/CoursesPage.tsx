import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  RotateCcw,
  X,
  Layers,
  Users,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Target,
  TrendingUp,
} from 'lucide-react'
import {
  categoryLabels,
  levelLabels,
  type Course,
} from '@/data/courses-data'
import type { Course as ApiCourse, CourseModule as ApiCourseModule } from '@/types/api.types'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { useAdminStore } from '@/store/admin-store'
import { usePermission } from '@/hooks/use-permission'
import { Can } from '@/components/common/Can'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'

type FilterCategory = 'ALL' | 'TOEIC_LISTENING' | 'TOEIC_READING' | 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS' | 'GRAMMAR' | 'VOCABULARY'
type FilterLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT'

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'TOEIC_LISTENING':
      return 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/60'
    case 'TOEIC_READING':
      return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60'
    case 'TOEIC_2_SKILLS':
    case 'TOEIC_4_SKILLS':
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
    case 'GRAMMAR':
      return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
    case 'VOCABULARY':
      return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60'
    default:
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60'
  }
}

const getLevelBadgeClass = (level: string) => {
  switch (level) {
    case 'BEGINNER':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50'
    case 'INTERMEDIATE':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50'
    case 'ADVANCED':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50'
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
}

export function CoursesPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const { can } = usePermission()

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const res = await courseService.getAllCourses({ pageSize: 50 })
      const data: ApiCourse[] = Array.isArray(res) ? res : (res?.result || [])
      if (data && data.length > 0) {
        const mappedCourses: Course[] = data.map((c: ApiCourse) => ({
          id: c._id || '',
          title: c.title,
          slug: c.slug || '',
          description: c.description || '',
          thumbnail_url: c.thumbnail_url || '',
          target_score: c.target_score || 500,
          category: (c.category as Course['category']) || 'TOEIC_LISTENING',
          level: (c.level as Course['level']) || 'BEGINNER',
          total_modules: c.modules?.length || 1,
          total_lessons: (c.modules || []).reduce((acc: number, m: ApiCourseModule) => acc + (m.lessons?.length || 0), 0) || 1,
          price: c.price || 0,
          is_published: c.is_published ?? true,
          author_id: c.author_id || '',
          author_name: 'LingoSphere Instructor',
          created_at: c.created_at || new Date().toISOString(),
          enrollments: c.students_count || 120,
          completed_count: Math.round((c.students_count || 120) * 0.4),
          avg_progress: 58,
        }))
        setCourses(mappedCourses)
      } else {
        setCourses([])
      }
    } catch (err) {
      console.warn('Error loading courses:', err)
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const stats = useMemo(() => {
    const total = courses.length
    const published = courses.filter((c) => c.is_published).length
    const totalStudents = courses.reduce((acc, c) => acc + (c.enrollments || 0), 0)
    const avgScore = courses.length ? Math.round(courses.reduce((acc, c) => acc + (c.target_score || 500), 0) / courses.length) : 650
    return { total, published, totalStudents, avgScore }
  }, [courses])

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

  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return
    setIsDeleting(true)
    try {
      await courseService.deleteCourse(deleteCourseId)
      setCourses((prev) => prev.filter((c) => c.id !== deleteCourseId))
      toast.success('Đã xóa khóa học thành công!')
    } catch {
      toast.error('Xóa khóa học thất bại')
    } finally {
      setIsDeleting(false)
      setDeleteCourseId(null)
    }
  }

  const columns: DataTableColumn<Course>[] = [
    {
      key: 'info',
      title: 'Khóa học & Lộ trình',
      render: (course) => (
        <div className="flex items-center gap-3.5 py-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative group">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/30">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1" onClick={() => setActiveNavItem(`course-edit:${course.id}`)}>
                {course.title}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-md">
              {course.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                <Target className="w-3 h-3" /> Target {course.target_score}+
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Danh mục & Trình độ',
      render: (course) => (
        <div className="space-y-1.5 py-1">
          <div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap ${getCategoryBadgeClass(course.category)}`}>
              {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
            </span>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap ${getLevelBadgeClass(course.level)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'stats',
      title: 'Số bài & Học viên',
      render: (course) => (
        <div className="space-y-1 py-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-750 dark:text-slate-200 whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{course.total_modules} chương · {course.total_lessons} video</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{course.enrollments.toLocaleString('vi-VN')} học viên</span>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      title: 'Học phí',
      render: (course) => (
        <div className="whitespace-nowrap py-1">
          <span className="inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
            {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (course) => (
        <div className="whitespace-nowrap py-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              course.is_published
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${course.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right',
      render: (course) => (
        <div className="flex items-center justify-end gap-1.5 py-1">
          {can('PUT', '/courses/:id') && (
            <button
              onClick={() => setActiveNavItem(`course-edit:${course.id}`)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/80 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
              title="Chỉnh sửa khóa học"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {can('DELETE', '/courses/:id') && (
            <button
              onClick={() => setDeleteCourseId(course.id)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 hover:text-rose-500 transition-all cursor-pointer shadow-2xs"
              title="Xóa khóa học"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const renderGridCard = (course: Course) => (
    <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all flex flex-col group h-full">
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
            <BookOpen className="w-8 h-8 text-indigo-500/70" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md shadow-xs ${getCategoryBadgeClass(course.category)}`}>
            {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md shadow-xs ${getLevelBadgeClass(course.level)}`}>
            {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs ${
              course.is_published
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${course.is_published ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => setActiveNavItem(`course-edit:${course.id}`)}>
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
            {course.description}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Mục tiêu</p>
              <p className="text-xs font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">{course.target_score}+</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Chương / Bài</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                {course.total_modules}m · {course.total_lessons}b
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Học viên</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{course.enrollments.toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
            {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
          </span>

          <div className="flex items-center gap-1.5">
            {can('PUT', '/courses/:id') && (
              <button
                onClick={() => setActiveNavItem(`course-edit:${course.id}`)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                title="Chỉnh sửa khóa học"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {can('DELETE', '/courses/:id') && (
              <button
                onClick={() => setDeleteCourseId(course.id)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                title="Xóa khóa học"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Top Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Khóa Học</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Học Viên</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stats.totalStudents.toLocaleString('vi-VN')}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đang Phát Hành</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.published}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mục Tiêu TOEIC</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{stats.avgScore}+</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      <DataTable<Course>
        title="Quản Lý Khóa Học & Lộ Trình"
        subtitle="Soạn thảo giáo trình, modules bài giảng video, bài tập và hệ thống ngân hàng câu hỏi"
        isLoading={isLoading}
        columns={columns}
        data={paginatedCourses}
        rowKey={(c) => c.id}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        renderGridItem={renderGridCard}
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
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Khóa Học Mới</span>
              </button>
            </Can>
          </>
        }
        filterSlot={
          <>
            <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full bg-transparent border-0 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 p-0 text-xs focus:ring-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">Tất cả danh mục</option>
              <option value="TOEIC_LISTENING">TOEIC Listening</option>
              <option value="TOEIC_READING">TOEIC Reading</option>
              <option value="TOEIC_2_SKILLS">TOEIC 2 Kỹ Năng</option>
              <option value="TOEIC_4_SKILLS">TOEIC 4 Kỹ Năng</option>
              <option value="GRAMMAR">Ngữ pháp (Grammar)</option>
              <option value="VOCABULARY">Từ vựng (Vocabulary)</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">Tất cả trình độ</option>
              <option value="BEGINNER">Sơ cấp (Beginner)</option>
              <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
              <option value="ADVANCED">Nâng cao (Advanced)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản (Public)</option>
              <option value="DRAFT">Bản nháp (Draft)</option>
            </select>
          </>
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

      <ConfirmModal
        isOpen={Boolean(deleteCourseId)}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteCourse}
        title="Xóa khóa học này?"
        description="Khóa học cùng toàn bộ chương và bài học video liên quan sẽ bị xóa khỏi hệ thống."
        confirmText="Xóa khóa học"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
