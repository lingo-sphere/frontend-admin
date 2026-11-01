// Component bảng danh sách khóa học và dự án Projects Table theo phong cách Vuexy Admin.

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, MoreVertical, BookOpen, Layers, CheckCircle2 } from 'lucide-react'
import type { Course } from '@/features/courses/schemas/course.schema'

interface VuexyProjectsTableCardProps {
  courses: Course[]
  isLoading?: boolean
}

export function VuexyProjectsTableCard({ courses, isLoading = false }: VuexyProjectsTableCardProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

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

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCourses.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedCourses.map((c) => c._id || c.id || ''))
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

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={paginatedCourses.length > 0 && selectedIds.length === paginatedCourses.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
                const leaderName = course.author_name || 'LingoSphere Instructor'

                return (
                  <tr
                    key={id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-xs">
                            {course.title}
                          </p>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {course.category || 'TOEIC'} • {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                          {leaderName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{leaderName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center -space-x-1.5">
                        <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
                          TA
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-slate-900">
                          AI
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-slate-900">
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

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/courses')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Quản lý khóa học"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
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
    </div>
  )
}

