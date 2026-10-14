// Trang điều phối tải dữ liệu và studio biên soạn đề thi bài kiểm tra khóa học với TanStack Query.
import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { examAdminService, type ToeicExamItem } from '@/features/exams/services/exam.service'
import { toast } from '@/store/toast.store'
import { CourseExamQuestionsEditor } from '@/features/courses/components/course.exam.questions.editor'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { Course } from '@/features/courses/schemas/course.schema'

interface CourseExamQuestionsPageProps {
  examId: string
}

function createNewExamTemplate(type: '2SKILLS' | '4SKILLS' = '2SKILLS'): ToeicExamItem {
  const is4Skills = type === '4SKILLS'
  const stableId = is4Skills ? 'exam_new_placement_4skills' : 'exam_new_placement_2skills'
  return {
    id: stableId,
    _id: stableId,
    title: is4Skills
      ? 'Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC 4 Kỹ Năng (Full Skills)'
      : 'Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC 2 Kỹ Năng (LR)',
    type: 'DIAGNOSTIC_TEST',
    is_system_placement: true,
    skills_enabled: is4Skills ? 'ALL' : 'LR',
    placement_type: is4Skills ? '4SKILLS' : '2SKILLS',
    duration_minutes: is4Skills ? 90 : 60,
    total_questions: 0,
    passing_score: is4Skills ? 650 : 500,
    total_attempts: 0,
    avg_score: 0,
    is_published: true,
    created_at: new Date().toISOString(),
    questions: [],
    audio_url: '',
  }
}

export function CourseExamQuestionsPage({ examId }: CourseExamQuestionsPageProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedType: '2SKILLS' | '4SKILLS' =
    searchParams.get('type') === '4SKILLS' || searchParams.get('skills') === '4SKILLS'
      ? '4SKILLS'
      : '2SKILLS'

  const isCreateMode = examId === 'new'

  const initialCachedExam = useMemo(() => {
    if (isCreateMode) {
      const cached = storage.session.get<ToeicExamItem>(STORAGE_KEYS.ACTIVE_EXAM)
      if (cached && cached.is_system_placement) {
        const cachedType =
          (cached.placement_type as '2SKILLS' | '4SKILLS') ||
          (cached.skills_enabled === 'ALL' ? '4SKILLS' : '2SKILLS')
        if (cachedType === requestedType) {
          return cached
        }
      }
      return createNewExamTemplate(requestedType)
    }
    const cached = storage.session.get<ToeicExamItem>(STORAGE_KEYS.ACTIVE_EXAM)
    if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
      return cached
    }
    return undefined
  }, [examId, isCreateMode, requestedType])

  const { data: existingExams = [] } = useQuery<ToeicExamItem[]>({
    queryKey: ['exams-all-existing'],
    queryFn: async () => {
      const allExams = await examAdminService.getExams()
      return Array.isArray(allExams) ? allExams : []
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const {
    data: exam = null,
    isLoading,
  } = useQuery<ToeicExamItem | null>({
    queryKey: ['exam-question-studio', examId, requestedType],
    queryFn: async () => {
      if (isCreateMode) {
        const cached = storage.session.get<ToeicExamItem>(STORAGE_KEYS.ACTIVE_EXAM)
        if (cached && cached.is_system_placement) {
          const cachedType =
            (cached.placement_type as '2SKILLS' | '4SKILLS') ||
            (cached.skills_enabled === 'ALL' ? '4SKILLS' : '2SKILLS')
          if (cachedType === requestedType) {
            return cached
          }
        }
        return createNewExamTemplate(requestedType)
      }

      if (examId.startsWith('course_final_')) {
        const courseId = examId.replace('course_final_', '')
        const rawRes = await courseService.getCourseById(courseId)
        const rawCourse = ((rawRes as { course?: Course }).course || rawRes) as Course
        if (rawCourse) {
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
          storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, courseExam)
          return courseExam
        }
        return null
      }

      if (examId.startsWith('mod_challenge_')) {
        const modId = examId.replace('mod_challenge_', '')
        const coursesRes = await courseService.getAllCourses({ pageSize: 100 })
        const coursesList = coursesRes.result || []

        for (const c of coursesList) {
          try {
            const modulesList = await courseService.getModules(c._id)
            const foundMod = modulesList.find((m) => (m._id || m.id) === modId)
            if (foundMod) {
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
              storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, challengeExam)
              return challengeExam
            }
          } catch {}
        }
        toast.error(isVi ? 'Không tìm thấy bài thi chương học.' : 'Module exam not found.')
        return null
      }

      const freshExam = await examAdminService.getExamById(examId)
      if (freshExam) {
        storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, freshExam)
        return freshExam
      }
      toast.error(isVi ? 'Không tìm thấy bài thi chỉ định.' : 'Exam not found.')
      return null
    },
    initialData: initialCachedExam,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const { pathname } = useLocation()
  const isPlacementContext = Boolean(
    pathname.includes('/placement-tests') ||
    exam?.is_system_placement ||
    exam?.type === 'DIAGNOSTIC_TEST'
  )
  const isCourseContext = Boolean(
    pathname.startsWith('/course-exams') ||
    exam?.course_id ||
    String(examId).startsWith('course_final_') ||
    String(examId).startsWith('mod_challenge_')
  )
  const examContext: 'TOEIC' | 'PLACEMENT' | 'COURSE' = isPlacementContext
    ? 'PLACEMENT'
    : isCourseContext
    ? 'COURSE'
    : 'TOEIC'

  const handleBack = useCallback(() => {
    storage.session.remove(STORAGE_KEYS.ACTIVE_EXAM)
    if (examContext === 'PLACEMENT') {
      navigate('/practice/placement-tests')
    } else if (examContext === 'TOEIC') {
      navigate('/practice/exams')
    } else {
      navigate('/course-exams')
    }
  }, [navigate, examContext])

  if (isLoading && !exam) {
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
      key={`${exam._id || exam.id}_${exam.placement_type || requestedType}`}
      initialExam={exam}
      isCreateMode={isCreateMode}
      existingExams={existingExams}
      isVi={isVi}
      onBack={handleBack}
      examContext={examContext}
    />
  )
}
