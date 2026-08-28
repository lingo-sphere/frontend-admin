import { useState, useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Save, BookOpen, ExternalLink, X } from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'
import {
  CourseBasicInfoTab,
  type CourseFormData,
} from '@/pages/course-form/CourseBasicInfoTab'
import { CourseCurriculumManager } from '@/pages/course-form/CourseCurriculumManager'

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
                  id: m._id || `mod-${mIdx}`,
                  title: m.title,
                  description: m.description || '',
                  module_order: m.module_order || mIdx + 1,
                  lessons:
                    m.lessons && m.lessons.length > 0
                      ? m.lessons.map((l, lIdx) => ({
                          id: l._id || `les-${lIdx}`,
                          title: l.title,
                          video_url: l.video_url || '',
                          duration_minutes: l.duration_minutes || 10,
                          content: l.content || '',
                          is_preview: l.is_preview || false,
                          lesson_order: l.lesson_order || lIdx + 1,
                        }))
                      : [],
                }))
              : formData.modules,
        })
      }
    } catch {
      toast.error('Không thể tải thông tin khóa học')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
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
          _id: m.id || `mod-${mIdx}`,
          course_id: currentCourseId || '',
          title: m.title,
          description: m.description,
          module_order: mIdx + 1,
          lessons: m.lessons.map((l, lIdx) => ({
            _id: l.id || `les-${lIdx}`,
            module_id: m.id || `mod-${mIdx}`,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveNavItem('courses')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isVi ? 'Quay lại danh sách khóa học' : 'Back to courses'}</span>
        </button>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formData.modules.length} {isVi ? 'chương' : 'chapters'} · {totalLessons} {isVi ? 'bài học' : 'lessons'} ({totalDuration} {isVi ? 'phút' : 'min'})
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>{isEditMode ? (isVi ? 'Chỉnh Sửa Khóa Học' : 'Edit Course') : (isVi ? 'Tạo Khóa Học Mới' : 'Create Course')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Quản lý giáo trình bài giảng video, các chương học (modules) và thời lượng bài học.'
              : 'Manage video curriculum, modules and lesson duration.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu Khóa Học' : 'Save Course')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CourseBasicInfoTab
          formData={formData}
          onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
          onGenerateSlug={handleGenerateSlug}
          isVi={isVi}
        />

        <CourseCurriculumManager
          modules={formData.modules}
          onChange={(modules) => setFormData((prev) => ({ ...prev, modules }))}
          onPreviewVideo={(url) => setVideoPreviewUrl(url)}
          isVi={isVi}
        />
      </form>

      {videoPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <span className="text-xs font-semibold text-slate-200">
                {isVi ? 'Xem thử video bài giảng' : 'Lesson Video Preview'}
              </span>
              <button
                onClick={() => setVideoPreviewUrl(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {videoPreviewUrl.includes('youtube.com') || videoPreviewUrl.includes('youtu.be') ? (
                <iframe
                  src={videoPreviewUrl.replace('watch?v=', 'embed/')}
                  title="Video preview"
                  className="h-full w-full"
                  allowFullScreen
                />
              ) : (
                <video src={videoPreviewUrl} controls className="h-full w-full" autoPlay />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
