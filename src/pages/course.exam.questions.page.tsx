// Trang điều phối tải dữ liệu và studio biên soạn đề thi bài kiểm tra khóa học.

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { courseService } from '@/services/course.service'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast.store'
import { CourseExamQuestionsEditor } from '@/components/exams/editor/course.exam.questions.editor'
import type { Course } from '@/types/api.types'

interface CourseExamQuestionsPageProps {
  examId: string
}

export function CourseExamQuestionsPage({ examId }: CourseExamQuestionsPageProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const isCreateMode = examId === 'new'

  const [exam, setExam] = useState<ToeicExamItem | null>(() => {
    if (isCreateMode) {
      return {
        id: `exam_new_${Date.now()}`,
        _id: `exam_new_${Date.now()}`,
        title: 'Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC (Placement Test)',
        type: 'DIAGNOSTIC_TEST',
        is_system_placement: true,
        skills_enabled: 'LR',
        placement_type: '2SKILLS',
        duration_minutes: 60,
        total_questions: 0,
        passing_score: 500,
        total_attempts: 0,
        avg_score: 0,
        is_published: true,
        created_at: new Date().toISOString(),
        questions: [],
        audio_url: '',
      }
    }
    const cachedStr = sessionStorage.getItem('lingo_admin_active_exam')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as ToeicExamItem
        if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
          return cached
        }
      } catch {}
    }
    return null
  })

  const [existingExams, setExistingExams] = useState<ToeicExamItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (isCreateMode) return false
    const cachedStr = sessionStorage.getItem('lingo_admin_active_exam')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as ToeicExamItem
        if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
          return false
        }
      } catch {}
    }
    return true
  })

  useEffect(() => {
    let isMounted = true

    examAdminService
      .getExams()
      .then((allExams) => {
        if (isMounted && Array.isArray(allExams)) {
          setExistingExams(allExams)
        }
      })
      .catch(() => {})

    if (isCreateMode) {
      return () => {
        isMounted = false
      }
    }

    const cachedStr = sessionStorage.getItem('lingo_admin_active_exam')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as ToeicExamItem
        if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
          setExam(cached)
          setIsLoading(false)
        }
      } catch {}
    }

    const loadData = async () => {
      try {
        if (examId.startsWith('course_final_')) {
          const courseId = examId.replace('course_final_', '')
          const rawRes = await courseService.getCourseById(courseId)
          const rawCourse = ((rawRes as { course?: Course }).course || rawRes) as Course
          if (rawCourse && isMounted) {
            const courseExam: ToeicExamItem = {
              id: rawCourse.final_test_exam_id || examId,
              _id: rawCourse.final_test_exam_id || examId,
              title: `Bài Thi Tốt Nghiệp: ${rawCourse.title}`,
              course_id: rawCourse._id,
              course_title: rawCourse.title,
              type: 'FULL_TEST',
              total_questions: rawCourse.final_test_questions?.length || 0,
              duration_minutes: 60,
              passing_score: rawCourse.final_test_passing_score || 70,
              is_published: rawCourse.is_published ?? true,
              questions: rawCourse.final_test_questions || [],
              audio_url: rawCourse.final_test_audio_url || '',
              author_id: rawCourse.author_id,
            }
            setExam(courseExam)
            sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(courseExam))
          }
        } else if (examId.startsWith('mod_challenge_')) {
          const modId = examId.replace('mod_challenge_', '')
          const coursesRes = await courseService.getAllCourses({ pageSize: 100 })
          const coursesList = coursesRes.result || []
          let found = false
          for (const c of coursesList) {
            try {
              const modulesList = await courseService.getModules(c._id)
              const foundMod = modulesList.find((m) => (m._id || m.id) === modId)
              if (foundMod && isMounted) {
                const qList =
                  foundMod.challenge_questions && foundMod.challenge_questions.length > 0
                    ? foundMod.challenge_questions
                    : foundMod.post_mini_questions && foundMod.post_mini_questions.length > 0
                    ? foundMod.post_mini_questions
                    : []
                const challengeExam: ToeicExamItem = {
                  id: examId,
                  _id: examId,
                  title: `Challenge Test: ${foundMod.title}`,
                  course_id: c._id,
                  course_title: c.title,
                  module_id: foundMod._id || foundMod.id,
                  module_title: foundMod.title,
                  type: 'CHALLENGE_TEST',
                  total_questions: qList.length,
                  duration_minutes:
                    foundMod.challenge_duration_minutes || foundMod.post_mini_duration_minutes || 15,
                  passing_score:
                    foundMod.challenge_passing_score || foundMod.post_mini_passing_score || 80,
                  is_published: true,
                  questions: qList,
                  audio_url:
                    foundMod.challenge_audio_url || foundMod.test_audio_url || foundMod.audio_url || '',
                  author_id: c.author_id,
                }
                setExam(challengeExam)
                sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(challengeExam))
                found = true
                break
              }
            } catch {}
          }
          if (!found && isMounted) {
            toast.error(isVi ? 'Không tìm thấy bài thi chương học.' : 'Module exam not found.')
          }
        } else {
          const freshExam = await examAdminService.getExamById(examId)
          if (freshExam && isMounted) {
            setExam(freshExam)
            sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(freshExam))
          } else if (isMounted) {
            toast.error(isVi ? 'Không tìm thấy bài thi chỉ định.' : 'Exam not found.')
          }
        }
      } catch {
        if (isMounted) {
          toast.error(isVi ? 'Lỗi khi tải thông tin bài thi.' : 'Failed to load exam.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [examId, isCreateMode, isVi])

  const handleBack = () => {
    sessionStorage.removeItem('lingo_admin_active_exam')
    setActiveNavItem('course-exams')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isVi ? 'Đang nạp dữ liệu bài thi...' : 'Loading exam studio...'}
        </p>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isVi ? 'Không tìm thấy thông tin bài thi' : 'Exam not found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Bài thi không tồn tại hoặc đã bị xóa khỏi hệ thống.'
              : 'The requested exam does not exist or has been deleted.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isVi ? 'Quay lại danh sách bài thi' : 'Back to Exams'}</span>
        </button>
      </div>
    )
  }

  return (
    <CourseExamQuestionsEditor
      initialExam={exam}
      isCreateMode={isCreateMode}
      existingExams={existingExams}
      isVi={isVi}
      onBack={handleBack}
    />
  )
}
