// Component hiển thị và chỉnh sửa bài học video phân cấp theo chương học.

import { useState } from 'react'
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Video,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  HelpCircle,
  UploadCloud,
} from 'lucide-react'
import { R2MediaUploader } from '@/features/media/components/r2.media.uploader'
import type { CourseLesson } from '@/features/courses/components/course.basic.info.tab'

interface ChapterLessonCardProps {
  lesson: CourseLesson
  lessonIndex: number
  chapterIndex: number
  chapterFolder: string
  isVi: boolean
  isFirst?: boolean
  isLast?: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  onUpdateField: (field: keyof CourseLesson, value: string | number | boolean) => void
  onUpdateFields: (fields: Partial<CourseLesson>) => void
  onOpenQuizStudio?: (lesson: CourseLesson) => void
  onRemove: () => void
  formatDurationDisplay: (seconds?: number, minutes?: number) => string
}

export function ChapterLessonCard({
  lesson,
  lessonIndex,
  chapterIndex,
  chapterFolder,
  isVi,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onUpdateField,
  onUpdateFields,
  onOpenQuizStudio,
  onRemove,
  formatDurationDisplay,
}: ChapterLessonCardProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(!lesson.video_url)

  const hasVideo = Boolean(lesson.video_url && lesson.video_url.trim().length > 0)
  const durationLabel = formatDurationDisplay(lesson.duration_seconds, lesson.duration_minutes)

  return (
    <div className="relative rounded-xl border border-slate-200/90 bg-white transition-all shadow-xs hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/90 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-extrabold text-[11px] border border-indigo-200 dark:border-indigo-800 tracking-tight">
              {isVi ? 'Bài' : 'Lesson'} {chapterIndex + 1}.{lessonIndex + 1}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={lesson.title}
              onChange={(e) => onUpdateField('title', e.target.value)}
              placeholder={isVi ? 'Nhập tên bài học video...' : 'Enter lesson title...'}
              className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasVideo ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{durationLabel !== '0s' ? durationLabel : isVi ? 'Đã có video' : 'Video ready'}</span>
            </span>
          ) : lesson.pending_video_name ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-800/60 shrink-0"
              title={lesson.pending_video_name}
            >
              <UploadCloud className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="max-w-[170px] truncate">
                {isVi
                  ? `Chờ tải R2 (${durationLabel !== '0s' ? durationLabel : lesson.pending_video_name})`
                  : `Pending R2 (${durationLabel})`}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-800/60 shrink-0">
              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{isVi ? 'Chưa gắn video' : 'No video'}</span>
            </span>
          )}

          {onOpenQuizStudio && (
            <button
              type="button"
              onClick={() => onOpenQuizStudio(lesson)}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/50 text-[11px] font-semibold border border-amber-200 dark:border-amber-800/60 shrink-0 transition-colors cursor-pointer"
              title={isVi ? 'Quản lý câu hỏi ôn tập / Import ZIP cho bài học này' : 'Manage practice questions for this lesson'}
            >
              <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>
                {lesson.questions && lesson.questions.length > 0
                  ? `${lesson.questions.length} ${isVi ? 'câu hỏi' : 'questions'}`
                  : isVi
                  ? '+ Câu hỏi ôn tập'
                  : '+ Quiz'}
              </span>
            </button>
          )}

          <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={lesson.is_preview}
              onChange={(e) => onUpdateField('is_preview', e.target.checked)}
              className="w-3.5 h-3.5 accent-indigo-600 rounded"
            />
            <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" />
              <span>{isVi ? 'Học thử' : 'Preview'}</span>
            </span>
          </label>

          {(onMoveUp || onMoveDown) && (
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={isFirst}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-slate-200 transition-colors"
                title={isVi ? 'Đưa bài lên trên' : 'Move up'}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={isLast}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:text-slate-200 transition-colors"
                title={isVi ? 'Đưa bài xuống dưới' : 'Move down'}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Video className="w-3 h-3" />
            <span className="hidden sm:inline">{isExpanded ? (isVi ? 'Thu gọn' : 'Collapse') : (isVi ? 'Chi tiết' : 'Details')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title={isVi ? 'Xóa bài học này' : 'Remove lesson'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-3.5 bg-white dark:bg-slate-900">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
            {lesson.pending_video_name && !lesson.video_url && (
              <div className="flex items-center gap-2 p-2.5 mb-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 font-medium">
                <UploadCloud className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">
                  {isVi
                    ? `Đã khớp file: "${lesson.pending_video_name}" (sẽ tự động tải lên Cloudflare R2 khi bạn nhấn "Lưu Khóa Học").`
                    : `Matched file: "${lesson.pending_video_name}" (will be uploaded to R2 upon clicking Save).`}
                </span>
              </div>
            )}
            <R2MediaUploader
              type="video"
              value={lesson.video_url}
              onChange={(url) => onUpdateField('video_url', url)}
              onDurationChange={(mins, secs) =>
                onUpdateFields({
                  duration_minutes: mins,
                  duration_seconds: secs,
                })
              }
              folder={chapterFolder}
              label={isVi ? `File Video Bài Học ${chapterIndex + 1}.${lessonIndex + 1}` : `Lesson Video File ${chapterIndex + 1}.${lessonIndex + 1}`}
              isVi={isVi}
            />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
            {lesson.pending_theory_name && !lesson.theory_file_url && (
              <div className="flex items-center gap-2 p-2.5 mb-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {isVi
                    ? `Đã khớp tài liệu: "${lesson.pending_theory_name}" (sẽ tự động tải lên Cloudflare R2 khi bạn nhấn "Lưu Khóa Học").`
                    : `Matched document: "${lesson.pending_theory_name}" (will be uploaded to R2 upon clicking Save).`}
                </span>
              </div>
            )}
            <R2MediaUploader
              type="document"
              value={lesson.theory_file_url || ''}
              fileName={lesson.theory_file_name || ''}
              onChange={(url) => onUpdateField('theory_file_url', url)}
              onFileNameChange={(name) => onUpdateField('theory_file_name', name)}
              folder={`${chapterFolder}/lessons/lesson-${lessonIndex + 1}/documents`}
              label={isVi ? `Tài liệu lý thuyết / Slide bài học ${chapterIndex + 1}.${lessonIndex + 1} (PDF, Docx, PPT...)` : `Lesson Theory Document ${chapterIndex + 1}.${lessonIndex + 1}`}
              isVi={isVi}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Bộ câu hỏi ôn tập củng cố (Practice Quiz)' : 'Lesson Practice Quiz'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lesson.questions && lesson.questions.length > 0
                    ? isVi
                      ? `Đã thiết lập ${lesson.questions.length} câu hỏi ôn tập cho học viên`
                      : `${lesson.questions.length} questions configured`
                    : isVi
                    ? 'Chưa có câu hỏi. Bạn có thể thêm câu hỏi hoặc import trọn gói từ file ZIP/Excel.'
                    : 'No questions added yet. You can add questions manually or import via ZIP/Excel.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenQuizStudio?.(lesson)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {lesson.questions && lesson.questions.length > 0
                  ? isVi
                    ? 'Mở Quiz Studio'
                    : 'Open Quiz Studio'
                  : isVi
                  ? 'Soạn câu hỏi / Import ZIP'
                  : 'Add Quiz / Import ZIP'}
              </span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Ghi chú & Tóm tắt kiến thức bài học' : 'Lesson Summary & Key Notes'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {isVi ? '(Tùy chọn - hiển thị cho học viên ôn tập)' : '(Optional)'}
              </span>
            </label>
            <textarea
              rows={2}
              value={lesson.content}
              onChange={(e) => onUpdateField('content', e.target.value)}
              placeholder={isVi ? 'Ghi chú các điểm ngữ pháp, mẹo giải đề, từ vựng trọng tâm trong video này...' : 'Key grammar rules, tips, vocabulary in this lesson...'}
              className="w-full rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  )
}
