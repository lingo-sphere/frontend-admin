/**
 * @file course.form.page.tsx
 * @description Trang quản trị CourseFormPage trong giao diện Admin
 */

import {
  CourseBasicInfoTab,
  type CourseFormData,
} from '@/components/courses/course.basic.info.tab'
import { CourseCurriculumManager } from '@/components/courses/course.curriculum.manager'
import { courseService } from '@/services/course.service'
import { mediaService } from '@/services/media.service'
import { useAdminStore } from '@/store/admin.store'
import { authStore, useAuthStore } from '@/store/auth.store'
import { toast } from '@/store/toast.store'
import { BookOpen, ChevronLeft, Save, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { validateCourseFormData } from '@/helpers/course.helper'
import { VideoPreviewModal } from '@/components/common/video.preview.modal'

interface CourseFormPageProps {
  editCourseId?: string
}

export function CourseFormPage({ editCourseId }: CourseFormPageProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const activeNavItem = useAdminStore((state) => state.activeNavItem)
  const currentUser = useAuthStore((state) => state.user)
  const currentProfile = useAuthStore((state) => state.profile)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)

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

  const [formData, setFormData] = useState<CourseFormData>(() => {
    const profile = authStore.getState().profile
    const user = authStore.getState().user
    const userPayload = user as unknown as Record<string, unknown>
    const resolvedName =
      profile?.full_name ||
      (userPayload?.full_name as string) ||
      (userPayload?.name as string) ||
      (user?.email ? user.email.split('@')[0] : '')
    const resolvedEmail = profile?.email || user?.email || ''
    const resolvedAvatar = profile?.avatar_url || (userPayload?.avatar_url as string) || (userPayload?.avatar as string) || ''
    const resolvedRole = profile?.role || user?.role
    const resolvedTitle = resolvedRole === 'INSTRUCTOR' ? 'Giảng viên chuyên môn' : 'Quản trị viên học thuật'
    const resolvedBio = profile?.bio || ''

    return {
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
      author_id: profile?.user_id || user?.user_id,
      author_name: resolvedName,
      author_email: resolvedEmail,
      author_avatar: resolvedAvatar,
      author_title: resolvedTitle,
      author_bio: resolvedBio,
      final_test_passing_score: 70,
      final_test_questions: [],
      final_test_audio_url: '',
      final_test_speaking_prompt: '',
      final_test_speaking_file_url: '',
      final_test_writing_prompt: '',
      final_test_writing_file_url: '',
      modules: [],
    }
  })

  useEffect(() => {
    if (!currentProfile) {
      fetchCurrentUser()
    }
  }, [currentProfile, fetchCurrentUser])

  useEffect(() => {
    if (!isEditMode && (currentProfile || currentUser)) {
      setFormData((prev) => {
        if (!prev.author_name || prev.author_name === 'Đội ngũ Giảng viên LingoSphere') {
          const userPayload = currentUser as unknown as Record<string, unknown>
          const resolvedName =
            currentProfile?.full_name ||
            (userPayload?.full_name as string) ||
            (userPayload?.name as string) ||
            (currentUser?.email ? currentUser.email.split('@')[0] : prev.author_name)
          const resolvedEmail = currentProfile?.email || currentUser?.email || prev.author_email
          const resolvedAvatar = currentProfile?.avatar_url || (userPayload?.avatar_url as string) || (userPayload?.avatar as string) || prev.author_avatar
          const resolvedRole = currentProfile?.role || currentUser?.role
          const resolvedTitle = resolvedRole === 'INSTRUCTOR' ? 'Giảng viên chuyên môn' : 'Quản trị viên học thuật'
          const resolvedBio = currentProfile?.bio || prev.author_bio || ''

          return {
            ...prev,
            author_id: currentProfile?.user_id || currentUser?.user_id || prev.author_id,
            author_name: resolvedName,
            author_email: resolvedEmail,
            author_avatar: resolvedAvatar,
            author_title: resolvedTitle,
            author_bio: resolvedBio,
          }
        }
        return prev
      })
    }
  }, [isEditMode, currentProfile, currentUser])

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
            test_audio_url: (m.test_audio_url || m.challenge_audio_url || m.audio_url || '') as string,
            challenge_audio_url: (m.challenge_audio_url || m.test_audio_url || m.audio_url || '') as string,
            audio_url: (m.audio_url || m.test_audio_url || m.challenge_audio_url || '') as string,
            speaking_prompt: (m.speaking_prompt || '') as string,
            speaking_file_url: (m.speaking_file_url || '') as string,
            writing_prompt: (m.writing_prompt || '') as string,
            writing_file_url: (m.writing_file_url || '') as string,
            created_at_timestamp: m.created_at
              ? new Date(m.created_at as string).getTime()
              : Date.now() + mIdx * 1000,
            lessons: rawLessons.map((l, lIdx) => ({
              id: (l._id || l.id || `les-${lIdx}`) as string,
              title: (l.title || '') as string,
              video_url: (l.video_url || '') as string,
              duration_minutes: typeof l.duration_minutes === 'number' ? l.duration_minutes : typeof l.duration_seconds === 'number' ? (l.duration_seconds >= 60 ? Math.round(l.duration_seconds / 60) : Number((l.duration_seconds / 60).toFixed(2))) : 10,
              duration_seconds: typeof l.duration_seconds === 'number' ? l.duration_seconds : typeof l.duration_minutes === 'number' ? l.duration_minutes * 60 : undefined,
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
          author_id: course.author_id as string | undefined,
          author_name: (course.author_name || 'Đội ngũ Giảng viên LingoSphere') as string,
          author_email: course.author_email as string | undefined,
          author_avatar: (course.author_avatar || '') as string,
          author_title: (course.author_title || 'Giảng viên chuyên môn') as string,
          author_bio: (course.author_bio || '') as string,
          pre_test_exam_id: course.pre_test_exam_id as string | undefined,
          final_test_exam_id: course.final_test_exam_id as string | undefined,
          final_test_passing_score: typeof course.final_test_passing_score === 'number' ? course.final_test_passing_score : 70,
          final_test_questions: (course.final_test_questions || []) as CourseFormData['final_test_questions'],
          final_test_audio_url: (course.final_test_audio_url || '') as string,
          final_test_speaking_prompt: (course.final_test_speaking_prompt || '') as string,
          final_test_speaking_file_url: (course.final_test_speaking_file_url || '') as string,
          final_test_writing_prompt: (course.final_test_writing_prompt || '') as string,
          final_test_writing_file_url: (course.final_test_writing_file_url || '') as string,
          modules: mappedModules,
        })
      }
    } catch {
      toast.error('Không thể tải thông tin khóa học')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validationError = validateCourseFormData(formData, isVi)
    if (validationError) {
      toast.error(validationError)
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
        author_id: formData.author_id || currentUser?.user_id,
        author_name: formData.author_name || 'Đội ngũ Giảng viên LingoSphere',
        author_email: formData.author_email || currentUser?.email,
        author_avatar: formData.author_avatar || '',
        author_title: formData.author_title || 'Giảng viên chuyên môn',
        author_bio: formData.author_bio || '',
        pre_test_exam_id: formData.pre_test_exam_id || undefined,
        final_test_exam_id: formData.final_test_exam_id || undefined,
        final_test_passing_score: Number(formData.final_test_passing_score) || 70,
        final_test_questions: formData.final_test_questions || [],
        final_test_audio_url: formData.final_test_audio_url || '',
        final_test_speaking_prompt: formData.final_test_speaking_prompt || '',
        final_test_speaking_file_url: formData.final_test_speaking_file_url || '',
        final_test_writing_prompt: formData.final_test_writing_prompt || '',
        final_test_writing_file_url: formData.final_test_writing_file_url || '',
        modules: formData.modules.map((m, mIdx) => ({
          _id: m.id || `mod-${mIdx}`,
          course_id: currentCourseId || '',
          title: m.title,
          description: m.description,
          module_order: mIdx + 1,
          passing_score: Number(m.passing_score) || Number(m.post_mini_passing_score) || Number(m.challenge_passing_score) || 70,
          test_questions: m.test_questions || m.post_mini_questions || m.challenge_questions || [],
          test_audio_url: m.test_audio_url || m.challenge_audio_url || m.audio_url || '',
          challenge_test_exam_id: m.challenge_test_exam_id,
          challenge_passing_score: Number(m.passing_score) || Number(m.challenge_passing_score) || 70,
          challenge_questions: m.test_questions || m.challenge_questions || [],
          challenge_audio_url: m.challenge_audio_url || m.test_audio_url || m.audio_url || '',
          post_mini_test_exam_id: m.post_mini_test_exam_id,
          post_mini_passing_score: Number(m.passing_score) || Number(m.post_mini_passing_score) || 70,
          post_mini_questions: m.test_questions || m.post_mini_questions || [],
          audio_url: m.audio_url || m.test_audio_url || m.challenge_audio_url || '',
          speaking_prompt: m.speaking_prompt || '',
          speaking_file_url: m.speaking_file_url || '',
          writing_prompt: m.writing_prompt || '',
          writing_file_url: m.writing_file_url || '',
          lessons: m.lessons.map((l, lIdx) => ({
            _id: l.id || `les-${lIdx}`,
            module_id: m.id || `mod-${mIdx}`,
            title: l.title,
            lesson_type: l.video_url ? 'VIDEO' : 'READING',
            video_url: l.video_url || '',
            duration_minutes: typeof l.duration_minutes === 'number' && l.duration_minutes > 0 ? l.duration_minutes : (l.duration_seconds ? (l.duration_seconds >= 60 ? Math.round(l.duration_seconds / 60) : Number((l.duration_seconds / 60).toFixed(2))) : 10),
            duration_seconds: typeof l.duration_seconds === 'number' && l.duration_seconds > 0 ? l.duration_seconds : (Number(l.duration_minutes) || 10) * 60,
            content: l.content || '',
            content_html: l.content || '',
            is_preview: Boolean(l.is_preview),
            is_free_preview: Boolean(l.is_preview),
            lesson_order: lIdx + 1,
          })),
        })),
      }

      const allMediaUrls: string[] = []
      if (formData.thumbnail_url) allMediaUrls.push(formData.thumbnail_url)
      if (formData.final_test_audio_url) allMediaUrls.push(formData.final_test_audio_url)
      if (formData.final_test_speaking_file_url) allMediaUrls.push(formData.final_test_speaking_file_url)
      if (formData.final_test_writing_file_url) allMediaUrls.push(formData.final_test_writing_file_url)
      if (Array.isArray(formData.final_test_questions)) {
        formData.final_test_questions.forEach((q) => {
          if (q.media_url) allMediaUrls.push(q.media_url)
        })
      }
      formData.modules.forEach((mod) => {
        if (mod.test_audio_url) allMediaUrls.push(mod.test_audio_url)
        if (mod.challenge_audio_url) allMediaUrls.push(mod.challenge_audio_url)
        if (mod.audio_url) allMediaUrls.push(mod.audio_url)
        const qList = mod.test_questions || mod.post_mini_questions || mod.challenge_questions || []
        qList.forEach((q) => {
          if (q.media_url) allMediaUrls.push(q.media_url)
        })
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CourseBasicInfoTab
          formData={formData}
          onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
          isVi={isVi}
          courseFolder={courseFolder}
        />

        <CourseCurriculumManager
          modules={formData.modules}
          onChange={(modules) => setFormData((prev) => ({ ...prev, modules }))}
          onPreviewVideo={(url) => setVideoPreviewUrl(url)}
          isVi={isVi}
          is4Skills={formData.category === 'TOEIC_4_SKILLS'}
          courseFolder={courseFolder}
        />

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveNavItem('courses')}
            className="flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <span>{isVi ? 'Hủy Bỏ' : 'Cancel'}</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu Khóa Học' : 'Save Course')}</span>
          </button>
        </div>
      </form>

      {videoPreviewUrl && (
        <VideoPreviewModal
          isOpen={!!videoPreviewUrl}
          onClose={() => setVideoPreviewUrl(null)}
          videoUrl={videoPreviewUrl}
          isVi={isVi}
        />
      )}
    </div>
  )
}
