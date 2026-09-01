import {
  CourseBasicInfoTab,
  type CourseFormData,
} from '@/components/courses/CourseBasicInfoTab'
import { CourseCurriculumManager } from '@/components/courses/CourseCurriculumManager'
import { courseService } from '@/services/course.service'
import { mediaService } from '@/services/media.service'
import { useAdminStore } from '@/store/admin-store'
import { toast } from '@/store/toast-store'
import { BookOpen, ChevronLeft, Save, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

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
    final_test_passing_score: 70,
    final_test_questions: [],
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
      const rawRes = (await courseService.getCourseById(courseId)) as unknown as Record<string, unknown>
      if (rawRes) {
        const course = (rawRes.course as Record<string, unknown>) || rawRes
        const rawCurriculum = (rawRes.curriculum || course.modules || []) as Array<Record<string, unknown>>

        if (course.created_at) {
          setCourseCreatedAt(new Date(course.created_at as string).getTime())
        }

        const mappedModules = rawCurriculum.map((m, mIdx) => {
          const rawLessons = (m.lessons || []) as Array<Record<string, unknown>>
          return {
            id: (m._id || m.id || `mod-${mIdx}`) as string,
            title: (m.title || '') as string,
            description: (m.description || '') as string,
            module_order: typeof m.module_order === 'number' ? m.module_order : typeof m.order_index === 'number' ? m.order_index : mIdx + 1,
            is_free_preview: Boolean(m.is_free_preview),
            challenge_test_exam_id: m.challenge_test_exam_id as string | undefined,
            challenge_passing_score: typeof m.challenge_passing_score === 'number' ? m.challenge_passing_score : 80,
            challenge_questions: (m.challenge_questions || []) as CourseFormData['final_test_questions'],
            post_mini_test_exam_id: m.post_mini_test_exam_id as string | undefined,
            post_mini_passing_score: typeof m.post_mini_passing_score === 'number' ? m.post_mini_passing_score : 60,
            post_mini_questions: (m.post_mini_questions || []) as CourseFormData['final_test_questions'],
            passing_score: typeof m.passing_score === 'number' ? m.passing_score : typeof m.post_mini_passing_score === 'number' ? m.post_mini_passing_score : 70,
            test_questions: (m.test_questions || m.post_mini_questions || m.challenge_questions || []) as CourseFormData['final_test_questions'],
            created_at_timestamp: m.created_at
              ? new Date(m.created_at as string).getTime()
              : Date.now() + mIdx * 1000,
            lessons: rawLessons.map((l, lIdx) => ({
              id: (l._id || l.id || `les-${lIdx}`) as string,
              title: (l.title || '') as string,
              video_url: (l.video_url || '') as string,
              duration_minutes: typeof l.duration_minutes === 'number' ? l.duration_minutes : typeof l.duration_seconds === 'number' ? Math.round(l.duration_seconds / 60) : 10,
              content: (l.content || l.content_html || '') as string,
              is_preview: Boolean(l.is_preview || l.is_free_preview),
              lesson_order: typeof l.lesson_order === 'number' ? l.lesson_order : typeof l.order_index === 'number' ? l.order_index : lIdx + 1,
            })),
          }
        })

        setFormData({
          title: (course.title || '') as string,
          slug: (course.slug || '') as string,
          description: (course.description || '') as string,
          category: (course.category || 'TOEIC_2_SKILLS') as CourseFormData['category'],
          level: (course.level || 'BEGINNER') as CourseFormData['level'],
          target_score: typeof course.target_score === 'number' ? course.target_score : 500,
          price: typeof course.price === 'number' ? course.price : 0,
          discount_price: typeof course.discount_price === 'number' ? course.discount_price : 0,
          thumbnail_url: (course.thumbnail_url || '') as string,
          is_published: typeof course.is_published === 'boolean' ? course.is_published : true,
          pre_test_exam_id: course.pre_test_exam_id as string | undefined,
          final_test_exam_id: course.final_test_exam_id as string | undefined,
          final_test_passing_score: typeof course.final_test_passing_score === 'number' ? course.final_test_passing_score : 70,
          final_test_questions: (course.final_test_questions || []) as CourseFormData['final_test_questions'],
          modules: mappedModules,
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
        pre_test_exam_id: formData.pre_test_exam_id || undefined,
        final_test_exam_id: formData.final_test_exam_id || undefined,
        final_test_passing_score: Number(formData.final_test_passing_score) || 70,
        final_test_questions: formData.final_test_questions || [],
        modules: formData.modules.map((m, mIdx) => ({
          _id: m.id || `mod-${mIdx}`,
          course_id: currentCourseId || '',
          title: m.title,
          description: m.description,
          module_order: mIdx + 1,
          passing_score: Number(m.passing_score) || Number(m.post_mini_passing_score) || Number(m.challenge_passing_score) || 70,
          test_questions: m.test_questions || m.post_mini_questions || m.challenge_questions || [],
          challenge_test_exam_id: m.challenge_test_exam_id,
          challenge_passing_score: Number(m.passing_score) || Number(m.challenge_passing_score) || 70,
          challenge_questions: m.test_questions || m.challenge_questions || [],
          post_mini_test_exam_id: m.post_mini_test_exam_id,
          post_mini_passing_score: Number(m.passing_score) || Number(m.post_mini_passing_score) || 70,
          post_mini_questions: m.test_questions || m.post_mini_questions || [],
          lessons: m.lessons.map((l, lIdx) => ({
            _id: l.id || `les-${lIdx}`,
            module_id: m.id || `mod-${mIdx}`,
            title: l.title,
            lesson_type: l.video_url ? 'VIDEO' : 'READING',
            video_url: l.video_url || '',
            duration_minutes: Number(l.duration_minutes) || 10,
            duration_seconds: (Number(l.duration_minutes) || 10) * 60,
            content: l.content || '',
            content_html: l.content || '',
            is_preview: Boolean(l.is_preview),
            lesson_order: lIdx + 1,
          })),
        })),
      }

      const allMediaUrls: string[] = []
      if (formData.thumbnail_url) allMediaUrls.push(formData.thumbnail_url)
      formData.modules.forEach((mod) => {
        mod.lessons.forEach((les) => {
          if (les.video_url) allMediaUrls.push(les.video_url)
        })
      })

      if (isEditMode && currentCourseId) {
        await courseService.updateCourse(currentCourseId, payload)
        if (allMediaUrls.length > 0) {
          mediaService.confirmMedia(allMediaUrls, currentCourseId).catch(() => {})
        }
        toast.success(`Đã cập nhật khóa học "${formData.title}" thành công!`)
      } else {
        const created = await courseService.createCourse(payload)
        const newCourseId = (created as { _id?: string; id?: string })?._id || (created as { _id?: string; id?: string })?.id
        if (allMediaUrls.length > 0) {
          mediaService.confirmMedia(allMediaUrls, newCourseId).catch(() => {})
        }
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
