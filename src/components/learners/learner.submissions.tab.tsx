/**
 * @file learner.submissions.tab.tsx
 * @description Tab quản lý bài nộp kỹ năng Nói & Viết của học viên dạng Bảng (Table) và Dạng Thẻ (Grid)
 */

import { useState, useMemo } from 'react'
import {
  FileCheck2,
  Search,
  RotateCcw,
  BookOpen,
  Sparkles,
  Volume2,
  FileText,
  Bot,
  Edit3,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/common/data.table'
import type { SkillSubmissionItem } from '@/services/progress.service'
import { resolveMediaUrl } from '@/utils/media.utils'

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
            <span className="text-slate-400 text-xs italic whitespace-nowrap">Chưa duyệt</span>
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
              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                isReviewed
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {isReviewed ? '✅ Đã duyệt' : '⏳ Chờ chấm'}
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
              <span>{isReviewed ? 'Sửa điểm' : 'Chấm bài'}</span>
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
      renderGridItem={(sub) => {
        const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
        return (
          <div
            key={sub._id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      sub.skill === 'SPEAKING'
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    {sub.skill === 'SPEAKING' ? <Volume2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {sub.user_name || 'Học viên'}
                    </h4>
                    <p className="text-xs text-slate-400">{sub.user_email || 'Email chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isReviewed
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200'
                    }`}
                  >
                    {isReviewed ? '✅ Đã duyệt' : '⏳ Chờ chấm'}
                  </span>
                </div>
              </div>

              {sub.course_title && (
                <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="truncate">{sub.course_title}</span>
                </div>
              )}

              {sub.skill === 'SPEAKING' && sub.audio_url && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>🎧 Bản ghi âm học viên:</span>
                    <a
                      href={resolveMediaUrl(sub.audio_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Tải về <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <audio
                    controls
                    className="w-full h-8"
                    src={resolveMediaUrl(sub.audio_url)}
                    preload="metadata"
                  />
                </div>
              )}

              {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-500" /> Bóc tách Whisper AI:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 italic font-mono text-xs leading-relaxed">
                    &ldquo;{sub.whisper_transcript}&rdquo;
                  </p>
                </div>
              )}

              {sub.skill === 'WRITING' && sub.essay_text && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                    Bài viết luận của học viên:
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-3">
                    {sub.essay_text}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Điểm AI:
                    </span>
                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                      {sub.ai_score}/100
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Giáo Viên:
                    </span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      {sub.teacher_score !== undefined ? `${sub.teacher_score}/100` : 'Chưa duyệt'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                {sub.created_at ? new Date(sub.created_at).toLocaleDateString('vi-VN') : 'Mới nộp'}
              </span>
              <button
                type="button"
                onClick={() => onOpenReview(sub)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isReviewed ? 'Sửa điểm' : 'Chấm bài'}</span>
              </button>
            </div>
          </div>
        )
      }}
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
          <div className="flex items-center gap-2 min-w-[220px]">
            <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCourseId}
              onChange={(e) => {
                onSelectCourseId(e.target.value)
                setSubCurrentPage(1)
              }}
              disabled={isLoading || courses.length === 0}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">
                {isTeacher
                  ? `Tất cả khóa học của tôi (${courses.length})`
                  : `Tất cả khóa học (${courses.length})`}
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={submissionSearch}
              onChange={(e) => {
                setSubmissionSearch(e.target.value)
                setSubCurrentPage(1)
              }}
              placeholder={isVi ? 'Tìm theo tên học viên, bài viết, khóa học, từ khóa...' : 'Search student, transcript, course...'}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(['ALL', 'SPEAKING', 'WRITING'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSkillFilter(s)
                  setSubCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  skillFilter === s
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {s === 'ALL' ? 'Tất cả kỹ năng' : s === 'SPEAKING' ? '🎙️ Speaking' : '✍️ Writing'}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {(['ALL', 'PENDING', 'REVIEWED'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setReviewStatusFilter(r)
                  setSubCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  reviewStatusFilter === r
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {r === 'ALL' ? 'Tất cả trạng thái' : r === 'PENDING' ? '⏳ Chờ chấm' : '✅ Đã duyệt'}
              </button>
            ))}
          </div>
        </div>
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
