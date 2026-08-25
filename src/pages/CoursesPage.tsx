import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Library,
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Clock,
  RotateCcw,
  Sparkles,
  X,
  Eye,
  CheckCircle,
} from 'lucide-react'
import {
  categoryLabels,
  levelLabels,
  type Course,
} from '@/data/courses-data'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { TableControls, type TableDensity, type ColumnOption } from '@/components/common/TableControls'
import { useAdminStore } from '@/store/admin-store'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'

type FilterCategory = 'ALL' | 'TOEIC_LISTENING' | 'TOEIC_READING' | 'GRAMMAR' | 'VOCABULARY'
type FilterLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT'

export function CoursesPage() {
  const { t, i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [density, setDensity] = useState<TableDensity>('middle')

  // Column Visibility Controls
  const [columns, setColumns] = useState<ColumnOption[]>([
    { key: 'info', label: 'Khóa học & Lộ trình', visible: true },
    { key: 'category', label: 'Danh mục & Trình độ', visible: true },
    { key: 'stats', label: 'Số bài & Học viên', visible: true },
    { key: 'price', label: 'Học phí', visible: true },
    { key: 'status', label: 'Trạng thái', visible: true },
    { key: 'actions', label: 'Thao tác', visible: true },
  ])

  const isColVisible = (key: string) => columns.find((c) => c.key === key)?.visible ?? true

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Delete State
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const data = await courseService.getAllCourses()
      if (data && data.length > 0) {
        const mappedCourses: Course[] = data.map((c: any) => ({
          id: c._id || c.id,
          title: c.title,
          slug: c.slug || '',
          description: c.description || '',
          thumbnail_url: c.thumbnail_url || '',
          target_score: c.target_score || 500,
          category: c.category || 'TOEIC_LISTENING',
          level: c.level || 'BEGINNER',
          total_modules: c.modules?.length || 1,
          total_lessons: (c.modules || []).reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 1,
          price: c.price || 0,
          is_published: c.is_published ?? true,
          author_id: c.author_id || '',
          author_name: c.author_name || 'LingoSphere Instructor',
          created_at: c.created_at || new Date().toISOString(),
          enrollments: c.students_count || 120,
          completed_count: Math.round((c.students_count || 120) * 0.4),
          avg_progress: 58,
        }))
        setCourses(mappedCourses)
      }
    } catch (err) {
      console.warn('Using default course data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  // Filter Courses
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

  // Paginated Courses
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

  // Row padding by density
  const getCellPadding = () => {
    if (density === 'compact') return 'py-2 px-4'
    if (density === 'comfortable') return 'py-5 px-4'
    return 'py-3.5 px-4'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Quản Lý Khóa Học & Lộ Trình
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Soạn thảo giáo trình, modules bài giảng video, bài tập và hệ thống ngân hàng câu hỏi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCourses}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-500' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setActiveNavItem('course-create')}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Khóa Học Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Table Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus-within:border-indigo-500 transition-all">
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
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả danh mục</option>
            <option value="TOEIC_LISTENING">TOEIC Listening</option>
            <option value="TOEIC_READING">TOEIC Reading</option>
            <option value="GRAMMAR">Ngữ pháp (Grammar)</option>
            <option value="VOCABULARY">Từ vựng (Vocabulary)</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trình độ</option>
            <option value="BEGINNER">Sơ cấp (Beginner)</option>
            <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
            <option value="ADVANCED">Nâng cao (Advanced)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản (Public)</option>
            <option value="DRAFT">Bản nháp (Draft)</option>
          </select>
        </div>

        {/* Table Controls (Density, Columns, Grid/Table switcher, Reset) */}
        <TableControls
          density={density}
          onDensityChange={setDensity}
          columns={columns}
          onColumnsChange={setColumns}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
          totalCount={filteredCourses.length}
        />
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col group"
            >
              <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                    {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      course.is_published
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md'
                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30 backdrop-blur-md'
                    }`}
                  >
                    {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400">Mục tiêu</p>
                      <p className="text-xs font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">{course.target_score}+</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Chương / Bài</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {course.total_modules}m · {course.total_lessons}b
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Học viên</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{course.enrollments}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                    {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveNavItem(`course-edit:${course.id}`)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Chỉnh sửa khóa học"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCourseId(course.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-500/20 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Xóa khóa học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-semibold">
                  {isColVisible('info') && <th className="py-3.5 px-4">Khóa học & Lộ trình</th>}
                  {isColVisible('category') && <th className="py-3.5 px-4">Danh mục & Trình độ</th>}
                  {isColVisible('stats') && <th className="py-3.5 px-4">Số bài & Học viên</th>}
                  {isColVisible('price') && <th className="py-3.5 px-4">Học phí</th>}
                  {isColVisible('status') && <th className="py-3.5 px-4">Trạng thái</th>}
                  {isColVisible('actions') && <th className="py-3.5 px-4 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                {paginatedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={columns.filter((c) => c.visible).length} className="py-12 text-center text-slate-400">
                      Không tìm thấy khóa học nào phù hợp
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      {isColVisible('info') && (
                        <td className={getCellPadding()}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                              {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">{course.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {course.description}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}

                      {isColVisible('category') && (
                        <td className={getCellPadding()}>
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                              {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
                            </span>
                            <p className="text-[11px] text-slate-500">
                              {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
                            </p>
                          </div>
                        </td>
                      )}

                      {isColVisible('stats') && (
                        <td className={getCellPadding()}>
                          <p className="font-semibold text-slate-900 dark:text-slate-200">
                            {course.total_modules} chương · {course.total_lessons} video
                          </p>
                          <p className="text-[11px] text-slate-500">{course.enrollments} học viên</p>
                        </td>
                      )}

                      {isColVisible('price') && (
                        <td className={getCellPadding()}>
                          <span className="font-extrabold text-teal-600 dark:text-teal-400">
                            {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                          </span>
                        </td>
                      )}

                      {isColVisible('status') && (
                        <td className={getCellPadding()}>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              course.is_published
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </td>
                      )}

                      {isColVisible('actions') && (
                        <td className={`${getCellPadding()} text-right`}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveNavItem(`course-edit:${course.id}`)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Chỉnh sửa khóa học"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteCourseId(course.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-500/20 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Xóa khóa học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredCourses.length / itemsPerPage) || 1}
        totalItems={filteredCourses.length}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(limit: number) => {
          setItemsPerPage(limit)
          setCurrentPage(1)
        }}
      />

      {/* Delete Course Modal */}
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
