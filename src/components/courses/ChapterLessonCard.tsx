/**
 * @file ChapterLessonCard.tsx
 * @description Component hiển thị và chỉnh sửa một bài học video trong chương học
 */

import { Clock, FileText, Trash2 } from 'lucide-react'
import { R2MediaUploader } from '@/components/admin/R2MediaUploader'
import type { CourseLesson } from './CourseBasicInfoTab'

interface ChapterLessonCardProps {
  lesson: CourseLesson
  lessonIndex: number
  chapterFolder: string
  isVi: boolean
  onUpdateField: (field: keyof CourseLesson, value: string | number | boolean) => void
  onUpdateFields: (fields: Partial<CourseLesson>) => void
  onRemove: () => void
  formatDurationDisplay: (seconds?: number, minutes?: number) => string
}

export function ChapterLessonCard({
  lesson,
  lessonIndex,
  chapterFolder,
  isVi,
  onUpdateField,
  onUpdateFields,
  onRemove,
  formatDurationDisplay,
}: ChapterLessonCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 transition-all dark:bg-slate-900 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/20">
            {lessonIndex + 1}
          </span>
          <input
            type="text"
            value={lesson.title}
            onChange={(e) => onUpdateField('title', e.target.value)}
            placeholder={isVi ? 'Tên bài học video...' : 'Lesson video title...'}
            className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lesson.is_preview}
              onChange={(e) => onUpdateField('is_preview', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
              {isVi ? 'Học thử miễn phí' : 'Free Preview'}
            </span>
          </label>

          <div
            className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 dark:bg-slate-950 dark:border-slate-800"
            title={isVi ? 'Thời lượng video (tự động đọc khi tải lên)' : 'Video duration'}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 min-w-[32px] text-center">
              {formatDurationDisplay(lesson.duration_seconds, lesson.duration_minutes)}
            </span>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            title={isVi ? 'Xóa bài học này' : 'Remove lesson'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

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
        label={isVi ? 'Video Bài Giảng' : 'Lesson Video'}
        isVi={isVi}
      />

      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isVi
              ? 'Nội dung tóm tắt / Ghi chú bài giảng'
              : 'Lesson Summary Notes'}
          </span>
        </label>
        <textarea
          rows={2}
          value={lesson.content}
          onChange={(e) => onUpdateField('content', e.target.value)}
          placeholder={
            isVi
              ? 'Ghi chú kiến thức trọng tâm...'
              : 'Add key takeaways...'
          }
          className="w-full rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
        />
      </div>
    </div>
  )
}
