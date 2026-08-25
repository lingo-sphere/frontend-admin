import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Image,
  Video,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import {
  categoryLabels,
  levelLabels,
} from '@/data/courses-data'
import { useAdminStore } from '@/store/admin-store'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'

type LessonType = 'VIDEO' | 'READING' | 'FLASHCARD' | 'PRACTICE_QUIZ'

interface LessonQuestion {
  id: string
  question_type: 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'AUDIO_LISTENING'
  prompt: string
  options: { key: string; text: string }[]
  correct_option: string
  explanation: string
}

interface CourseLesson {
  id: string
  title: string
  lesson_type: LessonType
  video_url: string
  duration_seconds: number
  content_html: string
  order_index: number
  questions: LessonQuestion[]
}

interface CourseModule {
  id: string
  title: string
  description: string
  order_index: number
  is_free_preview: boolean
  lessons: CourseLesson[]
}

interface CourseFormData {
  title: string
  slug: string
  description: string
  category: 'TOEIC_LISTENING' | 'TOEIC_READING' | 'GRAMMAR' | 'VOCABULARY'
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  target_score: number
  price: number
  thumbnail_url: string
  is_published: boolean
  modules: CourseModule[]
}

export function CourseFormPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    category: 'TOEIC_LISTENING',
    level: 'BEGINNER',
    target_score: 500,
    price: 299000,
    thumbnail_url: '',
    is_published: true,
    modules: [
      {
        id: 'mod-1',
        title: 'Chương 1: Tổng quan và Phương pháp học',
        description: 'Làm quen với cấu trúc đề và lộ trình chinh phục điểm cao',
        order_index: 1,
        is_free_preview: true,
        lessons: [
          {
            id: 'les-1',
            title: 'Bài 1: Chiến thuật xử lý dạng bài nhanh',
            lesson_type: 'VIDEO',
            video_url: 'https://example.com/video1.mp4',
            duration_seconds: 900,
            content_html: '<p>Tóm tắt các bẫy thường gặp trong đề thi TOEIC ETS.</p>',
            order_index: 1,
            questions: [],
          },
        ],
      },
    ],
  })

  const [expandedModules, setExpandedModules] = useState<string[]>(['mod-1'])

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
      order_index: formData.modules.length + 1,
      is_free_preview: false,
      lessons: [],
    }
    setFormData({ ...formData, modules: [...formData.modules, newMod] })
    setExpandedModules((prev) => [...prev, newModId])
  }

  const removeModule = (modId: string) => {
    setFormData({ ...formData, modules: formData.modules.filter((m) => m.id !== modId) })
  }

  const addLesson = (modId: string) => {
    const newLesson: CourseLesson = {
      id: `les-${Date.now()}`,
      title: 'Bài học mới',
      lesson_type: 'VIDEO',
      video_url: '',
      duration_seconds: 600,
      content_html: '',
      order_index: 1,
      questions: [],
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
        m.id === modId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lesId) } : m
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
      await courseService.createCourse({
        title: formData.title,
        slug: formData.slug || `course-${Date.now()}`,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        target_score: formData.target_score,
        price: formData.price,
        thumbnail_url:
          formData.thumbnail_url ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
        is_published: formData.is_published,
        modules: formData.modules.map((m) => ({
          title: m.title,
          description: m.description,
          order_index: m.order_index,
          is_free_preview: m.is_free_preview,
          lessons: m.lessons.map((l) => ({
            title: l.title,
            lesson_type: l.lesson_type,
            video_url: l.video_url,
            duration_seconds: l.duration_seconds,
            content_html: l.content_html,
            order_index: l.order_index,
          })),
        })) as any,
      })

      toast.success('Tạo khóa học mới thành công!')
      setActiveNavItem('courses')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo khóa học thất bại'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveNavItem('courses')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Soạn Thảo Khóa Học & Giáo Trình
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cấu hình thông tin khóa học, cây chương mục (Modules) và các bài giảng đa phương tiện
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span>Thông tin cơ bản khóa học</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Tên khóa học <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="VD: Luyện thi TOEIC Cấp tốc 750+"
                required
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Đường dẫn tĩnh (Slug)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="luyen-thi-toeic-cap-toc-750"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-300 font-mono text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Danh mục khóa học
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full h-11 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {Object.entries(categoryLabels).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val[isVi ? 'vi' : 'en']}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Trình độ mục tiêu
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full h-11 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {Object.entries(levelLabels).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val[isVi ? 'vi' : 'en']}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Điểm mục tiêu (Target TOEIC)
              </label>
              <input
                type="number"
                value={formData.target_score}
                onChange={(e) => setFormData({ ...formData, target_score: Number(e.target.value) })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Học phí (VND)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="299000"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-teal-400 font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Ảnh bìa Thumbnail (URL)
              </label>
              <input
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Mô tả khóa học
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Giới thiệu mục tiêu đầu ra và phương pháp học tập..."
                className="w-full p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Modules Curriculum Editor */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-400" />
              <span>Chương trình giảng dạy (Modules & Bài học)</span>
            </h2>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Chương (Module)</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.modules.map((mod, modIdx) => {
              const isExpanded = expandedModules.includes(mod.id)

              return (
                <div key={mod.id} className="rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden">
                  {/* Module Header */}
                  <div className="p-4 flex items-center justify-between gap-3 bg-slate-900/40">
                    <button
                      type="button"
                      onClick={() => toggleModuleExpand(mod.id)}
                      className="flex items-center gap-2 text-left flex-1 font-semibold text-slate-200 hover:text-teal-400 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="text-sm">{mod.title || `Chương ${modIdx + 1}`}</span>
                      <span className="text-[11px] text-slate-500 font-normal">({mod.lessons.length} bài học)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addLesson(mod.id)}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        + Bài học
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModule(mod.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Module Lessons List */}
                  {isExpanded && (
                    <div className="p-4 space-y-3 border-t border-slate-800/80">
                      <div className="space-y-2">
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
                          placeholder="Tiêu đề chương..."
                          className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                        />
                      </div>

                      {mod.lessons.length === 0 ? (
                        <p className="text-center py-4 text-xs text-slate-500 italic">
                          Chưa có bài học nào trong chương này
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {mod.lessons.map((les, lesIdx) => (
                            <div
                              key={les.id}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                                  {lesIdx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={les.title}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      modules: formData.modules.map((m) =>
                                        m.id === mod.id
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l) =>
                                                l.id === les.id ? { ...l, title: e.target.value } : l
                                              ),
                                            }
                                          : m
                                      ),
                                    })
                                  }
                                  className="w-full bg-transparent border-0 outline-none text-xs text-slate-200"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => removeLesson(mod.id, les.id)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
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
                <span>Lưu & Xuất Bản Khóa Học</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
