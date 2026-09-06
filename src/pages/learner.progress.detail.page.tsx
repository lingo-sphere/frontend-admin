/**
 * @file learner.progress.detail.page.tsx
 * @description Trang quản trị hiển thị toàn màn hình chi tiết tiến độ các chương học và bài nộp kỹ năng của một học viên cụ thể
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  BarChart3,
  ArrowLeft,
  RefreshCw,
  FileCheck2,
  CheckCircle2,
  Award,
  BookOpen,
  Volume2,
  FileText,
  Edit3,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { progressService, type StudentProgressItem, type SkillSubmissionItem } from '@/services/progress.service'
import { courseService } from '@/services/course.service'
import { userService } from '@/services/user.service'
import { resolveMediaUrl } from '@/utils/media.utils'
import { CourseSubmissionReviewDialog } from '@/components/courses/course.submission.review.dialog'
import { toast } from '@/store/toast.store'
import type { Course as ApiCourse, UserProfile } from '@/types/api.types'

interface LearnerProgressDetailPageProps {
  courseId: string
  userId: string
}

export function LearnerProgressDetailPage({ courseId, userId }: LearnerProgressDetailPageProps) {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [student, setStudent] = useState<StudentProgressItem | null>(() => {
    const cachedStr = sessionStorage.getItem('lingo_admin_active_student_progress')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as StudentProgressItem
        if (cached && cached.user_id === userId) {
          return cached
        }
      } catch {}
    }
    return null
  })

  const studentRef = useRef(student)
  studentRef.current = student

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [courseInfo, setCourseInfo] = useState<ApiCourse | null>(null)
  const [submissions, setSubmissions] = useState<SkillSubmissionItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cachedStr = sessionStorage.getItem('lingo_admin_active_student_progress')
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr) as StudentProgressItem
        if (cached && cached.user_id === userId) {
          return false
        }
      } catch {}
    }
    return true
  })

  const [selectedSubmission, setSelectedSubmission] = useState<SkillSubmissionItem | null>(null)
  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  const loadData = useCallback(async () => {
    if (!courseId || !userId) return
    const hasInitialData = !!studentRef.current
    if (!hasInitialData) {
      setIsLoading(true)
    }

    try {
      const isAllCourse = courseId === 'all'
      const [detailRes, submissionsRes, courseRes, userProfileRes] = await Promise.all([
        !isAllCourse
          ? progressService.getStudentCourseProgressDetail(courseId, userId).catch(() => null)
          : null,
        !isAllCourse
          ? progressService.getCourseSubmissions(courseId, undefined, userId).catch(() => [])
          : [],
        !isAllCourse
          ? courseService.getCourseById(courseId).catch(() => null)
          : null,
        userService.getProfileById(userId).catch(() => null),
      ])

      if (detailRes?.course_progress) {
        const cp = detailRes.course_progress
        const currentStudent = studentRef.current
        const mergedStudent: StudentProgressItem = {
          user_id: userId,
          full_name: userProfileRes?.full_name || currentStudent?.full_name,
          email: userProfileRes?.email || currentStudent?.email,
          avatar_url: userProfileRes?.avatar_url || currentStudent?.avatar_url,
          course_id: courseId,
          course_title: courseRes?.title || currentStudent?.course_title,
          progress_percentage: cp.progress_percentage ?? currentStudent?.progress_percentage ?? 0,
          completed_lessons: cp.completed_lessons_count ?? currentStudent?.completed_lessons ?? 0,
          total_lessons: cp.total_lessons_count ?? currentStudent?.total_lessons ?? 1,
          baseline_score: cp.baseline_score ?? currentStudent?.baseline_score,
          baseline_source: cp.baseline_source ?? currentStudent?.baseline_source,
          final_test_score: cp.final_test_score ?? currentStudent?.final_test_score,
          total_score_growth: cp.total_score_growth ?? currentStudent?.total_score_growth,
          modules_progress: detailRes.modules_progress || currentStudent?.modules_progress || [],
          status: cp.status ?? currentStudent?.status,
        }
        setStudent(mergedStudent)
        sessionStorage.setItem('lingo_admin_active_student_progress', JSON.stringify(mergedStudent))
      } else if (isAllCourse && !studentRef.current) {
        const allProg = await progressService.getCourseStudentsProgress('all').catch(() => null)
        if (allProg?.students) {
          const found = allProg.students.find((s) => s.user_id === userId)
          if (found) {
            setStudent(found)
            sessionStorage.setItem('lingo_admin_active_student_progress', JSON.stringify(found))
          }
        }
      }

      if (Array.isArray(submissionsRes)) {
        setSubmissions(submissionsRes)
      }

      if (courseRes) {
        setCourseInfo(courseRes)
      }

      if (userProfileRes) {
        setUserProfile(userProfileRes)
      }
    } catch {
      toast.error('Không thể tải chi tiết tiến độ học viên.')
    } finally {
      setIsLoading(false)
    }
  }, [courseId, userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenReview = (sub: SkillSubmissionItem) => {
    setSelectedSubmission(sub)
    setEditScore(sub.teacher_score !== undefined ? sub.teacher_score : sub.ai_score)
    setEditFeedback(sub.teacher_feedback || '')
  }

  const handleSaveReview = async (overrideScore?: number) => {
    if (!selectedSubmission) return
    const scoreToSave = overrideScore !== undefined ? overrideScore : editScore

    setIsSubmittingReview(true)
    try {
      await progressService.reviewSubmission(selectedSubmission._id, {
        teacher_score: scoreToSave,
        teacher_feedback: editFeedback || 'Giáo viên đã xác nhận và chuẩn hóa điểm số.',
      })
      toast.success(`Đã cập nhật điểm thành công: ${scoreToSave}/100!`)
      setSelectedSubmission(null)
      loadData()
    } catch {
      toast.error('Lỗi khi lưu điểm đánh giá của giáo viên.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const displayName = userProfile?.full_name || student?.full_name || `Học viên #${userId.slice(-6)}`
  const displayEmail = userProfile?.email || student?.email || 'Chưa cập nhật email'
  const avatarUrl = userProfile?.avatar_url || student?.avatar_url
  const courseTitle = courseInfo?.title || student?.course_title || 'Khóa học'

  const progressPct = Math.min(100, Math.max(0, student?.progress_percentage || 0))
  const completedLessons = student?.completed_lessons || 0
  const totalLessons = student?.total_lessons || 1
  const baselineScore = student?.baseline_score
  const finalTestScore = student?.final_test_score
  const growth = student?.total_score_growth ?? ((finalTestScore || 0) - (baselineScore || 0))
  const modules = student?.modules_progress || []

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveNavItem('course-learners')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại học viên</span>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </h2>
                <span className="text-xs text-slate-400">({displayEmail})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tiến độ khóa học</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">{progressPct}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {completedLessons} / {totalLessons} bài học
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Đầu vào (Pre-test)</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {baselineScore !== undefined ? `${baselineScore}đ` : 'Chưa test'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Thang điểm TOEIC</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Kết khóa (Final Test)</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100">
              {finalTestScore !== undefined ? `${finalTestScore}đ` : 'Chưa thi'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bài thi tốt nghiệp</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tăng trưởng điểm số</div>
            <div className={`text-lg font-black ${growth > 0 ? 'text-emerald-600' : growth < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
              {growth > 0 ? `+${growth}` : growth} điểm
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">So với điểm xuất phát</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Cột mốc kiểm tra từng chương (Post-mini Tests & Challenges)</span>
          </h3>
          <span className="text-xs text-slate-400">{modules.length} chương</span>
        </div>

        {modules.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            Học viên chưa thực hiện bài kiểm tra chương nào trong khóa học này.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {modules.map((m, idx) => {
              const modOrder = m.order_index || idx + 1
              const challengeScore = typeof m.challenge_score === 'number' ? m.challenge_score : -1
              const postMiniScore = typeof m.post_mini_score === 'number' ? m.post_mini_score : -1
              const hasChallenge = m.challenge_taken || m.is_passed_by_challenge || challengeScore > 0
              const hasPostMini = postMiniScore > 0 || (typeof m.post_mini_score === 'number' && m.post_mini_score >= 0 && !hasChallenge)
              const isPassed = m.status === 'COMPLETED' || m.is_passed_by_challenge || (challengeScore >= 70) || (postMiniScore >= 70)

              return (
                <div
                  key={m.module_id || idx}
                  className="p-3.5 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 shrink-0">
                      {modOrder}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {m.title || `Chương ${modOrder}`}
                      </div>
                      <div className="text-[11px] text-slate-400">Mã chương: {m.module_id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-3 text-xs">
                      {hasChallenge ? (
                        <span className="text-slate-600 dark:text-slate-300">
                          Thử thách:{' '}
                          <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {challengeScore >= 0 ? `${challengeScore}đ` : '-'}
                          </strong>
                        </span>
                      ) : null}
                      {hasPostMini ? (
                        <span className="text-slate-600 dark:text-slate-300">
                          Post-mini:{' '}
                          <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {postMiniScore >= 0 ? `${postMiniScore}đ` : '-'}
                          </strong>
                        </span>
                      ) : null}
                      {!hasChallenge && !hasPostMini ? (
                        <span className="text-slate-400 italic">Chưa làm test</span>
                      ) : null}
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isPassed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isPassed ? 'Đã vượt qua' : m.status === 'LOCKED' ? 'Đang khóa' : 'Đang học'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
            <span>Bài nộp kỹ năng Nói & Viết ({submissions.length})</span>
          </h3>
        </div>

        {submissions.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            Học viên chưa có bài nộp bài tập nói Speaking hoặc viết Writing nào trong khóa học này.
          </p>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => {
              const isSpeaking = sub.skill === 'SPEAKING'
              const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'

              return (
                <div
                  key={sub._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isSpeaking
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'Speaking' : 'Writing'}</span>
                      </span>

                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Điểm AI: <span className="text-purple-600 dark:text-purple-400">{sub.ai_score}đ</span>
                        {sub.teacher_score !== undefined && (
                          <span className="text-emerald-600 dark:text-emerald-400 ml-1.5">
                            • Giáo viên: {sub.teacher_score}đ
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenReview(sub)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isReviewed ? 'Sửa điểm' : 'Chấm điểm'}</span>
                    </button>
                  </div>

                  {isSpeaking && sub.audio_url && (
                    <audio
                      controls
                      className="w-full h-8"
                      src={resolveMediaUrl(sub.audio_url)}
                      preload="metadata"
                    />
                  )}

                  {isSpeaking && sub.whisper_transcript && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Gỡ băng giọng nói (Whisper STT):</span>
                      &ldquo;{sub.whisper_transcript}&rdquo;
                    </div>
                  )}

                  {!isSpeaking && sub.essay_text && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Bài viết luận:</span>
                      {sub.essay_text}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <CourseSubmissionReviewDialog
          submission={selectedSubmission}
          editScore={editScore}
          editFeedback={editFeedback}
          isSubmitting={isSubmittingReview}
          onScoreChange={setEditScore}
          onFeedbackChange={setEditFeedback}
          onClose={() => setSelectedSubmission(null)}
          onSaveReview={handleSaveReview}
        />
      )}
    </div>
  )
}
