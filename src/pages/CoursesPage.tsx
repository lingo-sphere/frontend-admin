import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  X,
  RotateCcw,
  LayoutGrid,
  List,
  Target,
} from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'
import {
  mockCourses,
  formatPrice,
  categoryLabels,
  levelLabels,
  type Course,
} from '@/data/courses-data'
import { useAdminStore } from '@/store/admin-store'

type FilterCategory = 'ALL' | 'TOEIC_LISTENING' | 'TOEIC_READING' | 'GRAMMAR' | 'VOCABULARY'
type FilterLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT'
type ViewMode = 'grid' | 'table'

export function CoursesPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // Delete modal
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const realCourses = await courseService.getAllCourses()
      if (realCourses && realCourses.length > 0) {
        const mappedCourses: Course[] = realCourses.map((c) => ({
          id: c._id,
          title: c.title,
          slug: c.slug || c._id,
          description: c.description || '',
          category: (c.category as 'TOEIC_LISTENING' | 'TOEIC_READING' | 'GRAMMAR' | 'VOCABULARY') || 'TOEIC_LISTENING',
          level: (c.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') || 'BEGINNER',
          target_score: c.target_score || 500,
          price: c.price || 0,
          thumbnail_url: c.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
          author_id: c.author_id || 'admin',
          author_name: 'LingoSphere Master',
          total_modules: c.modules?.length || 4,
          total_lessons: c.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 12,
          is_published: c.is_published !== false && c.approval_status !== 'DRAFT',
          created_at: c.created_at || new Date().toISOString(),
          enrollments: c.students_count || 128,
          completed_count: Math.floor((c.students_count || 128) * 0.4),
          avg_progress: 68,
        }))
        setCourses(mappedCourses)
      }
    } catch (err) {
      console.warn('Using local mock courses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'ALL' || course.category === filterCategory
      const matchesLevel = filterLevel === 'ALL' || course.level === filterLevel
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'PUBLISHED' ? course.is_published : !course.is_published)

      return matchesSearch && matchesCategory && matchesLevel && matchesStatus
    })
  }, [courses, searchQuery, filterCategory, filterLevel, filterStatus])

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCourses.slice(start, start + pageSize)
  }, [filteredCourses, currentPage, pageSize])

  const totalPages = Math.ceil(filteredCourses.length / pageSize)

  const handleDeleteConfirm = async () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Quản Lý Khóa Học & Lộ Trình
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Soạn thảo giáo trình, modules bài giảng video, bài tập và hệ thống ngân hàng câu hỏi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCourses}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
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

      {/* Filter & Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-teal-500 transition-all">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
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
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trình độ</option>
            <option value="BEGINNER">Sơ cấp (Beginner)</option>
            <option value="INTERMEDIATE">Trung cấp (Intermediate)</option>
            <option value="ADVANCED">Nâng cao (Advanced)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản (Public)</option>
            <option value="DRAFT">Bản nháp (Draft)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dạng lưới"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dạng bảng"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-teal-300 border border-teal-500/30">
                      {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                      {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
                    </span>
                  </div>
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      course.is_published
                        ? 'bg-emerald-500/80 text-white backdrop-blur-md'
                        : 'bg-slate-800/80 text-slate-300 backdrop-blur-md'
                    }`}
                  >
                    {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3.5 my-3.5 border-y border-slate-800 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500">Mục tiêu</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{course.target_score}+</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Chương / Bài</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">
                        {course.total_modules}m · {course.total_lessons}b
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Học viên</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{course.enrollments}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between">
                <span className="text-sm font-extrabold text-teal-400">{formatPrice(course.price)}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveNavItem(`course-edit:${course.id}`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Chỉnh sửa giáo trình"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCourseId(course.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Xóa khóa học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                  <th className="py-3.5 px-4">Khóa học</th>
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4">Trình độ</th>
                  <th className="py-3.5 px-4">Giá tiền</th>
                  <th className="py-3.5 px-4">Học viên</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-200">
                {paginatedCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-12 h-9 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-100">{course.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {course.total_modules} chương · {course.total_lessons} bài học
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-teal-400 font-medium">
                        {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-amber-400 font-medium">
                        {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{formatPrice(course.price)}</td>
                    <td className="py-3.5 px-4 text-slate-300">{course.enrollments}</td>
                    <td className="py-3.5 px-4">
                      {course.is_published ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveNavItem(`course-edit:${course.id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCourseId(course.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={filteredCourses.length}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteCourseId)}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa khóa học này?"
        description="Khóa học và toàn bộ danh sách bài giảng, video liên quan sẽ bị gỡ khỏi hệ thống."
        confirmText="Xóa khóa học"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
