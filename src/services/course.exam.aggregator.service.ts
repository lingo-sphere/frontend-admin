// Dịch vụ tổng hợp dữ liệu bài kiểm tra khóa học, thống kê lượt thi và điểm trung bình cho quản trị viên và giảng viên.

import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { courseService } from '@/services/course.service'
import { progressService, type StudentProgressItem } from '@/services/progress.service'
import type { CourseSelectItem } from '@/components/course-exams/course.exam.header.actions'
import type { Course } from '@/types/api.types'

interface FetchAggregatedParams {
  isTeacher: boolean
  currentUserId: string
}

interface AggregatedCourseExamsResult {
  allowedCourses: CourseSelectItem[]
  exams: ToeicExamItem[]
}

class CourseExamAggregatorService {
  async fetchAggregatedCourseExams({
    isTeacher,
    currentUserId,
  }: FetchAggregatedParams): Promise<AggregatedCourseExamsResult> {
    let allowedCourses: CourseSelectItem[] = []
    let rawCourses: Course[] = []

    if (isTeacher) {
      try {
        const teacherRes = await courseService.getTeacherCourses()
        if (Array.isArray(teacherRes) && teacherRes.length > 0) {
          rawCourses = teacherRes
          allowedCourses = teacherRes.map((c) => ({
            id: c._id || '',
            title: c.title || '',
            author_id: c.author_id || currentUserId,
            students_count: c.students_count || 0,
          }))
        }
      } catch {
        allowedCourses = []
      }

      if (allowedCourses.length === 0) {
        const allRes = await courseService.getAllCourses({ pageSize: 100 })
        rawCourses = allRes.result || []
        const myCourses = rawCourses.filter((c) => c.author_id === currentUserId)
        const targetList = myCourses.length > 0 ? myCourses : rawCourses
        allowedCourses = targetList.map((c) => ({
          id: c._id || '',
          title: c.title || '',
          author_id: c.author_id || '',
          students_count: c.students_count || 0,
        }))
      }
    } else {
      const allRes = await courseService.getAllCourses({ pageSize: 100 })
      rawCourses = allRes.result || []
      allowedCourses = rawCourses.map((c) => ({
        id: c._id || '',
        title: c.title || '',
        author_id: c.author_id || '',
        students_count: c.students_count || 0,
      }))
    }

    const apiExams = await examAdminService.getExams().catch(() => [])
    const courseExamsList: ToeicExamItem[] = []

    await Promise.all(
      allowedCourses.map(async (c) => {
        const rawCourse = rawCourses.find((rc) => rc._id === c.id) || (c as unknown as Course)

        let studentsProgressList: StudentProgressItem[] = []
        try {
          const prog = await progressService.getCourseStudentsProgress(c.id)
          if (prog && Array.isArray(prog.students)) {
            studentsProgressList = prog.students
          }
        } catch {}

        if (
          rawCourse.final_test_questions &&
          Array.isArray(rawCourse.final_test_questions) &&
          rawCourse.final_test_questions.length > 0
        ) {
          const finalCompleted = studentsProgressList.filter(
            (s) => typeof s.final_test_score === 'number' && s.final_test_score >= 0
          )
          const finalAttempts = finalCompleted.length
          const finalAvg =
            finalAttempts > 0
              ? Math.round(
                  finalCompleted.reduce((acc, s) => acc + (s.final_test_score || 0), 0) /
                    finalAttempts
                )
              : 0

          courseExamsList.push({
            id: rawCourse.final_test_exam_id || `course_final_${c.id}`,
            _id: rawCourse.final_test_exam_id || `course_final_${c.id}`,
            title: `Bài Thi Tốt Nghiệp: ${c.title}`,
            course_id: c.id,
            course_title: c.title,
            type: 'FULL_TEST',
            total_questions: rawCourse.final_test_questions.length,
            duration_minutes: rawCourse.final_test_duration_minutes || 60,
            passing_score: rawCourse.final_test_passing_score || 70,
            is_published: rawCourse.is_published ?? true,
            total_attempts: finalAttempts,
            avg_score: finalAvg,
            questions: rawCourse.final_test_questions,
            audio_url: rawCourse.final_test_audio_url || '',
            author_id: c.author_id,
          })
        }

        try {
          const modulesList = await courseService.getModules(c.id)
          for (const mod of modulesList) {
            const qList =
              mod.challenge_questions && Array.isArray(mod.challenge_questions) && mod.challenge_questions.length > 0
                ? mod.challenge_questions
                : mod.post_mini_questions && Array.isArray(mod.post_mini_questions) && mod.post_mini_questions.length > 0
                ? mod.post_mini_questions
                : []

            if (qList.length > 0) {
              const targetModId = mod._id || mod.id
              const modAttemptsList = studentsProgressList
                .map((s) =>
                  (s.modules_progress || []).find(
                    (m) =>
                      m.module_id === targetModId ||
                      (typeof m.order_index === 'number' && m.order_index === mod.order_index)
                  )
                )
                .filter(
                  (m) =>
                    Boolean(m && (m.challenge_taken || (typeof m.challenge_score === 'number' && m.challenge_score >= 0)))
                )

              const challengeAttempts = modAttemptsList.length
              const challengeAvg =
                challengeAttempts > 0
                  ? Math.round(
                      modAttemptsList.reduce(
                        (acc, m) => acc + (typeof m?.challenge_score === 'number' ? m.challenge_score : 0),
                        0
                      ) / challengeAttempts
                    )
                  : 0

              courseExamsList.push({
                id: mod.challenge_test_exam_id || mod.post_mini_test_exam_id || `mod_challenge_${targetModId}`,
                _id: mod.challenge_test_exam_id || mod.post_mini_test_exam_id || `mod_challenge_${targetModId}`,
                title: `Challenge Test: ${mod.title}`,
                course_id: c.id,
                course_title: c.title,
                module_id: targetModId,
                module_title: mod.title,
                type: 'CHALLENGE_TEST',
                total_questions: qList.length,
                duration_minutes: mod.challenge_duration_minutes || mod.post_mini_duration_minutes || 15,
                passing_score: mod.challenge_passing_score || mod.post_mini_passing_score || 80,
                is_published: true,
                total_attempts: challengeAttempts,
                avg_score: challengeAvg,
                questions: qList,
                audio_url: mod.challenge_audio_url || mod.test_audio_url || mod.audio_url || '',
                author_id: c.author_id,
              })
            }
          }
        } catch {}
      })
    )

    const seenIds = new Set<string>()
    const combined: ToeicExamItem[] = []

    apiExams.forEach((e) => {
      const eid = e._id || e.id || ''
      if (eid && !seenIds.has(eid)) {
        seenIds.add(eid)
        const rawExam = e as Record<string, unknown>
        const resolvedType =
          (rawExam.exam_type as string) ||
          e.type ||
          (e.is_system_placement ? 'DIAGNOSTIC_TEST' : 'FULL_TEST')

        let courseTitle = 'Toàn Hệ Thống'
        if (!e.is_system_placement && resolvedType !== 'DIAGNOSTIC_TEST' && e.course_id) {
          const matched = allowedCourses.find(
            (c) => c.id === e.course_id || (c as unknown as { _id?: string })._id === e.course_id
          )
          courseTitle = matched?.title || e.course_title || 'Khóa học'
        } else if (e.course_title) {
          courseTitle = e.course_title
        }

        const qCount =
          Array.isArray(e.questions) && e.questions.length > 0
            ? e.questions.length
            : (e.total_questions || (resolvedType === 'FULL_TEST' ? 200 : 30))

        const duration =
          e.duration_minutes ||
          (typeof rawExam.listening_duration_minutes === 'number' &&
          typeof rawExam.reading_duration_minutes === 'number'
            ? rawExam.listening_duration_minutes + rawExam.reading_duration_minutes
            : resolvedType === 'FULL_TEST'
            ? 120
            : 45)

        combined.push({
          ...e,
          id: eid,
          _id: eid,
          type: resolvedType,
          course_title: courseTitle,
          total_questions: qCount,
          duration_minutes: duration,
          total_attempts: typeof e.total_attempts === 'number' ? e.total_attempts : 0,
          avg_score: typeof e.avg_score === 'number' ? e.avg_score : 0,
        })
      }
    })

    courseExamsList.forEach((e) => {
      const eid = e._id || e.id || ''
      if (eid && !seenIds.has(eid)) {
        seenIds.add(eid)
        combined.push(e)
      }
    })

    return {
      allowedCourses,
      exams: combined,
    }
  }
}

export const courseExamAggregatorService = new CourseExamAggregatorService()
