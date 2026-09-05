/**
 * @file roadmaps.page.tsx
 * @description Trang quản trị Lộ trình học tập (Learning Roadmaps) trong hệ thống Admin LingoSphere
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Compass,
  Plus,
  RotateCcw,
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Edit3,
  Trash2,
} from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/common/data.table'
import { Popconfirm } from '@/components/common/popconfirm'
import { RoadmapFormModal } from '@/components/roadmaps/roadmap.form.modal'
import { courseService, roadmapService } from '@/services/course.service'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast-store'
import type { Course as ApiCourse, LearningRoadmap } from '@/types/api.types'

export function RoadmapsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([])
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [exams, setExams] = useState<ToeicExamItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [skillsFilter, setSkillsFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingRoadmap, setEditingRoadmap] = useState<LearningRoadmap | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [roadmapsData, coursesRes, examsData] = await Promise.all([
        roadmapService.getAllRoadmaps(),
        courseService.getAllCourses({ pageSize: 100 }),
        examAdminService.getExams(),
      ])

      setRoadmaps(Array.isArray(roadmapsData) ? roadmapsData : [])
      const rawCourses = Array.isArray(coursesRes) ? coursesRes : ((coursesRes as any)?.result || (coursesRes as any)?.data || [])
      setCourses(rawCourses)
      setExams(Array.isArray(examsData) ? examsData : [])
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lộ trình:', err)
      toast.error('Không thể tải danh sách lộ trình học tập')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenCreateModal = () => {
    setEditingRoadmap(null)
    setShowModal(true)
  }

  const handleOpenEditModal = (roadmap: LearningRoadmap) => {
    setEditingRoadmap(roadmap)
    setShowModal(true)
  }

  const handleDeleteRoadmap = async (roadmapId: string) => {
    try {
      await roadmapService.deleteRoadmap(roadmapId)
      toast.success('Đã xóa lộ trình thành công!')
      loadData()
    } catch (err) {
      console.error('Lỗi khi xóa lộ trình:', err)
      toast.error('Không thể xóa lộ trình này')
    }
  }

  const handleTogglePublish = async (roadmap: LearningRoadmap) => {
    try {
      await roadmapService.updateRoadmap(roadmap._id, {
        is_published: !roadmap.is_published,
      })
      toast.success(
        roadmap.is_published ? 'Đã chuyển lộ trình về bản nháp!' : 'Đã xuất bản lộ trình công khai!'
      )
      loadData()
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err)
      toast.error('Không thể cập nhật trạng thái xuất bản')
    }
  }

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((rm) => {
      const matchSearch =
        !searchQuery.trim() ||
        rm.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rm.slug?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchSkills =
        skillsFilter === 'ALL' ||
        rm.skills_focus === skillsFilter

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PUBLISHED' && rm.is_published) ||
        (statusFilter === 'DRAFT' && !rm.is_published)

      return matchSearch && matchSkills && matchStatus
    })
  }, [roadmaps, searchQuery, skillsFilter, statusFilter])

  const stats = useMemo(() => {
    const total = roadmaps.length
    const twoSkills = roadmaps.filter((r) => r.skills_focus === '2SKILLS').length
    const fourSkills = roadmaps.filter((r) => r.skills_focus === '4SKILLS').length
    const published = roadmaps.filter((r) => r.is_published).length

    return { total, twoSkills, fourSkills, published }
  }, [roadmaps])

  const columns: DataTableColumn<LearningRoadmap>[] = useMemo(
    () => [
      {
        key: 'title',
        title: isVi ? 'Tên Lộ Trình' : 'Roadmap Title',
        sortable: true,
        render: (record: LearningRoadmap) => (
          <div className="space-y-1 max-w-sm">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
              <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">{record.title}</span>
            </div>
            {record.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {record.description}
              </p>
            )}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                /{record.slug || record._id}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'skills_focus',
        title: isVi ? 'Kỹ Năng' : 'Skills Focus',
        align: 'center',
        render: (record: LearningRoadmap) => (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              record.skills_focus === '4SKILLS'
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200'
            }`}
          >
            {record.skills_focus === '4SKILLS' ? '🗣️ 4 Kỹ Năng' : '🎧 2 Kỹ Năng'}
          </span>
        ),
      },
      {
        key: 'target_score',
        title: isVi ? 'Mục Tiêu' : 'Target',
        align: 'center',
        sortable: true,
        render: (record: LearningRoadmap) => (
          <div className="space-y-0.5">
            <span className="inline-block px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 font-extrabold text-xs">
              TOEIC {record.target_score}+
            </span>
            <div className="text-[10px] text-slate-400">
              Đầu vào: {record.min_entry_score} - {record.max_entry_score}
            </div>
          </div>
        ),
      },
      {
        key: 'stages',
        title: isVi ? 'Số Chặng & Khóa' : 'Stages & Courses',
        align: 'center',
        render: (record: LearningRoadmap) => (
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              {record.stages?.length || 0} Chặng học
            </span>
          </div>
        ),
      },
      {
        key: 'pricing',
        title: isVi ? 'Giá Gói Lộ Trình' : 'Bundle Price',
        align: 'right',
        render: (record: LearningRoadmap) => (
          <div className="space-y-0.5 text-right">
            <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
              {(record.bundle_price || 0).toLocaleString('vi-VN')} đ
            </div>
            {record.original_price && record.original_price > (record.bundle_price || 0) && (
              <div className="text-[11px] text-slate-400 line-through">
                {record.original_price.toLocaleString('vi-VN')} đ
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'is_published',
        title: isVi ? 'Trạng Thái' : 'Status',
        align: 'center',
        render: (record: LearningRoadmap) => (
          <button
            type="button"
            onClick={() => handleTogglePublish(record)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              record.is_published
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {record.is_published ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Hoạt Động</span>
              </>
            ) : (
              <span>Bản Nháp</span>
            )}
          </button>
        ),
      },
      {
        key: 'actions',
        title: isVi ? 'Thao Tác' : 'Actions',
        align: 'right',
        render: (record: LearningRoadmap) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenEditModal(record)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
              title="Chỉnh sửa lộ trình"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <Popconfirm
              title="Xóa lộ trình này?"
              description="Hành động này không thể hoàn tác. Các thiết lập chặng sẽ bị xóa."
              onConfirm={() => handleDeleteRoadmap(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                title="Xóa lộ trình"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    [isVi]
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hệ Thống Lộ Trình Học Tập Cá Nhân Hóa (Adaptive Roadmaps)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Quản Lý Lộ Trình Đào Tạo TOEIC Theo Mục Tiêu
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Tạo và ghép các khóa học thành lộ trình thông minh. Hệ thống tự động gợi ý lộ trình phù hợp sau khi học viên làm bài thi phân lớp (Placement Test).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm Mới</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Lộ Trình Mới</span>
            </button>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng số Lộ trình</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.twoSkills}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lộ trình 2 Kỹ Năng</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.fourSkills}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Lộ trình 4 Kỹ Năng</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.published}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đang Hoạt Động</div>
          </div>
        </div>
      </div>

      
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, slug, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="ALL">Tất cả Kỹ năng</option>
            <option value="2SKILLS">2 Kỹ năng (LR)</option>
            <option value="4SKILLS">4 Kỹ năng (LRSW)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="PUBLISHED">Đang Áp Dụng</option>
            <option value="DRAFT">Bản Nháp</option>
          </select>
        </div>
      </div>

      
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable<LearningRoadmap>
          columns={columns}
          data={filteredRoadmaps}
          isLoading={isLoading}
          rowKey={(item: LearningRoadmap) => item._id}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSortChange={(key: string, order: 'asc' | 'desc' | null) => {
            setSortKey(key)
            setSortOrder(order)
            setCurrentPage(1)
          }}
          pagination={{
            currentPage,
            pageSize,
            totalItems: filteredRoadmaps.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size: number) => {
              setPageSize(size)
              setCurrentPage(1)
            },
          }}
          emptyText="Chưa có lộ trình học tập nào. Hãy tạo lộ trình mới để kích hoạt tính năng gợi ý."
        />
      </div>

      
      <RoadmapFormModal
        isOpen={showModal}
        editingRoadmap={editingRoadmap}
        courses={courses}
        exams={exams}
        onClose={() => setShowModal(false)}
        onSuccess={loadData}
      />
    </div>
  )
}
