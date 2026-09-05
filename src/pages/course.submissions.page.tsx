/**
 * @file course.submissions.page.tsx
 * @description Trang quản trị hiển thị danh sách bài nộp kỹ năng Speaking và Writing của học viên trong khóa học để giáo viên phúc khảo và chấm điểm
 */

import { useState, useEffect, useCallback } from 'react'
import {
  FileCheck2,
  ArrowLeft,
  RefreshCw,
  GraduationCap,
  Headphones,
  FileText,
  Volume2,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { courseService } from '@/services/course.service'
import { progressService, type SkillSubmissionItem } from '@/services/progress.service'
import { CourseSubmissionItemCard } from '@/components/courses/course.submission.item.card'
import { CourseSubmissionReviewDialog } from '@/components/courses/course.submission.review.dialog'
import { toast } from '@/store/toast.store'
import type { Course as ApiCourse } from '@/types/api.types'

interface CourseSubmissionsPageProps {
  courseId: string
}

export function CourseSubmissionsPage({ courseId }: CourseSubmissionsPageProps) {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [courseInfo, setCourseInfo] = useState<ApiCourse | null>(null)
  const [submissions, setSubmissions] = useState<SkillSubmissionItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filterSkill, setFilterSkill] = useState<'ALL' | 'SPEAKING' | 'WRITING'>('ALL')
  const [selectedSubmission, setSelectedSubmission] = useState<SkillSubmissionItem | null>(null)

  const [editScore, setEditScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return
    try {
      const res = await courseService.getCourseById(courseId)
      if (res) setCourseInfo(res)
    } catch {
      setCourseInfo(null)
    }
  }, [courseId])

  const fetchSubmissions = useCallback(async () => {
    if (!courseId) return
    setIsLoading(true)
    try {
      const data = await progressService.getCourseSubmissions(courseId)
      setSubmissions(data || [])
    } catch {
      toast.error('Không thể tải danh sách bài nộp của học viên.')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchCourseData()
    fetchSubmissions()
  }, [fetchCourseData, fetchSubmissions])

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
      fetchSubmissions()
    } catch {
      toast.error('Lỗi khi lưu điểm đánh giá của giáo viên.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const filteredList = submissions.filter((sub) => {
    if (filterSkill === 'ALL') return true
    return sub.skill === filterSkill
  })

  const speakingCount = submissions.filter((s) => s.skill === 'SPEAKING').length
  const writingCount = submissions.filter((s) => s.skill === 'WRITING').length
  const pendingCount = submissions.filter((s) => s.status !== 'TEACHER_REVIEWED').length

  const courseTitle = courseInfo?.title || 'Khóa học'

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveNavItem('courses')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại khóa học</span>
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                  Phúc Khảo & Chấm Bài Nộp Kỹ Năng
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                    {pendingCount} bài chờ chấm
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Khóa học: <span className="font-semibold text-slate-700 dark:text-slate-300">{courseTitle}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveNavItem(`course-scores:${courseId}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer shadow-2xs"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Bảng điểm & Tiến độ</span>
          </button>

          <button
            type="button"
            onClick={fetchSubmissions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Làm mới bài nộp"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setFilterSkill('ALL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterSkill === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Tất cả ({submissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterSkill('SPEAKING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterSkill === 'SPEAKING'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Bài nói Speaking ({speakingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterSkill('WRITING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterSkill === 'WRITING'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Bài viết Writing ({writingCount})</span>
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            <p>Đang tải danh sách bài nộp kỹ năng...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Headphones className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Chưa có bài nộp nào của học viên</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Khi học viên hoàn thành bài tập nói Speaking hoặc viết Writing trong khóa học, bài nộp sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          filteredList.map((sub) => (
            <CourseSubmissionItemCard
              key={sub._id}
              submission={sub}
              onOpenReview={handleOpenReview}
            />
          ))
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
