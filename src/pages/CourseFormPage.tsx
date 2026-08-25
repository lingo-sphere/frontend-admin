import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Image,
  Video,
  Play,
  Clock,
  Eye,
  FileText,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  HelpCircle,
  Film,
} from 'lucide-react'
import { categoryLabels, levelLabels } from '@/data/courses-data'
import { useAdminStore } from '@/store/admin-store'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'

interface LessonQuestion {
  id: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string
}

interface CourseLesson {
  id: string
  title: string
  video_url: string
  duration_minutes: number
  content: string
  is_preview: boolean
  lesson_order: number
  questions?: LessonQuestion[]
}

interface CourseModule {
  id: string
  title: string
  description: string
  module_order: number
  lessons: CourseLesson[]
}

interface CourseFormData {
  title: string
  slug: string
  description: string
  category: string
  level: string
  target_score: number
  price: number
  discount_price: number
  thumbnail_url: string
  is_published: boolean
  modules: CourseModule[]
}

interface CourseFormPageProps {
  editCourseId?: string
}

export function CourseFormPage({ editCourseId }: CourseFormPageProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  const currentCourseId =
    editCourseId ||
    (activeNavItem.startsWith('course-edit:') ? activeNavItem.split(':')[1] : undefined) ||
    (typeof window !== 'undefined' && window.location.pathname.includes('/courses/')
      ? window.location.pathname.split('/courses/')[1].replace('/edit', '')
      : undefined)

  const isEditMode = Boolean(currentCourseId && currentCourseId !== 'create')

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    category: 'TOEIC_LISTENING',
    level: 'INTERMEDIATE',
    target_score: 750,
    price: 399000,
    discount_price: 299000,
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    is_published: true,
    modules: [
      {
        id: 'mod-1',
        title: 'Chương 1: Tổng quan và Phương pháp nghe',
        description: 'Làm quen với cấu trúc đề Part 1, 2 và phương pháp bắt từ khóa',
        module_order: 1,
        lessons: [
          {
            id: 'les-1',
            title: 'Bài 1: Chiến thuật xử lý dạng tranh miêu tả 1 người',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration_minutes: 15,
            content: 'Tóm tắt các bẫy thường gặp về thì hiện tại tiếp diễn và vị trí hành động trong đề thi TOEIC ETS.',
            is_preview: true,
            lesson_order: 1,
          },
          {
            id: 'les-2',
            title: 'Bài 2: Phân biệt tranh tĩnh (vật thể) và tranh động (người)',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration_minutes: 20,
            content: 'Kỹ thuật loại trừ đáp án có từ phát âm tương tự nhưng sai ngữ cảnh.',
            is_preview: false,
            lesson_order: 2,
          },
        ],
      },
    ],
  })

  const [expandedModules, setExpandedModules] = useState<string[]>(['mod-1'])

  useEffect(() => {
    if (isEditMode && currentCourseId) {
      loadCourseData(currentCourseId)
    }
  }, [currentCourseId])

  const loadCourseData = async (courseId: string) => {
    setIsLoading(true)
    try {
      const course = await courseService.getCourseById(courseId)
      if (course) {
        setFormData({
          title: course.title || '',
          slug: course.slug || '',
          description: course.description || '',
          category: course.category || 'TOEIC_LISTENING',
          level: course.level || 'INTERMEDIATE',
          target_score: course.target_score || 750,
          price: course.price || 0,
          discount_price: course.discount_price || 0,
          thumbnail_url: course.thumbnail_url || '',
          is_published: course.is_published ?? true,
          modules:
            course.modules && course.modules.length > 0
              ? course.modules.map((m, mIdx) => ({
                  id: m._id || `mod-${mIdx + 1}`,
                  title: m.title,
                  description: m.description || '',
                  module_order: m.module_order || mIdx + 1,
                  lessons: (m.lessons || []).map((l, lIdx) => ({
                    id: l._id || `les-${mIdx + 1}-${lIdx + 1}`,
                    title: l.title,
                    video_url: l.video_url || '',
                    duration_minutes: l.duration_minutes || 10,
                    content: l.content || '',
                    is_preview: Boolean(l.is_preview),
                    lesson_order: l.lesson_order || lIdx + 1,
                  })),
                }))
              : formData.modules,
        })
        if (course.modules && course.modules.length > 0) {
          setExpandedModules(course.modules.map((m, idx) => m._id || `mod-${idx + 1}`))
        }
      }
    } catch (err) {
      console.warn('Could not load course from API, using current form state:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTitleChange = (val: string) => {
    const slugVal = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setFormData({ ...formData, title: val, slug: slugVal })
  }

  const toggleModuleExpand = (modId: string) => {
    setExpandedModules((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    )
  }

  const addModule = () => {
    const newModId = `mod-${Date.now()}`
    const newMod: CourseModule = {
      id: newModId,
      title: `Chương ${formData.modules.length + 1}: Chủ đề mới`,
      description: '',
      module_order: formData.modules.length + 1,
      lessons: [
        {
          id: `les-${Date.now()}-1`,
          title: 'Bài 1: Video bài giảng mở đầu',
          video_url: '',
          duration_minutes: 10,
          content: '',
          is_preview: false,
          lesson_order: 1,
        },
      ],
    }
    setFormData({ ...formData, modules: [...formData.modules, newMod] })
    setExpandedModules((prev) => [...prev, newModId])
    toast.info('Đã thêm một Chương mới vào khóa học')
  }

  const removeModule = (modId: string) => {
    setFormData({ ...formData, modules: formData.modules.filter((m) => m.id !== modId) })
  }

  const addLesson = (modId: string) => {
    const targetMod = formData.modules.find((m) => m.id === modId)
    const nextOrder = (targetMod?.lessons.length || 0) + 1

    const newLesson: CourseLesson = {
      id: `les-${Date.now()}`,
      title: `Bài ${nextOrder}: Video bài giảng mới`,
      video_url: '',
      duration_minutes: 15,
      content: '',
      is_preview: false,
      lesson_order: nextOrder,
    }

    setFormData({
      ...formData,
      modules: formData.modules.map((m) =>
        m.id === modId ? { ...m, lessons: [...m.lessons, newLesson] } : m
      ),
    })
  }

  const removeLesson = (modId: string, lesId: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: m.lessons.filter((l) => l.id !== lesId),
            }
          : m
      ),
    })
  }

  const updateLessonField = (
    modId: string,
    lesId: string,
    field: keyof CourseLesson,
    val: CourseLesson[keyof CourseLesson]
  ) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((m) =>
        m.id === modId
          ? {
              ...m,
              lessons: m.lessons.map((l) => (l.id === lesId ? { ...l, [field]: val } : l)),
            }
          : m
      ),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học')
      return
    }

    setIsSubmitting(true)
    try {
      const payload: Partial<Course> = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        target_score: Number(formData.target_score),
        price: Number(formData.price),
        discount_price: Number(formData.discount_price),
        thumbnail_url: formData.thumbnail_url,
        is_published: formData.is_published,
        modules: formData.modules.map((m, mIdx) => ({
          title: m.title,
          description: m.description,
          module_order: mIdx + 1,
          lessons: m.lessons.map((l, lIdx) => ({
            title: l.title,
            video_url: l.video_url,
            duration_minutes: Number(l.duration_minutes) || 10,
            content: l.content,
            is_preview: l.is_preview,
            lesson_order: lIdx + 1,
          })),
        })),
      }

      if (isEditMode && currentCourseId) {
        await courseService.updateCourse(currentCourseId, payload)
        toast.success(`Đã cập nhật khóa học "${formData.title}" thành công!`)
      } else {
        await courseService.createCourse(payload)
        toast.success(`Đã tạo khóa học mới "${formData.title}" thành công!`)
      }

      setActiveNavItem('courses')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lưu khóa học thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalLessons = formData.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalDuration = formData.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration_minutes) || 0), 0),
    0
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveNavItem('courses')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại danh sách khóa học</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {formData.modules.length} chương · {totalLessons} bài học video ({totalDuration} phút)
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>{isEditMode ? 'Chỉnh Sửa Khóa Học & Lộ Trình' : 'Tạo Khóa Học Mới'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý giáo trình bài giảng video, các chương học (modules) và thời lượng bài học.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Info Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span>Thông tin cơ bản khóa học</span>
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Tên khóa học <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Luyện thi TOEIC Cấp Tốc 750+ Toàn Diện"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Đường dẫn (Slug URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="luyen-thi-toeic-cap-toc-750"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Danh mục
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label[isVi ? 'vi' : 'en']}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Trình độ
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  {Object.entries(levelLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label[isVi ? 'vi' : 'en']}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Mục tiêu điểm TOEIC
                </label>
                <input
                  type="number"
                  value={formData.target_score}
                  onChange={(e) => setFormData({ ...formData, target_score: Number(e.target.value) })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 font-bold text-teal-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Giá bán (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Link ảnh bìa (Thumbnail URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200"
                />
                {formData.thumbnail_url && (
                  <img
                    src={formData.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-11 h-11 rounded-xl object-cover border border-slate-800 shrink-0"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mô tả khóa học
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Giới thiệu mục tiêu đầu ra, lộ trình và phương pháp học tập..."
                className="w-full p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* 2. Modules & Video Lessons Curriculum Editor */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <span>Chương trình giảng dạy (1 Khóa học = Nhiều Chương = Nhiều Video)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mỗi chương gồm danh sách các bài học video, link video bài giảng, thời lượng và ghi chú.
              </p>
            </div>

            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Chương Mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.modules.map((mod, modIdx) => {
              const isExpanded = expandedModules.includes(mod.id)
              const modDuration = mod.lessons.reduce((acc, l) => acc + (Number(l.duration_minutes) || 0), 0)

              return (
                <div
                  key={mod.id}
                  className="rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden transition-all shadow-sm"
                >
                  {/* Module Header Bar */}
                  <div className="p-4 flex items-center justify-between gap-3 bg-slate-900/70 border-b border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => toggleModuleExpand(mod.id)}
                      className="flex items-center gap-2.5 text-left flex-1 font-bold text-slate-100 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm">
                        Chương {modIdx + 1}: {mod.title.replace(/^Chương \d+:\s*/, '')}
                      </span>
                      <span className="text-[11px] font-normal text-slate-400 ml-2">
                        ({mod.lessons.length} bài học · {modDuration} phút)
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addLesson(mod.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Video Bài Học</span>
                      </button>

                      {formData.modules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModule(mod.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Xóa chương này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Module Content & Lessons */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Chapter Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-800/60">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-400">Tên chương</label>
                          <input
                            type="text"
                            value={mod.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                modules: formData.modules.map((m) =>
                                  m.id === mod.id ? { ...m, title: e.target.value } : m
                                ),
                              })
                            }
                            placeholder="VD: Tổng quan phương pháp nghe Part 1"
                            className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-400">Mô tả tóm tắt chương</label>
                          <input
                            type="text"
                            value={mod.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                modules: formData.modules.map((m) =>
                                  m.id === mod.id ? { ...m, description: e.target.value } : m
                                ),
                              })
                            }
                            placeholder="VD: Nắm vững cấu trúc và từ vựng cốt lõi..."
                            className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                          />
                        </div>
                      </div>

                      {/* Video Lessons List */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Film className="w-4 h-4 text-teal-400" />
                          <span>Danh sách Video bài giảng trong chương:</span>
                        </p>

                        {mod.lessons.length === 0 ? (
                          <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl space-y-2">
                            <p className="text-xs text-slate-500">Chương này chưa có video bài học nào</p>
                            <button
                              type="button"
                              onClick={() => addLesson(mod.id)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/30 transition-colors"
                            >
                              + Thêm Video Bài Học Đầu Tiên
                            </button>
                          </div>
                        ) : (
                          mod.lessons.map((les, lesIdx) => (
                            <div
                              key={les.id}
                              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 transition-all hover:border-slate-700"
                            >
                              {/* Lesson Row Top */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                  <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/20">
                                    {lesIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={les.title}
                                    onChange={(e) =>
                                      updateLessonField(mod.id, les.id, 'title', e.target.value)
                                    }
                                    placeholder="Tên bài học video..."
                                    className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Free Preview Toggle */}
                                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={les.is_preview}
                                      onChange={(e) =>
                                        updateLessonField(mod.id, les.id, 'is_preview', e.target.checked)
                                      }
                                      className="w-4 h-4 accent-indigo-600 rounded"
                                    />
                                    <span className="text-[11px] font-medium text-teal-400">Học thử</span>
                                  </label>

                                  {/* Delete lesson */}
                                  <button
                                    type="button"
                                    onClick={() => removeLesson(mod.id, les.id)}
                                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title="Xóa bài học"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Lesson Video URL & Duration */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                      <Video className="w-3 h-3 text-indigo-400" />
                                      <span>Đường dẫn Video bài giảng (MP4 / YouTube / R2)</span>
                                    </label>
                                    {les.video_url && (
                                      <button
                                        type="button"
                                        onClick={() => setVideoPreviewUrl(les.video_url)}
                                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-indigo-400" />
                                        <span>Xem thử video</span>
                                      </button>
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    value={les.video_url}
                                    onChange={(e) =>
                                      updateLessonField(mod.id, les.id, 'video_url', e.target.value)
                                    }
                                    placeholder="https://www.youtube.com/watch?v=... hoặc https://r2.lingosphere.../lesson1.mp4"
                                    className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-teal-400" />
                                    <span>Thời lượng (Phút)</span>
                                  </label>
                                  <input
                                    type="number"
                                    value={les.duration_minutes}
                                    onChange={(e) =>
                                      updateLessonField(
                                        mod.id,
                                        les.id,
                                        'duration_minutes',
                                        Number(e.target.value)
                                      )
                                    }
                                    min={1}
                                    placeholder="15"
                                    className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-teal-400 focus:outline-none focus:border-teal-500"
                                  />
                                </div>
                              </div>

                              {/* Lesson Notes / Theory Content */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-slate-400" />
                                  <span>Ghi chú / Tóm tắt kiến thức trọng tâm cho video này</span>
                                </label>
                                <textarea
                                  value={les.content}
                                  onChange={(e) =>
                                    updateLessonField(mod.id, les.id, 'content', e.target.value)
                                  }
                                  rows={2}
                                  placeholder="Ghi chú kiến thức chính, từ vựng hoặc công thức cần nhớ trong video..."
                                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveNavItem('courses')}
            className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Cập Nhật Khóa Học' : 'Lưu & Xuất Bản Khóa Học'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Video Preview Modal */}
      {videoPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400" />
                <span>Xem trước Video bài giảng</span>
              </h3>
              <button
                onClick={() => setVideoPreviewUrl(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {videoPreviewUrl.includes('youtube.com') || videoPreviewUrl.includes('youtu.be') ? (
                <iframe
                  src={videoPreviewUrl.replace('watch?v=', 'embed/').split('&')[0]}
                  title="Video Player Preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={videoPreviewUrl}
                  controls
                  className="w-full h-full object-contain"
                >
                  Trình duyệt không hỗ trợ phát video này.
                </video>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-md font-mono">{videoPreviewUrl}</span>
              <button
                type="button"
                onClick={() => setVideoPreviewUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
