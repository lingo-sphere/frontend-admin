import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Download,
  Plus,
  Eye,
  Edit2,
  Copy,
  Trash2,
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  X,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import {
  mockCourses,
  formatPrice,
  formatDate,
  categoryLabels,
  categoryColors,
  levelLabels,
  levelColors,
  type Course,
} from '@/data/courses-data'
import { useAdminStore } from '@/store/admin-store'

type FilterCategory = 'ALL' | 'TOEIC_LISTENING' | 'TOEIC_READING' | 'GRAMMAR' | 'VOCABULARY'
type FilterLevel = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
type FilterStatus = 'ALL' | 'PUBLISHED' | 'DRAFT'
type SortOption = 'latest' | 'oldest' | 'enrollments' | 'price_desc' | 'price_asc' | 'title'
type ViewMode = 'grid' | 'table'

export function CoursesPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [courses] = useState<Course[]>(mockCourses)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL')
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [filterJoin, setFilterJoin] = useState<string>('ALL')
  const [sortOption, setSortOption] = useState<SortOption>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilterCategory('ALL')
    setFilterLevel('ALL')
    setFilterStatus('ALL')
    setFilterJoin('ALL')
    setSortOption('latest')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filterCategory !== 'ALL' ||
    filterLevel !== 'ALL' ||
    filterStatus !== 'ALL' ||
    filterJoin !== 'ALL' ||
    searchQuery !== '' ||
    sortOption !== 'latest'

  const filteredCourses = useMemo(() => {
    let result = [...courses]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.author_name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
    }

    if (filterCategory !== 'ALL') {
      result = result.filter(c => c.category === filterCategory)
    }

    if (filterLevel !== 'ALL') {
      result = result.filter(c => c.level === filterLevel)
    }

    if (filterStatus === 'PUBLISHED') {
      result = result.filter(c => c.is_published)
    } else if (filterStatus === 'DRAFT') {
      result = result.filter(c => !c.is_published)
    }

    if (filterJoin !== 'ALL' && filterJoin.includes('_')) {
      const [fromStr, toStr] = filterJoin.split('_')
      const from = fromStr && fromStr.trim() ? new Date(fromStr + 'T00:00:00') : null
      const to = toStr && toStr.trim() ? new Date(toStr + 'T23:59:59') : null
      result = result.filter(c => {
        const d = new Date(c.created_at)
        if (from && !isNaN(from.getTime()) && d < from) return false
        if (to && !isNaN(to.getTime()) && d > to) return false
        return true
      })
    }

    switch (sortOption) {
      case 'latest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'enrollments':
        result.sort((a, b) => b.enrollments - a.enrollments)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [courses, searchQuery, filterCategory, filterLevel, filterStatus, filterJoin, sortOption])

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCourses.slice(start, start + pageSize)
  }, [filteredCourses, currentPage, pageSize])

  const stats = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter(c => c.is_published).length,
      draft: courses.filter(c => !c.is_published).length,
      totalEnrollments: courses.reduce((sum, c) => sum + c.enrollments, 0),
    }
  }, [courses])

  const handleExportCsv = () => {
    const headers = ['id', 'title', 'category', 'level', 'price', 'is_published', 'enrollments', 'created_at']
    const rows = filteredCourses.map(c => [
      String(c.id),
      c.title,
      c.category,
      c.level,
      c.price,
      c.is_published ? 'PUBLISHED' : 'DRAFT',
      c.enrollments,
      c.created_at,
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `courses-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="page-content">
      
      <div className="page-heading">
        <div>
          <h1 className="page-title">{isVi ? 'Khóa học' : 'Courses'}</h1>
          <p className="page-subtitle">
            {isVi ? 'Quản lý khóa học và nội dung học tập' : 'Manage courses and learning content'}
          </p>
        </div>
      </div>

      <div className="courses-stats-grid">
        <div className="courses-stat-card">
          <div className="stat-icon total">
            <BookOpen />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">{isVi ? 'Tổng khóa học' : 'Total Courses'}</span>
          </div>
        </div>
        <div className="courses-stat-card">
          <div className="stat-icon published">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.published}</span>
            <span className="stat-label">{isVi ? 'Đã xuất bản' : 'Published'}</span>
          </div>
        </div>
        <div className="courses-stat-card">
          <div className="stat-icon draft">
            <XCircle />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.draft}</span>
            <span className="stat-label">{isVi ? 'Bản nháp' : 'Draft'}</span>
          </div>
        </div>
        <div className="courses-stat-card">
          <div className="stat-icon users">
            <Users />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalEnrollments.toLocaleString()}</span>
            <span className="stat-label">{isVi ? 'Lượt ghi danh' : 'Enrollments'}</span>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="users-search">
          <Search className="search-icon" />
          <input
            type="text"
            className="users-search-input"
            placeholder={isVi ? 'Tìm kiếm khóa học...' : 'Search courses...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X />
            </button>
          )}
        </div>

        <div className="toolbar-date-range">
          <span className="date-range-label">{isVi ? 'Ngày tạo:' : 'Created:'}</span>
          <div className="toolbar-date-inputs">
            <input
              type="date"
              className="toolbar-date-input"
              value={filterJoin && filterJoin !== 'ALL' ? filterJoin.split('_')[0] || '' : ''}
              onChange={e => {
                const to = filterJoin && filterJoin !== 'ALL' ? filterJoin.split('_')[1] || '' : ''
                const from = e.target.value
                setFilterJoin(from || to ? `${from}_${to}` : 'ALL')
                setCurrentPage(1)
              }}
            />
            <span className="date-range-sep">~</span>
            <input
              type="date"
              className="toolbar-date-input"
              value={filterJoin && filterJoin !== 'ALL' ? filterJoin.split('_')[1] || '' : ''}
              onChange={e => {
                const from = filterJoin && filterJoin !== 'ALL' ? filterJoin.split('_')[0] || '' : ''
                const to = e.target.value
                setFilterJoin(from || to ? `${from}_${to}` : 'ALL')
                setCurrentPage(1)
              }}
            />
          </div>
        </div>
      </div>

      <div className="admin-table-actions">
        <h2 className="admin-table-title">
          {isVi ? 'Danh sách khóa học' : 'Course List'}
          <span className="admin-table-count">{filteredCourses.length}</span>
        </h2>
        <div className="admin-table-action-buttons">
          
          <select
            className="admin-select"
            value={filterCategory}
            onChange={e => {
              setFilterCategory(e.target.value as FilterCategory)
              setCurrentPage(1)
            }}
          >
            <option value="ALL">{isVi ? 'Tất cả danh mục' : 'All Categories'}</option>
            <option value="TOEIC_LISTENING">{categoryLabels.TOEIC_LISTENING?.[isVi ? 'vi' : 'en']}</option>
            <option value="TOEIC_READING">{categoryLabels.TOEIC_READING?.[isVi ? 'vi' : 'en']}</option>
            <option value="GRAMMAR">{categoryLabels.GRAMMAR?.[isVi ? 'vi' : 'en']}</option>
            <option value="VOCABULARY">{categoryLabels.VOCABULARY?.[isVi ? 'vi' : 'en']}</option>
          </select>

          <select
            className="admin-select"
            value={filterLevel}
            onChange={e => {
              setFilterLevel(e.target.value as FilterLevel)
              setCurrentPage(1)
            }}
          >
            <option value="ALL">{isVi ? 'Tất cả cấp độ' : 'All Levels'}</option>
            <option value="BEGINNER">{levelLabels.BEGINNER?.[isVi ? 'vi' : 'en']}</option>
            <option value="INTERMEDIATE">{levelLabels.INTERMEDIATE?.[isVi ? 'vi' : 'en']}</option>
            <option value="ADVANCED">{levelLabels.ADVANCED?.[isVi ? 'vi' : 'en']}</option>
          </select>

          <select
            className="admin-select"
            value={filterStatus}
            onChange={e => {
              setFilterStatus(e.target.value as FilterStatus)
              setCurrentPage(1)
            }}
          >
            <option value="ALL">{isVi ? 'Tất cả trạng thái' : 'All Status'}</option>
            <option value="PUBLISHED">{isVi ? 'Đã xuất bản' : 'Published'}</option>
            <option value="DRAFT">{isVi ? 'Bản nháp' : 'Draft'}</option>
          </select>

          <select
            className="admin-select"
            value={sortOption}
            onChange={e => {
              setSortOption(e.target.value as SortOption)
              setCurrentPage(1)
            }}
          >
            <option value="latest">{isVi ? 'Sắp xếp: Mới nhất' : 'Sort: Latest'}</option>
            <option value="oldest">{isVi ? 'Sắp xếp: Cũ nhất' : 'Sort: Oldest'}</option>
            <option value="enrollments">{isVi ? 'Nhiều học viên nhất' : 'Most Enrolled'}</option>
            <option value="price_desc">{isVi ? 'Giá giảm dần' : 'Price High-Low'}</option>
            <option value="price_asc">{isVi ? 'Giá tăng dần' : 'Price Low-High'}</option>
            <option value="title">{isVi ? 'Tên A-Z' : 'Title A-Z'}</option>
          </select>

          <button type="button" className="table-ghost-btn" onClick={handleExportCsv}>
            <Download />
            {isVi ? 'Xuất CSV' : 'Export'}
          </button>

          <button
            type="button"
            className="table-ghost-btn"
            onClick={handleReset}
            title={isVi ? 'Đặt lại tất cả' : 'Reset all'}
          >
            <RotateCcw />
            {isVi ? 'Đặt lại' : 'Reset'}
          </button>

          <div className="view-mode-toggle" style={{ display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 2 }}>
            <button
              type="button"
              className={`table-ghost-btn${viewMode === 'grid' ? ' active' : ''}`}
              style={{ padding: '4px 8px', borderRadius: 6 }}
              onClick={() => setViewMode('grid')}
              title={isVi ? 'Xem dạng Thẻ' : 'Card View'}
            >
              <LayoutGrid style={{ width: 15, height: 15 }} />
            </button>
            <button
              type="button"
              className={`table-ghost-btn${viewMode === 'table' ? ' active' : ''}`}
              style={{ padding: '4px 8px', borderRadius: 6 }}
              onClick={() => setViewMode('table')}
              title={isVi ? 'Xem dạng Bảng' : 'Table View'}
            >
              <List style={{ width: 15, height: 15 }} />
            </button>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => setActiveNavItem('course-form')}
          >
            <Plus />
            {isVi ? 'Thêm khóa học' : 'Add Course'}
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="courses-grid">
          {paginatedCourses.map(course => (
            <div key={course.id} className={`course-card${!course.is_published ? ' draft' : ''}`}>
              <div className="course-thumbnail">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <BookOpen />
                  </div>
                )}
                {!course.is_published && (
                  <div className="draft-overlay">
                    <span>{isVi ? 'Bản nháp' : 'Draft'}</span>
                  </div>
                )}
                <div className="course-badges">
                  <span
                    className="category-badge"
                    style={{
                      background: categoryColors[course.category]?.bg,
                      color: categoryColors[course.category]?.text,
                    }}
                  >
                    {categoryLabels[course.category]?.[isVi ? 'vi' : 'en']}
                  </span>
                </div>
              </div>

              <div className="course-content">
                <div className="course-header">
                  <h3 className="course-title">{course.title}</h3>
                  <div className="course-meta">
                    <span
                      className="level-badge"
                      style={{
                        background: levelColors[course.level]?.bg,
                        color: levelColors[course.level]?.text,
                      }}
                    >
                      {levelLabels[course.level]?.[isVi ? 'vi' : 'en']}
                    </span>
                    <span className="target-score">
                      {isVi ? 'Mục tiêu:' : 'Target:'} {course.target_score}
                    </span>
                  </div>
                </div>

                <p className="course-description">{course.description}</p>

                <div className="course-stats">
                  <div className="course-stat">
                    <BookOpen className="stat-icon" />
                    <span>{course.total_modules} modules, {course.total_lessons} {isVi ? 'bài' : 'lessons'}</span>
                  </div>
                  <div className="course-stat">
                    <Users className="stat-icon" />
                    <span>{course.enrollments.toLocaleString()} {isVi ? 'học viên' : 'students'}</span>
                  </div>
                </div>

                <div className="course-footer">
                  <div className="course-author">
                    <span className="author-name">{course.author_name}</span>
                    <span className="course-date">{formatDate(course.created_at)}</span>
                  </div>
                  <div className="course-price">
                    {formatPrice(course.price)}
                  </div>
                </div>
              </div>

              <div className="course-actions">
                <button className="course-action-btn" title={isVi ? 'Xem' : 'View'}>
                  <Eye />
                </button>
                <button className="course-action-btn" title={isVi ? 'Sửa' : 'Edit'}>
                  <Edit2 />
                </button>
                <button className="course-action-btn" title={isVi ? 'Nhân bản' : 'Duplicate'}>
                  <Copy />
                </button>
                <button className="course-action-btn danger" title={isVi ? 'Xóa' : 'Delete'}>
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table density-middle">
            <thead>
              <tr>
                <th>{isVi ? 'Tên khóa học' : 'Course Title'}</th>
                <th>{isVi ? 'Danh mục' : 'Category'}</th>
                <th>{isVi ? 'Cấp độ' : 'Level'}</th>
                <th>{isVi ? 'Học viên' : 'Students'}</th>
                <th>{isVi ? 'Học phí' : 'Price'}</th>
                <th>{isVi ? 'Trạng thái' : 'Status'}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paginatedCourses.map(course => (
                <tr key={course.id} className={!course.is_published ? 'banned-row' : ''}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-user-info">
                        <span className="admin-name">{course.title}</span>
                        <span className="admin-email">{course.author_name} • {formatDate(course.created_at)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="role-badge"
                      style={{
                        background: categoryColors[course.category]?.bg,
                        color: categoryColors[course.category]?.text,
                      }}
                    >
                      {categoryLabels[course.category]?.[isVi ? 'vi' : 'en']}
                    </span>
                  </td>
                  <td>
                    <span
                      className="level-badge"
                      style={{
                        background: levelColors[course.level]?.bg,
                        color: levelColors[course.level]?.text,
                      }}
                    >
                      {levelLabels[course.level]?.[isVi ? 'vi' : 'en']}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{course.enrollments.toLocaleString()}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{formatPrice(course.price)}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${course.is_published ? 'success' : 'inactive'}`}>
                      {course.is_published ? (isVi ? 'Đã xuất bản' : 'Published') : (isVi ? 'Bản nháp' : 'Draft')}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="row-action-btn" title={isVi ? 'Xem' : 'View'}>
                        <Eye />
                      </button>
                      <button className="row-action-btn" title={isVi ? 'Sửa' : 'Edit'}>
                        <Edit2 />
                      </button>
                      <button className="row-action-btn" title={isVi ? 'Nhân bản' : 'Duplicate'}>
                        <Copy />
                      </button>
                      <button className="row-action-btn danger" title={isVi ? 'Xóa' : 'Delete'}>
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCourses.length === 0 ? (
        <div className="courses-empty">
          <BookOpen className="empty-icon" />
          <p className="empty-title">
            {hasActiveFilters
              ? (isVi ? 'Không tìm thấy khóa học nào khớp với bộ lọc' : 'No courses found matching filters')
              : (isVi ? 'Chưa có khóa học nào' : 'No courses yet')
            }
          </p>
          {hasActiveFilters && (
            <button className="empty-action" onClick={handleReset}>
              {isVi ? 'Xóa bộ lọc' : 'Clear filters'}
            </button>
          )}
        </div>
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredCourses.length / pageSize)}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          totalItems={filteredCourses.length}
          onPageChange={setCurrentPage}
        />
      )}
    </main>
  )
}
