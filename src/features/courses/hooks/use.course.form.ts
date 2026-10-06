// Custom hook quan ly state form tao va sua khoa hoc, dong bo tai lieu va cau hoi luyen tap.

import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { CourseFormData, CourseLesson, CourseModule } from '@/features/courses/components/course.basic.info.tab'
import type { Course } from '@/features/courses/schemas/course.schema'
import { courseService } from '@/features/courses/services/course.service'
import { mediaService } from '@/features/media/services/media.service'
import { pathToNavItem, navItemToPath } from '@/routes/navigation'
import { authStore, useAuthStore } from '@/features/auth/store/auth.store'
import { toast } from '@/store/toast.store'
import { validateCourseFormData, generateCourseR2Folder } from '@/features/courses/helpers/course.helper'
import { queryClient } from '@/config/query.config'
import { courseAdminKeys } from '@/features/courses/keys/course.admin.keys'
import {
  uploadFolderResourcesToR2,
  type PendingFolderUploads,
} from '@/features/courses/helpers/course.folder.upload.helper'

export function useCourseForm(editCourseId?: string, isVi: boolean = true) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeNavItem = pathToNavItem(pathname)
  const setActiveNavItem = (target: string) => navigate(navItemToPath(target))
  const currentUser = useAuthStore((state) => state.user)
  const currentProfile = useAuthStore((state) => state.profile)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)

  const currentCourseId =
    editCourseId ||
    (activeNavItem.startsWith('course-edit:') ? activeNavItem.split(':')[1] : undefined) ||
    (pathname.startsWith('/courses/') && !pathname.includes('/courses/create')
      ? pathname.split('/courses/')[1].replace('/edit', '')
      : undefined)

  const isEditMode = Boolean(currentCourseId && currentCourseId !== 'create')

  const [randomFolderSuffix] = useState<string>(() => Math.random().toString(36).substring(2, 8))
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatusText, setSubmitStatusText] = useState('')
  const [pendingUploads, setPendingUploads] = useState<PendingFolderUploads | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleAbortSave = () => {
    if (abortControllerRef.current) {
      setSubmitStatusText(
        isVi
          ? 'Đang dừng tiến trình và dọn dẹp tài nguyên trên R2 & CSDL...'
          : 'Aborting and cleaning up resources on R2 & DB...'
      )
      abortControllerRef.current.abort()
    }
  }

  const [formData, setFormData] = useState<CourseFormData>(() => {
    const profile = authStore.getState().profile
    const user = authStore.getState().user
    const resolvedName = profile?.full_name || user?.full_name || ''
    const resolvedEmail = profile?.email || user?.email || ''
    const resolvedAvatar = profile?.avatar_url || user?.avatar_url || ''
    const resolvedRole = profile?.role || user?.role
    const resolvedTitle =
      resolvedRole === 'INSTRUCTOR' ? 'Giảng viên chuyên môn' : 'Quản trị viên học thuật'
    const resolvedBio = profile?.bio || ''

    return {
      title: '',
      slug: '',
      description: '',
      category: 'TOEIC_2_SKILLS',
      target_score: 500,
      price: 0,
      discount_price: 0,
      thumbnail_url: '',
      document_url: '',
      document_name: '',
      is_published: true,
      author_id: user?.user_id || profile?.user_id || '',
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
        if (!prev.author_name) {
          const resolvedName = currentProfile?.full_name || currentUser?.full_name || ''
          const resolvedEmail = currentProfile?.email || currentUser?.email || ''
          const resolvedAvatar = currentProfile?.avatar_url || currentUser?.avatar_url || ''
          const resolvedRole = currentProfile?.role || currentUser?.role
          const resolvedTitle =
            resolvedRole === 'INSTRUCTOR' ? 'Giảng viên chuyên môn' : 'Quản trị viên học thuật'
          const resolvedBio = currentProfile?.bio || ''

          return {
            ...prev,
            author_id: currentUser?.user_id || currentProfile?.user_id || '',
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
  }, [currentCourseId, isEditMode])

  const loadCourseData = async (courseId: string) => {
    setIsLoading(true)
    try {
      const course = await courseService.getCourseById(courseId)
      if (course) {
        const rawCurriculum = course.curriculum || course.modules || []

        const mappedModules = rawCurriculum.map((m, mIdx) => {
          const rawLessons = (m.lessons || []) as Array<Record<string, unknown>>
          return {
            id: (m._id || m.id || `mod-${mIdx}`) as string,
            title: (m.title || '') as string,
            description: (m.description || '') as string,
            module_order:
              typeof m.module_order === 'number'
                ? m.module_order
                : typeof m.order_index === 'number'
                ? m.order_index
                : mIdx + 1,
            is_free_preview: Boolean(m.is_free_preview),
            challenge_test_exam_id: m.challenge_test_exam_id as string | undefined,
            challenge_passing_score:
              typeof m.challenge_passing_score === 'number' ? m.challenge_passing_score : 80,
            challenge_questions: (m.challenge_questions ||
              []) as CourseFormData['final_test_questions'],
            post_mini_test_exam_id: m.post_mini_test_exam_id as string | undefined,
            post_mini_passing_score:
              typeof m.post_mini_passing_score === 'number' ? m.post_mini_passing_score : 60,
            post_mini_questions: (m.post_mini_questions ||
              []) as CourseFormData['final_test_questions'],
            passing_score:
              typeof m.passing_score === 'number'
                ? m.passing_score
                : typeof m.post_mini_passing_score === 'number'
                ? m.post_mini_passing_score
                : 70,
            test_questions: (m.test_questions ||
              m.post_mini_questions ||
              m.challenge_questions ||
              []) as CourseFormData['final_test_questions'],
            test_audio_url: (m.test_audio_url ||
              m.challenge_audio_url ||
              m.audio_url ||
              '') as string,
            challenge_audio_url: (m.challenge_audio_url ||
              m.test_audio_url ||
              m.audio_url ||
              '') as string,
            audio_url: (m.audio_url || m.test_audio_url || m.challenge_audio_url || '') as string,
            speaking_prompt: (m.speaking_prompt || '') as string,
            speaking_file_url: (m.speaking_file_url || '') as string,
            writing_prompt: (m.writing_prompt || '') as string,
            writing_file_url: (m.writing_file_url || '') as string,
            theory_file_url: (m.theory_file_url || '') as string,
            theory_file_name: (m.theory_file_name || '') as string,
            created_at_timestamp: m.created_at
              ? new Date(m.created_at as string).getTime()
              : Date.now() + mIdx * 1000,
            lessons: rawLessons.map((l, lIdx) => ({
              id: (l._id || l.id || `les-${lIdx}`) as string,
              title: (l.title || '') as string,
              video_url: (l.video_url || '') as string,
              theory_file_url: (l.theory_file_url || '') as string,
              theory_file_name: (l.theory_file_name || '') as string,
              questions: (Array.isArray(l.questions) ? l.questions : []) as CourseLesson['questions'],
              duration_minutes:
                typeof l.duration_minutes === 'number'
                  ? l.duration_minutes
                  : typeof l.duration_seconds === 'number'
                  ? l.duration_seconds >= 60
                    ? Math.round(l.duration_seconds / 60)
                    : Number((l.duration_seconds / 60).toFixed(2))
                  : 10,
              duration_seconds:
                typeof l.duration_seconds === 'number'
                  ? l.duration_seconds
                  : typeof l.duration_minutes === 'number'
                  ? l.duration_minutes * 60
                  : undefined,
              content: (l.content || l.content_html || '') as string,
              is_preview: Boolean(l.is_preview || l.is_free_preview),
              lesson_order:
                typeof l.lesson_order === 'number'
                  ? l.lesson_order
                  : typeof l.order_index === 'number'
                  ? l.order_index
                  : lIdx + 1,
            })),
          }
        })

        setFormData({
          title: (course.title || '') as string,
          slug: (course.slug || '') as string,
          description: (course.description || '') as string,
          category: (course.category || 'TOEIC_2_SKILLS') as CourseFormData['category'],
          target_score: typeof course.target_score === 'number' ? course.target_score : 500,
          price: typeof course.price === 'number' ? course.price : 0,
          discount_price:
            typeof course.discount_price === 'number' ? course.discount_price : 0,
          thumbnail_url: (course.thumbnail_url || '') as string,
          document_url: (course.document_url || '') as string,
          document_name: (course.document_name || '') as string,
          is_published:
            typeof course.is_published === 'boolean' ? course.is_published : true,
          author_id: course.author_id as string | undefined,
          author_name: (course.author_name || 'Đội ngũ Giảng viên LingoSphere') as string,
          author_email: course.author_email as string | undefined,
          author_avatar: (course.author_avatar || '') as string,
          author_title: (course.author_title || 'Giảng viên chuyên môn') as string,
          author_bio: (course.author_bio || '') as string,
          pre_test_exam_id: course.pre_test_exam_id as string | undefined,
          final_test_exam_id: course.final_test_exam_id as string | undefined,
          final_test_passing_score:
            typeof course.final_test_passing_score === 'number'
              ? course.final_test_passing_score
              : 70,
          final_test_questions: (course.final_test_questions ||
            []) as CourseFormData['final_test_questions'],
          final_test_audio_url: (course.final_test_audio_url || '') as string,
          final_test_speaking_prompt: (course.final_test_speaking_prompt || '') as string,
          final_test_speaking_file_url: (course.final_test_speaking_file_url || '') as string,
          final_test_writing_prompt: (course.final_test_writing_prompt || '') as string,
          final_test_writing_file_url: (course.final_test_writing_file_url || '') as string,
          modules: mappedModules,
        })
      }
    } catch (err: unknown) {
      console.error('Failed to load course details:', err)
      const msg = err instanceof Error ? err.message : 'Không thể tải thông tin khóa học'
      toast.error(msg)
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

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    const uploadedR2Urls: string[] = []
    let createdCourseId: string | null = null

    setIsSubmitting(true)
    try {
      let finalCourseInfo: Partial<CourseFormData> = { ...formData }
      let finalModules: CourseModule[] = formData.modules

      const resolvedCourseFolder = generateCourseR2Folder(
        finalCourseInfo.title || formData.title,
        finalCourseInfo.slug || formData.slug,
        randomFolderSuffix
      )

      if (pendingUploads) {
        setSubmitStatusText(isVi ? 'Đang tải tệp lên Cloudflare R2...' : 'Uploading files to R2...')
        const uploadResult = await uploadFolderResourcesToR2(
          pendingUploads,
          resolvedCourseFolder,
          formData,
          formData.modules,
          (progress) => {
            const status = isVi
              ? `Đang tải lên R2 (${progress.completedFiles}/${progress.totalFiles} tệp - ${progress.percent}%)...`
              : `Uploading to R2 (${progress.completedFiles}/${progress.totalFiles} - ${progress.percent}%)...`
            setSubmitStatusText(status)
          },
          abortController.signal,
          (url) => {
            uploadedR2Urls.push(url)
          }
        )

        if (abortController.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError')
        }

        finalCourseInfo = uploadResult.courseInfo
        finalModules = uploadResult.modules

        if (uploadResult.failedCount > 0) {
          toast.warning(
            isVi
              ? `Có ${uploadResult.failedCount} file tải lên bị gián đoạn, đang tiếp tục lưu khóa học.`
              : `${uploadResult.failedCount} files failed to upload, continuing save.`
          )
        }
      }

      if (abortController.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      setSubmitStatusText(isVi ? 'Đang lưu khóa học vào hệ thống...' : 'Saving course to system...')

      const payload: Partial<Course> = {
        title: finalCourseInfo.title || formData.title,
        slug: finalCourseInfo.slug || formData.slug,
        description: finalCourseInfo.description || formData.description,
        category: finalCourseInfo.category || formData.category,
        target_score: Number(finalCourseInfo.target_score ?? formData.target_score),
        price: Number(finalCourseInfo.price ?? formData.price),
        discount_price: Number(finalCourseInfo.discount_price ?? formData.discount_price),
        thumbnail_url: finalCourseInfo.thumbnail_url || formData.thumbnail_url,
        document_url: finalCourseInfo.document_url || formData.document_url || '',
        document_name: finalCourseInfo.document_name || formData.document_name || '',
        is_published: finalCourseInfo.is_published ?? formData.is_published,
        author_id: finalCourseInfo.author_id || formData.author_id || currentUser?.user_id || '',
        author_name: finalCourseInfo.author_name || formData.author_name || currentUser?.full_name || currentProfile?.full_name || '',
        author_email: finalCourseInfo.author_email || formData.author_email || currentUser?.email || '',
        author_avatar: finalCourseInfo.author_avatar || formData.author_avatar || '',
        author_title: finalCourseInfo.author_title || formData.author_title || ((currentUser?.role || currentProfile?.role) === 'INSTRUCTOR' ? 'Giảng viên chuyên môn' : 'Quản trị viên học thuật'),
        author_bio: finalCourseInfo.author_bio || formData.author_bio || '',
        pre_test_exam_id: finalCourseInfo.pre_test_exam_id || formData.pre_test_exam_id || undefined,
        final_test_exam_id: finalCourseInfo.final_test_exam_id || formData.final_test_exam_id || undefined,
        final_test_passing_score: Number(finalCourseInfo.final_test_passing_score ?? formData.final_test_passing_score) || 70,
        final_test_questions: finalCourseInfo.final_test_questions || formData.final_test_questions || [],
        final_test_audio_url: finalCourseInfo.final_test_audio_url || formData.final_test_audio_url || '',
        final_test_speaking_prompt: finalCourseInfo.final_test_speaking_prompt || formData.final_test_speaking_prompt || '',
        final_test_speaking_file_url: finalCourseInfo.final_test_speaking_file_url || formData.final_test_speaking_file_url || '',
        final_test_writing_prompt: finalCourseInfo.final_test_writing_prompt || formData.final_test_writing_prompt || '',
        final_test_writing_file_url: finalCourseInfo.final_test_writing_file_url || formData.final_test_writing_file_url || '',
        modules: finalModules.map((m, mIdx) => ({
          _id: m.id || `mod-${mIdx}`,
          course_id: isEditMode && currentCourseId ? currentCourseId : '',
          title: m.title,
          description: m.description,
          order_index: mIdx + 1,
          module_order: mIdx + 1,
          theory_file_url: m.theory_file_url || '',
          theory_file_name: m.theory_file_name || '',
          passing_score:
            Number(m.passing_score) ||
            Number(m.post_mini_passing_score) ||
            Number(m.challenge_passing_score) ||
            70,
          test_questions:
            m.test_questions || m.post_mini_questions || m.challenge_questions || [],
          test_audio_url: m.test_audio_url || m.challenge_audio_url || m.audio_url || '',
          challenge_test_exam_id: m.challenge_test_exam_id,
          challenge_passing_score:
            Number(m.passing_score) || Number(m.challenge_passing_score) || 70,
          challenge_questions: m.test_questions || m.challenge_questions || [],
          challenge_audio_url:
            m.challenge_audio_url || m.test_audio_url || m.audio_url || '',
          post_mini_test_exam_id: m.post_mini_test_exam_id,
          post_mini_passing_score:
            Number(m.passing_score) || Number(m.post_mini_passing_score) || 70,
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
            theory_file_url: l.theory_file_url || '',
            theory_file_name: l.theory_file_name || '',
            questions: l.questions || [],
            duration_minutes:
              typeof l.duration_minutes === 'number' && l.duration_minutes > 0
                ? l.duration_minutes
                : l.duration_seconds
                ? l.duration_seconds >= 60
                  ? Math.round(l.duration_seconds / 60)
                  : Number((l.duration_seconds / 60).toFixed(2))
                : 10,
            duration_seconds:
              typeof l.duration_seconds === 'number' && l.duration_seconds > 0
                ? l.duration_seconds
                : (Number(l.duration_minutes) || 10) * 60,
            content: l.content || '',
            content_html: l.content || '',
            is_preview: Boolean(l.is_preview),
            is_free_preview: Boolean(l.is_preview),
            order_index: lIdx + 1,
            lesson_order: lIdx + 1,
          })),
        })),
      }

      const allMediaUrls: string[] = [...uploadedR2Urls]
      if (payload.thumbnail_url) allMediaUrls.push(payload.thumbnail_url)
      if (payload.document_url) allMediaUrls.push(payload.document_url)
      if (payload.final_test_audio_url) allMediaUrls.push(payload.final_test_audio_url)
      if (payload.final_test_speaking_file_url)
        allMediaUrls.push(payload.final_test_speaking_file_url)
      if (payload.final_test_writing_file_url)
        allMediaUrls.push(payload.final_test_writing_file_url)
      if (Array.isArray(payload.final_test_questions)) {
        payload.final_test_questions.forEach((q) => {
          if (q.media_url) allMediaUrls.push(q.media_url)
        })
      }
      payload.modules?.forEach((mod) => {
        if (mod.theory_file_url) allMediaUrls.push(mod.theory_file_url)
        if (mod.test_audio_url) allMediaUrls.push(mod.test_audio_url)
        if (mod.challenge_audio_url) allMediaUrls.push(mod.challenge_audio_url)
        if (mod.audio_url) allMediaUrls.push(mod.audio_url)
        const qList =
          mod.test_questions || mod.post_mini_questions || mod.challenge_questions || []
        qList.forEach((q) => {
          if (q.media_url) allMediaUrls.push(q.media_url)
        })
        mod.lessons?.forEach((les) => {
          if (les.video_url) allMediaUrls.push(les.video_url)
          if (les.theory_file_url) allMediaUrls.push(les.theory_file_url)
        })
      })

      if (abortController.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      if (isEditMode && currentCourseId) {
        await courseService.updateCourse(currentCourseId, payload)
        if (allMediaUrls.length > 0) {
          mediaService.confirmMedia(allMediaUrls, currentCourseId).catch(() => {})
        }
        toast.success(`Đã cập nhật khóa học "${formData.title}" thành công!`)
      } else {
        const created = await courseService.createCourse(payload)
        createdCourseId = created._id
        if (abortController.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError')
        }
        if (allMediaUrls.length > 0) {
          mediaService.confirmMedia(allMediaUrls, created._id).catch(() => {})
        }
        toast.success(`Đã tạo khóa học mới "${formData.title}" thành công!`)
      }

      setPendingUploads(null)
      await queryClient.invalidateQueries({ queryKey: courseAdminKeys.all })
      setActiveNavItem('courses')
    } catch (err: unknown) {
      const isAborted =
        abortController.signal.aborted ||
        (err instanceof DOMException && err.name === 'AbortError') ||
        (err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('abort')))

      if (isAborted) {
        setSubmitStatusText(
          isVi
            ? 'Đang xóa sạch dữ liệu trên R2 và CSDL...'
            : 'Cleaning up resources on R2 and database...'
        )
        try {
          if (uploadedR2Urls.length > 0) {
            await mediaService.cleanupTempMedia(uploadedR2Urls)
          }
          if (createdCourseId) {
            await courseService.deleteCourse(createdCourseId)
          }
        } catch (cleanupErr) {
          console.error('[Rollback] Cleanup error:', cleanupErr)
        }
        toast.info(
          isVi
            ? 'Đã hủy tiến trình lưu và dọn dẹp sạch toàn bộ tài nguyên trên Cloudflare R2 & CSDL.'
            : 'Save process was canceled and all associated resources on R2 & DB were deleted.'
        )
      } else {
        const msg = err instanceof Error ? err.message : 'Lưu khóa học thất bại'
        toast.error(msg)
      }
    } finally {
      setIsSubmitting(false)
      setSubmitStatusText('')
      abortControllerRef.current = null
    }
  }

  const totalLessons = formData.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalDuration = formData.modules.reduce(
    (acc, m) =>
      acc + m.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration_minutes) || 0), 0),
    0
  )

  const courseFolder = generateCourseR2Folder(formData.title, formData.slug, randomFolderSuffix)

  return {
    formData,
    setFormData,
    isEditMode,
    isLoading,
    isSubmitting,
    submitStatusText,
    pendingUploads,
    setPendingUploads,
    videoPreviewUrl,
    setVideoPreviewUrl,
    handleSubmit,
    handleAbortSave,
    totalLessons,
    totalDuration,
    courseFolder,
    setActiveNavItem,
  }
}
