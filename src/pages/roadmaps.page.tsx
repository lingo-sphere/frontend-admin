/**
 * @file RoadmapsPage.tsx
 * @description Trang quản trị Lộ trình học tập (Learning Roadmaps) trong hệ thống Admin LingoSphere
 */

import { DataTable, type DataTableColumn } from '@/components/common/data.table'
import { Popconfirm } from '@/components/common/popconfirm'
import { courseService, roadmapService } from '@/services/course.service'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast-store'
import type { Course as ApiCourse, LearningRoadmap, LearningRoadmapStage } from '@/types/api.types'
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Edit3,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

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

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingRoadmap, setEditingRoadmap] = useState<LearningRoadmap | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('')
  const [formSlug, setFormSlug] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formSkillsFocus, setFormSkillsFocus] = useState<'2SKILLS' | '4SKILLS'>('2SKILLS')
  const [formTargetScore, setFormTargetScore] = useState<number>(650)
  const [formMinEntryScore, setFormMinEntryScore] = useState<number>(250)
  const [formMaxEntryScore, setFormMaxEntryScore] = useState<number>(500)
  const [formBundlePrice, setFormBundlePrice] = useState<number>(1200000)
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(1600000)
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true)
  const [formStages, setFormStages] = useState<LearningRoadmapStage[]>([
    {
      stage_order: 1,
      stage_title: 'Chặng 1: Nền Tảng Cốt Lõi',
      stage_description: 'Củng cố ngữ pháp, từ vựng nền tảng và phản xạ nghe hiểu',
      course_id: '',
      target_band: '450+',
      checkpoint_exam_id: '',
      passing_score: 70,
    },
    {
      stage_order: 2,
      stage_title: 'Chặng 2: Bứt Phá Mục Tiêu',
      stage_description: 'Chiến thuật giải đề, khắc phục bẫy điểm và nâng cao tốc độ',
      course_id: '',
      target_band: '650+',
      checkpoint_exam_id: '',
      passing_score: 75,
    },
  ])

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
    setFormTitle('')
    setFormSlug('')
    setFormDescription('')
    setFormSkillsFocus('2SKILLS')
    setFormTargetScore(650)
    setFormMinEntryScore(250)
    setFormMaxEntryScore(500)
    setFormBundlePrice(1200000)
    setFormOriginalPrice(1600000)
    setFormIsPublished(true)
    setFormStages([
      {
        stage_order: 1,
        stage_title: 'Chặng 1: Xây Dựng Nền Tảng',
        stage_description: 'Củng cố ngữ pháp và từ vựng trọng tâm',
        course_id: courses[0]?._id || '',
        target_band: '450+',
        checkpoint_exam_id: '',
        passing_score: 70,
      },
      {
        stage_order: 2,
        stage_title: 'Chặng 2: Bứt Phá Điểm Số',
        stage_description: 'Nâng cao tốc độ và xử lý các câu khó',
        course_id: courses[1]?._id || courses[0]?._id || '',
        target_band: '650+',
        checkpoint_exam_id: '',
        passing_score: 75,
      },
    ])
    setShowModal(true)
  }

  const handleOpenEditModal = (roadmap: LearningRoadmap) => {
    setEditingRoadmap(roadmap)
    setFormTitle(roadmap.title || '')
    setFormSlug(roadmap.slug || '')
    setFormDescription(roadmap.description || '')
    setFormSkillsFocus(roadmap.skills_focus || '2SKILLS')
    setFormTargetScore(roadmap.target_score || 650)
    setFormMinEntryScore(roadmap.min_entry_score || 0)
    setFormMaxEntryScore(roadmap.max_entry_score || 500)
    setFormBundlePrice(roadmap.bundle_price || 0)
    setFormOriginalPrice(roadmap.original_price || 0)
    setFormIsPublished(roadmap.is_published ?? true)
    setFormStages(
      roadmap.stages && roadmap.stages.length > 0
        ? roadmap.stages.map((s, idx) => ({ ...s, stage_order: s.stage_order || idx + 1 }))
        : [
            {
              stage_order: 1,
              stage_title: 'Chặng 1',
              stage_description: '',
              course_id: courses[0]?._id || '',
              target_band: '450+',
            },
          ]
    )
    setShowModal(true)
  }

  const handleAddStage = () => {
    const nextOrder = formStages.length + 1
    setFormStages([
      ...formStages,
      {
        stage_order: nextOrder,
        stage_title: `Chặng ${nextOrder}: Về Đích Toàn Diện`,
        stage_description: 'Luyện đề thực chiến và hoàn thiện kỹ năng',
        course_id: courses[0]?._id || '',
        target_band: '800+',
        checkpoint_exam_id: '',
        passing_score: 80,
      },
    ])
  }

  const handleRemoveStage = (index: number) => {
    if (formStages.length <= 1) {
      toast.warning('Lộ trình cần có ít nhất 1 chặng học')
      return
    }
    const updated = formStages.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, stage_order: idx + 1 }))
    setFormStages(updated)
  }

  const handleUpdateStage = (index: number, field: keyof LearningRoadmapStage, value: any) => {
    setFormStages((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSaveRoadmap = async () => {
    if (!formTitle.trim()) {
      toast.warning('Vui lòng nhập tên lộ trình')
      return
    }

    if (formStages.some((s) => !s.course_id)) {
      toast.warning('Vui lòng chọn khóa học cho tất cả các chặng')
      return
    }

    setIsSaving(true)
    try {
      const payload: Partial<LearningRoadmap> = {
        title: formTitle.trim(),
        slug: formSlug.trim() || formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formDescription.trim(),
        skills_focus: formSkillsFocus,
        target_score: Number(formTargetScore),
        min_entry_score: Number(formMinEntryScore),
        max_entry_score: Number(formMaxEntryScore),
        bundle_price: Number(formBundlePrice),
        original_price: Number(formOriginalPrice),
        is_published: formIsPublished,
        stages: formStages,
      }

      if (editingRoadmap) {
        await roadmapService.updateRoadmap(editingRoadmap._id, payload)
        toast.success('Đã cập nhật lộ trình học tập thành công')
      } else {
        await roadmapService.createRoadmap(payload)
        toast.success('Đã tạo lộ trình học tập mới thành công')
      }

      setShowModal(false)
      loadData()
    } catch (err) {
      console.error('Lỗi khi lưu lộ trình:', err)
      toast.error('Không thể lưu lộ trình học tập')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRoadmap = async (id: string) => {
    try {
      await roadmapService.deleteRoadmap(id)
      toast.success('Đã xóa lộ trình thành công')
      loadData()
    } catch (err) {
      console.error('Lỗi khi xóa lộ trình:', err)
      toast.error('Không thể xóa lộ trình')
    }
  }

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((r) => {
      const matchSearch =
        !searchQuery ||
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.slug?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchSkills = skillsFilter === 'ALL' || r.skills_focus === skillsFilter
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PUBLISHED' && r.is_published) ||
        (statusFilter === 'DRAFT' && !r.is_published)

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

  const courseMap = useMemo(() => {
    return new Map(courses.map((c) => [c._id, c]))
  }, [courses])

  const columns: DataTableColumn<LearningRoadmap>[] = useMemo(
    () => [
      {
        key: 'roadmap_info',
        title: isVi ? 'Tên Lộ Trình & Phân Loại' : 'Roadmap Info',
        sortable: true,
        render: (item) => (
          <div className="space-y-1.5 max-w-sm">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <span>{item.title}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  item.skills_focus === '4SKILLS'
                    ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                }`}
              >
                {item.skills_focus === '4SKILLS' ? '4 Kỹ Năng' : '2 Kỹ Năng'}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>Mục tiêu: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{item.target_score}+</strong></span>
              <span>•</span>
              <span>Đầu vào: <strong className="text-slate-700 dark:text-slate-300">{item.min_entry_score} - {item.max_entry_score}</strong></span>
            </div>
          </div>
        ),
      },
      {
        key: 'stages',
        title: isVi ? 'Các Chặng Trong Lộ Trình' : 'Stages Structure',
        render: (item) => {
          const stages = item.stages || []
          return (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>{stages.length} Chặng Học Nối Tiếp</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-xs">
                {stages.map((st, idx) => {
                  const course = courseMap.get(st.course_id)
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      title={course?.title || `Chặng ${st.stage_order}`}
                    >
                      <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[9px]">
                        {st.stage_order}
                      </span>
                      <span className="truncate max-w-[120px]">{course?.title || st.stage_title}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )
        },
      },
      {
        key: 'pricing',
        title: isVi ? 'Giá Trọn Gói Combo' : 'Bundle Pricing',
        render: (item) => {
          const original = item.original_price || 0
          const bundle = item.bundle_price || 0
          const discountPct = original > 0 ? Math.round(((original - bundle) / original) * 100) : 0
          return (
            <div className="space-y-1">
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {bundle.toLocaleString('vi-VN')} đ
              </div>
              {original > bundle && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="line-through">{original.toLocaleString('vi-VN')} đ</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded">
                    -{discountPct}%
                  </span>
                </div>
              )}
            </div>
          )
        },
      },
      {
        key: 'status',
        title: isVi ? 'Trạng Thái' : 'Status',
        render: (item) =>
          item.is_published ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đang Áp Dụng</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
              <span>Bản Nháp</span>
            </span>
          ),
      },
      {
        key: 'actions',
        title: isVi ? 'Thao Tác' : 'Actions',
        align: 'right',
        render: (item) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleOpenEditModal(item)}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa lộ trình"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <Popconfirm
              title="Xóa lộ trình này?"
              description="Các học viên đã đăng ký vẫn giữ tiến độ, nhưng lộ trình sẽ không còn xuất hiện trong gợi ý mới."
              onConfirm={() => handleDeleteRoadmap(item._id)}
            >
              <button
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                title="Xóa lộ trình"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    [isVi, courseMap]
  )

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200 border border-white/10">
              <Compass className="w-3.5 h-3.5" />
              <span>Hệ Thống Lộ Trình & Gợi Ý Cá Nhân Hóa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quản Trị Lộ Trình Học Tập (Roadmaps)
            </h1>
            <p className="text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Thiết lập lộ trình từ cơ bản đến nâng cao. Học viên sau khi thi đánh giá năng lực đầu vào sẽ được hệ thống phân tích điểm và đề xuất lộ trình tối ưu tương ứng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
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

      {/* Stats Cards */}
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

      {/* Filter Toolbar */}
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

      {/* Main DataTable */}
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingRoadmap ? 'Chỉnh Sửa Lộ Trình Học Tập' : 'Tạo Lộ Trình Học Tập Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tên Lộ Trình: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Bứt Phá TOEIC 650+ Từ Con Số 0"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Đường Dẫn Slug (Tùy chọn):
                    </label>
                    <input
                      type="text"
                      placeholder="toeic-but-pha-650-plus"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mô tả Lộ trình:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả tóm tắt mục tiêu, cam kết đầu ra và học viên phù hợp..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Skills Focus & Targets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Kỹ Năng Đào Tạo:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormSkillsFocus('2SKILLS')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formSkillsFocus === '2SKILLS'
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-xs">🎧 📖 2 Kỹ Năng</div>
                        <div className="text-[10px] font-normal opacity-80 mt-0.5">Listening & Reading</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormSkillsFocus('4SKILLS')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formSkillsFocus === '4SKILLS'
                            ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-200 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-xs">🗣️ ✍️ 4 Kỹ Năng</div>
                        <div className="text-[10px] font-normal opacity-80 mt-0.5">LR + Speaking & Writing</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mục Tiêu Điểm Số Đầu Ra (Target Score):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={990}
                      value={formTargetScore}
                      onChange={(e) => setFormTargetScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Score Bracket Match */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Dải Điểm Đầu Vào Khảo Sát Để Gợi Ý Lộ Trình Này</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Điểm Tối Thiểu (Min Score):</label>
                      <input
                        type="number"
                        min={0}
                        max={990}
                        value={formMinEntryScore}
                        onChange={(e) => setFormMinEntryScore(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Điểm Tối Đa (Max Score):</label>
                      <input
                        type="number"
                        min={0}
                        max={990}
                        value={formMaxEntryScore}
                        onChange={(e) => setFormMaxEntryScore(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Giá Gốc Tổng Khóa (đ):
                    </label>
                    <input
                      type="number"
                      step={50000}
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Giá Ưu Đãi Trọn Gói (đ):
                    </label>
                    <input
                      type="number"
                      step={50000}
                      value={formBundlePrice}
                      onChange={(e) => setFormBundlePrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={formIsPublished}
                        onChange={(e) => setFormIsPublished(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Xuất Bản Ngay</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Stages Builder */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <span>Cấu Trúc Các Chặng Học Tập (Roadmap Stages)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Học viên sẽ học lần lượt từ Chặng 1 đến Chặng cuối cùng và làm bài thi Checkpoint để mở khóa chặng kế tiếp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStage}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Chặng</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formStages.map((stage, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Chặng {index + 1}
                          </span>
                        </div>
                        {formStages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStage(index)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                            title="Xóa chặng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Tiêu Đề Chặng:
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Chặng 1: Nền tảng 450+"
                            value={stage.stage_title}
                            onChange={(e) => handleUpdateStage(index, 'stage_title', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Khóa Học Của Chặng: <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={stage.course_id}
                            onChange={(e) => handleUpdateStage(index, 'course_id', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer"
                          >
                            <option value="">-- Chọn Khóa Học --</option>
                            {courses.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.title} ({c.level || 'TOEIC'} • {c.target_score ? `${c.target_score}+` : ''})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Band Mục Tiêu Chặng:
                          </label>
                          <input
                            type="text"
                            placeholder="450+"
                            value={stage.target_band || ''}
                            onChange={(e) => handleUpdateStage(index, 'target_band', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Bài Thi Kiểm Tra Chặng (Checkpoint):
                          </label>
                          <select
                            value={stage.checkpoint_exam_id || ''}
                            onChange={(e) => handleUpdateStage(index, 'checkpoint_exam_id', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer"
                          >
                            <option value="">-- Chọn bài thi hoặc bỏ trống --</option>
                            {exams.map((ex) => (
                              <option key={ex.id || ex._id} value={ex.id || ex._id}>
                                {ex.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Điểm Đạt Checkpoint (%):
                          </label>
                          <input
                            type="number"
                            min={50}
                            max={100}
                            value={stage.passing_score || 70}
                            onChange={(e) => handleUpdateStage(index, 'passing_score', Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveRoadmap}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingRoadmap ? 'Lưu Thay Đổi' : 'Tạo Lộ Trình'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
