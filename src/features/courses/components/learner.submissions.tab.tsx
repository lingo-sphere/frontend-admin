// Quản lý và chấm điểm bài nộp kỹ năng Speaking và Writing của học viên.

import { useState, useMemo } from 'react'
import {
  RotateCcw,
  BookOpen,
  Sparkles,
  Volume2,
  FileText,
  Edit3,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/data.table'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import type { SkillSubmissionItem } from '@/features/progress/services/progress.service'
import { resolveMediaUrl } from '@/features/media/utils/media.utils'
import { LearnerSubmissionCard } from '@/features/courses/components/learner.submission.card'
import { LearnerSubmissionsFilterBar } from '@/features/courses/components/learner.submissions.filter.bar'

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
      if (subSortKey === 'ai_score') {
        const diff = (a.ai_score || 0) - (b.ai_score || 0)
        return subSortOrder === 'asc' ? diff : -diff
      }
      if (subSortKey === 'teacher_score') {
        const diff = (a.teacher_score || 0) - (b.teacher_score || 0)
        return subSortOrder === 'asc' ? diff : -diff
      }
      return 0
    })
  }, [submissions, skillFilter, reviewStatusFilter, submissionSearch, subSortKey, subSortOrder])

  const paginatedSubmissions = useMemo(() => {
    const start = (subCurrentPage - 1) * subPageSize
    return filteredSubmissions.slice(start, start + subPageSize)
  }, [filteredSubmissions, subCurrentPage, subPageSize])

  const handleResetFilters = () => {
    setSubmissionSearch('')
    onSelectCourseId('ALL')
    setSkillFilter('ALL')
    setReviewStatusFilter('ALL')
    setSubSortKey(null)
    setSubSortOrder(null)
    setSubCurrentPage(1)
  }

  const submissionColumns: DataTableColumn<SkillSubmissionItem>[] = useMemo(
    () => [
      {
        key: 'student',
        title: isVi ? 'Học Viên' : 'Student',
        sortable: true,
        render: (sub) => (
          <div className="space-y-0.5 min-w-[150px]">
            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
              {sub.user_name || 'Học viên'}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
              {sub.user_email || 'Email chưa cập nhật'}
            </div>
            <div className="text-[10px] text-slate-400">
              {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : 'Mới nộp'}
            </div>
          </div>
        ),
      },
      {
        key: 'course',
        title: isVi ? 'Khóa Học' : 'Course',
        sortable: true,
        render: (sub) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-[160px]">{sub.course_title || 'Khóa học'}</span>
          </span>
        ),
      },
      {
        key: 'skill_content',
        title: isVi ? 'Kỹ Năng & Bài Làm' : 'Skill & Submission Content',
        render: (sub) => (
          <div className="space-y-1.5 max-w-md">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                sub.skill === 'SPEAKING'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
              }`}
            >
              {sub.skill === 'SPEAKING' ? <Volume2 className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              <span>{sub.skill === 'SPEAKING' ? 'Speaking' : 'Writing'}</span>
            </span>

            {sub.skill === 'SPEAKING' && sub.audio_url && (
              <audio
                controls
                className="w-full h-7 mt-1"
                src={resolveMediaUrl(sub.audio_url)}
                preload="metadata"
              />
            )}

            {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
              <p className="text-slate-600 dark:text-slate-400 italic text-xs line-clamp-2">
                &ldquo;{sub.whisper_transcript}&rdquo;
              </p>
            )}

            {sub.skill === 'WRITING' && sub.essay_text && (
              <p className="text-slate-700 dark:text-slate-300 text-xs line-clamp-2 font-mono">
                {sub.essay_text}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'ai_score',
        title: isVi ? 'Điểm AI' : 'AI Score',
        align: 'center',
        sortable: true,
        render: (sub) => (
          <div className="space-y-0.5 text-center whitespace-nowrap">
            <span className="inline-flex items-center gap-1 font-black text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3" />
              {sub.ai_score}/100
            </span>
          </div>
        ),
      },
      {
        key: 'teacher_score',
        title: isVi ? 'Điểm Giáo Viên' : 'Teacher Score',
        align: 'center',
        sortable: true,
        render: (sub) =>
          sub.teacher_score !== undefined ? (
            <span className="inline-block font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
              {sub.teacher_score}/100
            </span>
          ) : (
            <span className="text-slate-400 text-xs italic whitespace-nowrap">
              {isVi ? 'Chưa duyệt' : 'Pending'}
            </span>
          ),
      },
      {
        key: 'review_status',
        title: isVi ? 'Trạng Thái' : 'Status',
        align: 'center',
        render: (sub) => {
          const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
          return (
            <span
              className={`inline-flex items-center gap-1 justify-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                isReviewed
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {isReviewed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>{isVi ? 'Đã duyệt' : 'Reviewed'}</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{isVi ? 'Chờ chấm' : 'Pending'}</span>
                </>
              )}
            </span>
          )
        },
      },
      {
        key: 'actions',
        title: isVi ? 'Thao Tác' : 'Action',
        align: 'right',
        render: (sub) => {
          const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
          return (
            <button
              type="button"
              onClick={() => onOpenReview(sub)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap ml-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isReviewed ? (isVi ? 'Sửa điểm' : 'Edit') : (isVi ? 'Chấm bài' : 'Grade')}</span>
            </button>
          )
        },
      },
    ],
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
        <>
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

          <button
            type="button"
            onClick={onRefresh}
            title="Làm mới dữ liệu"
            className="flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </>
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
