// Quản lý và chấm điểm bài nộp kỹ năng Speaking và Writing của học viên.

import { useState, useMemo } from 'react'

import { DataTable } from '@/components/data.table'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'
import { LearnerSubmissionCard } from '@/features/courses/components/learner.submission.card'
import { LearnerSubmissionsFilterBar } from '@/features/courses/components/learner.submissions.filter.bar'
import { createLearnerSubmissionsColumns } from '@/features/courses/components/learner.submissions.columns'
import { toast } from '@/store/toast.store'

interface CourseSimple {
  id: string
  title: string
  thumbnail_url?: string
  author_id?: string
  students_count?: number
}

interface LearnerSubmissionsTabProps {
  submissions: SkillSubmissionItem[]
  isLoading: boolean
  courses: CourseSimple[]
  selectedCourseId: string
  onSelectCourseId: (courseId: string) => void
  onRefresh: () => void
  onOpenReview: (submission: SkillSubmissionItem) => void
  pendingReviewsCount: number
  isVi?: boolean
  isTeacher?: boolean
}

export function LearnerSubmissionsTab({
  submissions,
  isLoading,
  courses,
  selectedCourseId,
  onSelectCourseId,
  onRefresh,
  onOpenReview,
  pendingReviewsCount,
  isVi = true,
  isTeacher = false,
}: LearnerSubmissionsTabProps) {
  const [submissionSearch, setSubmissionSearch] = useState<string>('')
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'SPEAKING' | 'WRITING'>('ALL')
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('ALL')
  const [subViewMode, setSubViewMode] = useState<'table' | 'grid'>('table')
  const [subCurrentPage, setSubCurrentPage] = useState<number>(1)
  const [subPageSize, setSubPageSize] = useState<number>(10)
  const [subSortKey, setSubSortKey] = useState<string | null>(null)
  const [subSortOrder, setSubSortOrder] = useState<'asc' | 'desc' | null>(null)

  const courseOptions: SelectOption[] = useMemo(() => [
    {
      value: 'ALL',
      label: isTeacher
        ? (isVi ? `Tất cả khóa học của tôi` : `My Courses`)
        : (isVi ? `Tất cả khóa học` : `All Courses`),
      badge: courses.length > 0 ? String(courses.length) : undefined,
    },
    ...courses.map((c) => ({
      value: c.id,
      label: c.title,
      badge: typeof c.students_count === 'number' && c.students_count > 0 ? `${c.students_count} HV` : undefined,
    })),
  ], [courses, isTeacher, isVi])

  const filteredSubmissions = useMemo(() => {
    let list = submissions

    if (skillFilter !== 'ALL') {
      list = list.filter((sub) => sub.skill === skillFilter)
    }

    if (reviewStatusFilter === 'PENDING') {
      list = list.filter((sub) => !sub.is_teacher_reviewed && sub.status !== 'TEACHER_REVIEWED')
    } else if (reviewStatusFilter === 'REVIEWED') {
      list = list.filter((sub) => sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED')
    }

    if (submissionSearch.trim()) {
      const q = submissionSearch.toLowerCase()
      list = list.filter((sub) => {
        const name = (sub.user_name || '').toLowerCase()
        const email = (sub.user_email || '').toLowerCase()
        const transcript = (sub.whisper_transcript || '').toLowerCase()
        const essay = (sub.essay_text || '').toLowerCase()
        const course = (sub.course_title || '').toLowerCase()
        return (
          name.includes(q) ||
          email.includes(q) ||
          transcript.includes(q) ||
          essay.includes(q) ||
          course.includes(q)
        )
      })
    }

    if (!subSortKey || !subSortOrder) return list

    return [...list].sort((a, b) => {
      if (subSortKey === 'student') {
        const comp = (a.user_name || '').localeCompare(b.user_name || '')
        return subSortOrder === 'asc' ? comp : -comp
      }
      if (subSortKey === 'course') {
        const comp = (a.course_title || '').localeCompare(b.course_title || '')
        return subSortOrder === 'asc' ? comp : -comp
      }
      if (subSortKey === 'skill') {
        const comp = (a.skill || '').localeCompare(b.skill || '')
        return subSortOrder === 'asc' ? comp : -comp
      }
      if (subSortKey === 'ai_score') {
        const diff = (a.ai_score || 0) - (b.ai_score || 0)
        return subSortOrder === 'asc' ? diff : -diff
      }
      if (subSortKey === 'teacher_score') {
        const diff = (a.teacher_score || 0) - (b.teacher_score || 0)
        return subSortOrder === 'asc' ? diff : -diff
      }
      if (subSortKey === 'submitted_at') {
        const timeA = new Date(a.created_at || '').getTime()
        const timeB = new Date(b.created_at || '').getTime()
        return subSortOrder === 'asc' ? timeA - timeB : timeB - timeA
      }
      if (subSortKey === 'status') {
        const statA = a.is_teacher_reviewed ? 1 : 0
        const statB = b.is_teacher_reviewed ? 1 : 0
        return subSortOrder === 'asc' ? statA - statB : statB - statA
      }
      return 0
    })
  }, [submissions, skillFilter, reviewStatusFilter, submissionSearch, subSortKey, subSortOrder])

  const paginatedSubmissions = useMemo(() => {
    const start = (subCurrentPage - 1) * subPageSize
    return filteredSubmissions.slice(start, start + subPageSize)
  }, [filteredSubmissions, subCurrentPage, subPageSize])

  const handleResetFilters = async () => {
    setSubmissionSearch('')
    onSelectCourseId('ALL')
    setSkillFilter('ALL')
    setReviewStatusFilter('ALL')
    setSubSortKey(null)
    setSubSortOrder(null)
    setSubCurrentPage(1)
    await onRefresh()
    toast.success(isVi ? 'Đã đặt lại bộ lọc bài nộp' : 'Submission filters reset')
  }

  const submissionColumns = useMemo(
    () => createLearnerSubmissionsColumns({ isVi, onOpenReview }),
    [isVi, onOpenReview]
  )

  return (
    <DataTable<SkillSubmissionItem>
      title={
        <div className="flex items-center gap-2.5 flex-wrap">
          <span>{isVi ? 'Phúc Khảo & Chấm Bài Nộp Kỹ Năng' : 'Speaking & Writing Review'}</span>
          {pendingReviewsCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
              {pendingReviewsCount} {isVi ? 'bài chờ duyệt' : 'pending'}
            </span>
          )}
        </div>
      }
      subtitle={
        isVi
          ? 'Nghe bản ghi âm Speaking (kèm Whisper transcript) hoặc bài luận Writing, chuẩn hóa điểm số và gửi nhận xét cho học viên'
          : 'Listen to student audio (with Whisper transcript) or read essays, calibrate scores, and give feedback'
      }
      isLoading={isLoading}
      columns={submissionColumns}
      data={paginatedSubmissions}
      rowKey={(sub) => sub._id}
      viewMode={subViewMode}
      onViewModeChange={setSubViewMode}
      renderGridItem={(sub) => (
        <LearnerSubmissionCard
          key={sub._id}
          sub={sub}
          onOpenReview={onOpenReview}
          isVi={isVi}
        />
      )}
      sortKey={subSortKey}
      sortOrder={subSortOrder}
      onSortChange={(k, o) => {
        setSubSortKey(k)
        setSubSortOrder(o)
        setSubCurrentPage(1)
      }}
      onResetFilters={handleResetFilters}
      extraActions={
        <div className="w-64 sm:w-72">
          <CustomSelect
            value={selectedCourseId}
            onChange={(val) => {
              onSelectCourseId(val)
              setSubCurrentPage(1)
            }}
            options={courseOptions}
            disabled={isLoading || courses.length === 0}
            placeholder={isVi ? 'Chọn khóa học...' : 'Select course...'}
            showSearch={courses.length > 5}
          />
        </div>
      }
      filterSlot={
        <LearnerSubmissionsFilterBar
          submissionSearch={submissionSearch}
          onSearchChange={(val) => {
            setSubmissionSearch(val)
            setSubCurrentPage(1)
          }}
          skillFilter={skillFilter}
          onSkillFilterChange={(val) => {
            setSkillFilter(val)
            setSubCurrentPage(1)
          }}
          reviewStatusFilter={reviewStatusFilter}
          onReviewStatusFilterChange={(val) => {
            setReviewStatusFilter(val)
            setSubCurrentPage(1)
          }}
          isVi={isVi}
        />
      }
      pagination={{
        currentPage: subCurrentPage,
        pageSize: subPageSize,
        totalItems: filteredSubmissions.length,
        onPageChange: setSubCurrentPage,
        onPageSizeChange: (limit) => {
          setSubPageSize(limit)
          setSubCurrentPage(1)
        },
      }}
    />
  )
}
