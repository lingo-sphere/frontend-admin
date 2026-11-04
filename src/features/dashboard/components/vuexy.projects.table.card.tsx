// Component bảng danh sách khóa học và đội ngũ giảng dạy theo phong cách Vuexy Admin.
import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  BookOpen,
  Layers,
  Eye,
  X,
  ExternalLink,
  Users,
  GraduationCap,
} from 'lucide-react'
import { resolveMediaUrl, IMAGE_FALLBACK_PLACEHOLDER } from '@/lib/media.utils'
import type { Course } from '@/features/courses/schemas/course.schema'

interface VuexyProjectsTableCardProps {
  courses: Course[]
  isLoading?: boolean
}

interface ImagePreviewState {
  url: string
  title: string
}

export function VuexyProjectsTableCard({ courses, isLoading = false }: VuexyProjectsTableCardProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<ImagePreviewState | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const masterCheckboxRef = useRef<HTMLInputElement>(null)

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const title = c.title?.toLowerCase() || ''
      const author = c.author_name?.toLowerCase() || ''
      const search = searchTerm.toLowerCase()
      return title.includes(search) || author.includes(search)
    })
  }, [courses, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCourses.slice(start, start + pageSize)
  }, [filteredCourses, currentPage, pageSize])

  const paginatedIds = useMemo(() => {
    return paginatedCourses.map((c) => c._id || c.id || '').filter(Boolean)
  }, [paginatedCourses])

  const isAllSelectedOnPage =
    paginatedIds.length > 0 && paginatedIds.every((id) => selectedIds.includes(id))
  const isSomeSelectedOnPage =
    paginatedIds.some((id) => selectedIds.includes(id)) && !isAllSelectedOnPage

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate = isSomeSelectedOnPage
    }
  }, [isSomeSelectedOnPage])

  const toggleSelectAll = () => {
    if (isAllSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedIds])))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Danh Sách Khóa Học & Đội Ngũ Giảng Dạy
          </h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý tiến độ xuất bản và phân công trợ giảng
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="px-5 py-2.5 bg-indigo-50/90 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[11px]">
              {selectedIds.length}
            </span>
            <span className="font-semibold">khóa học đang được chọn</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Quản lý khóa học</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/courses/learners')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Học viên & Tiến độ</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/courses/exams')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Đề thi</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bỏ chọn</span>
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  ref={masterCheckboxRef}
                  type="checkbox"
                  checked={isAllSelectedOnPage}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4">Khóa Học / Dự Án</th>
              <th className="py-3.5 px-4">Giảng Viên Phụ Trách</th>
              <th className="py-3.5 px-4">Trợ Giảng / Nhóm</th>
              <th className="py-3.5 px-4 min-w-[140px]">Tiến Độ Hoàn Thiện</th>
              <th className="py-3.5 px-4 text-center w-20">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Đang tải danh sách khóa học...
                </td>
              </tr>
            ) : paginatedCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Không tìm thấy khóa học nào phù hợp.
                </td>
              </tr>
            ) : (
              paginatedCourses.map((course) => {
                const id = course._id || course.id || ''
                const isSelected = selectedIds.includes(id)
                const isPublished = course.is_published || course.approval_status === 'PUBLISHED'
                const progressValue = isPublished ? 100 : 65
                const leaderName = course.author_name || 'Đội ngũ Giảng viên LingoSphere'
                const resolvedImageUrl = course.thumbnail_url ? resolveMediaUrl(course.thumbnail_url) : ''

                return (
                  <tr
                    key={id}
                    onClick={() => toggleSelectOne(id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-inset ring-indigo-500/20'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 group/thumb bg-slate-100 dark:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (resolvedImageUrl) {
                              setPreviewImage({ url: resolvedImageUrl, title: course.title })
                            }
                          }}
                          title={resolvedImageUrl ? 'Nhấp để xem ảnh đầy đủ' : course.title}
                        >
                          {resolvedImageUrl ? (
                            <>
                              <img
                                src={resolvedImageUrl}
                                alt={course.title}
                                onError={(e) => {
                                  ;(e.currentTarget as HTMLImageElement).src = IMAGE_FALLBACK_PLACEHOLDER
                                }}
                                className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div>
                          <p
                            className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-xs hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('/courses')
                            }}
                          >
                            {course.title}
                          </p>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Layers className="w-3 h-3" />
                            {course.category || 'TOEIC'} •{' '}
                            {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200 shrink-0">
                          {leaderName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                          {leaderName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center -space-x-1.5">
                        <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900 shadow-xs">
                          TA
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900 shadow-xs">
                          AI
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-slate-900 shadow-xs">
                          +2
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPublished ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 min-w-[32px]">
                          {progressValue}%
                        </span>
                      </div>
                    </td>

                    <td
                      className="py-3 px-4 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === id ? null : id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Tùy chọn"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === id && (
                        <div className="absolute right-4 top-10 z-30 w-44 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl text-left text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              navigate('/courses')
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Quản lý bài giảng</span>
                          </button>
                          {resolvedImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                setPreviewImage({ url: resolvedImageUrl, title: course.title })
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                            >
                              <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              <span>Xem ảnh bìa</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              navigate('/courses/learners')
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Tiến độ học viên</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
          {Math.min(currentPage * pageSize, filteredCourses.length)} trong số {filteredCourses.length} khóa học
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 py-1 font-semibold text-slate-700 dark:text-slate-200">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white dark:bg-[#2f3349] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h6 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                  {previewImage.title}
                </h6>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-900/5 dark:bg-black/20 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-md"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Ảnh bìa khóa học chất lượng cao</span>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                <span>Mở trong tab mới</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
