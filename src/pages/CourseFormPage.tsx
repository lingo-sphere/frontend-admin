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

  const [courseCreatedAt, setCourseCreatedAt] = useState<number>(() => Date.now())
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    category: 'TOEIC_2_SKILLS',
    level: 'BEGINNER',
    target_score: 500,
    price: 0,
    discount_price: 0,
    thumbnail_url: '',
    is_published: true,
    modules: [],
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
        if (course.created_at) {
          setCourseCreatedAt(new Date(course.created_at).getTime())
        }
        setFormData({
          title: course.title || '',
          slug: course.slug || '',
          description: course.description || '',
          category: course.category || 'TOEIC_2_SKILLS',
          level: course.level || 'BEGINNER',
          target_score: course.target_score || 500,
          price: course.price || 0,
          discount_price: course.discount_price || 0,
          thumbnail_url: course.thumbnail_url || '',
          is_published: course.is_published ?? true,
          modules:
            course.modules && course.modules.length > 0
              ? course.modules.map((m, mIdx) => ({
                  id: m._id || `mod-${mIdx}`,
                  title: m.title || '',
                  description: m.description || '',
                  module_order: m.module_order || mIdx + 1,
                  created_at_timestamp: m.created_at
                    ? new Date(m.created_at).getTime()
                    : Date.now() + mIdx * 1000,
                  lessons:
                    m.lessons && m.lessons.length > 0
                      ? m.lessons.map((l, lIdx) => ({
                          id: l._id || `les-${lIdx}`,
                          title: l.title || '',
                          video_url: l.video_url || '',
                          duration_minutes: l.duration_minutes || 0,
                          content: l.content || '',
                          is_preview: l.is_preview || false,
                          lesson_order: l.lesson_order || lIdx + 1,
                        }))
                      : [],
                }))
              : [],
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

  const courseSlug = formData.slug.trim() || 'untitled-course'
  const courseFolder = `courses/${courseSlug}-${courseCreatedAt}`

  return (
    <div className="space-y-6 w-full px-[10px] pb-12">
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
          courseFolder={courseFolder}
        />

        <CourseCurriculumManager
          modules={formData.modules}
          onChange={(modules) => setFormData((prev) => ({ ...prev, modules }))}
          onPreviewVideo={(url) => setVideoPreviewUrl(url)}
          isVi={isVi}
          courseFolder={courseFolder}
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
