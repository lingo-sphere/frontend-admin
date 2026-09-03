/**
 * @file CourseChapterCard.tsx
 * @description Component quản lý và hiển thị toàn bộ nội dung của một chương học (thông tin, bài test, danh sách bài học video)
 */

import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Film,
} from 'lucide-react'
import { ChapterLessonCard } from './ChapterLessonCard'
import { ChapterAssessmentCard } from './ChapterAssessmentCard'
import type { CourseModule, CourseLesson } from './CourseBasicInfoTab'

interface CourseChapterCardProps {
  module: CourseModule
  moduleIndex: number
  isExpanded: boolean
  courseFolder?: string
  isVi: boolean
  onToggleExpand: () => void
  onRemoveModule: () => void
  onUpdateModule: (updated: Partial<CourseModule>) => void
  onAddLesson: () => void
  onRemoveLesson: (lessonId: string) => void
  onUpdateLessonField: (
    lessonId: string,
    field: keyof CourseLesson,
    value: string | number | boolean
  ) => void
  onUpdateLessonFields: (lessonId: string, fields: Partial<CourseLesson>) => void
  onOpenExcelModal: () => void
  onOpenViewerModal: () => void
  formatDurationDisplay: (seconds?: number, minutes?: number) => string
}

export function CourseChapterCard({
  module,
  moduleIndex,
  isExpanded,
  courseFolder,
  isVi,
  onToggleExpand,
  onRemoveModule,
  onUpdateModule,
  onAddLesson,
  onRemoveLesson,
  onUpdateLessonField,
  onUpdateLessonFields,
  onOpenExcelModal,
  onOpenViewerModal,
  formatDurationDisplay,
}: CourseChapterCardProps) {
  const modDuration = module.lessons.reduce(
    (acc, l) => acc + (Number(l.duration_minutes) || 0),
    0
  )

  const questionsList =
    module.test_questions ||
    module.post_mini_questions ||
    module.challenge_questions ||
    []
  const questionCount = questionsList.length
  const passingScore =
    module.passing_score ??
    module.post_mini_passing_score ??
    module.challenge_passing_score ??
    70

  const modOrder = module.module_order || moduleIndex + 1
  const modTimestamp = module.created_at_timestamp || Date.now()
  const chapterFolder = courseFolder
    ? `${courseFolder}/${modOrder}-${modTimestamp}`
    : `courses/modules/${modOrder}-${modTimestamp}`

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden dark:border-slate-800 dark:bg-slate-950/40">
      <div className="p-4 flex items-center justify-between gap-3 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-2.5 text-left flex-1 font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-indigo-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-sm">
            {isVi ? 'Chương' : 'Chapter'} {moduleIndex + 1}:{' '}
            {module.title || (isVi ? 'Chưa đặt tên chương' : 'Untitled Chapter')}
          </span>
          <span className="text-[11px] font-normal text-slate-400 ml-2">
            ({module.lessons.length} {isVi ? 'bài' : 'lessons'} · {modDuration} {isVi ? 'phút' : 'min'})
          </span>

          {questionCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              🎯 Bài Test ({questionCount} câu · {passingScore}%)
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddLesson}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isVi ? 'Thêm Video' : 'Add Video'}</span>
          </button>

          <button
            type="button"
            onClick={onRemoveModule}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            title={isVi ? 'Xóa chương này' : 'Remove chapter'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {isVi ? 'Tên chương' : 'Chapter Title'}
              </label>
              <input
                type="text"
                value={module.title}
                onChange={(e) => onUpdateModule({ title: e.target.value })}
                placeholder={isVi ? 'VD: Tổng quan phương pháp nghe Part 1' : 'e.g. Overview of Part 1'}
                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {isVi ? 'Mô tả tóm tắt chương' : 'Description'}
              </label>
              <input
                type="text"
                value={module.description}
                onChange={(e) => onUpdateModule({ description: e.target.value })}
                placeholder={isVi ? 'VD: Nắm vững cấu trúc và từ vựng cốt lõi...' : 'Key concepts and structures...'}
                className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <ChapterAssessmentCard
            module={module}
            isVi={isVi}
            onUpdateModule={onUpdateModule}
            onOpenExcelModal={onOpenExcelModal}
            onOpenViewerModal={onOpenViewerModal}
          />

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-teal-500" />
              <span>
                {isVi
                  ? 'Danh sách Video bài giảng trong chương:'
                  : 'Video Lessons in this Chapter:'}
              </span>
            </p>

            {module.lessons.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl space-y-2 dark:border-slate-800">
                <p className="text-xs text-slate-500">
                  {isVi
                    ? 'Chương này chưa có video bài học nào'
                    : 'No video lessons in this chapter yet'}
                </p>
                <button
                  type="button"
                  onClick={onAddLesson}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 dark:bg-indigo-600/20 dark:text-indigo-300 transition-colors cursor-pointer"
                >
                  + {isVi ? 'Thêm Video Đầu Tiên' : 'Add First Video'}
                </button>
              </div>
            ) : (
              module.lessons.map((lesson, lessonIndex) => (
                <ChapterLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonIndex={lessonIndex}
                  chapterFolder={chapterFolder}
                  isVi={isVi}
                  onUpdateField={(field, val) => onUpdateLessonField(lesson.id, field, val)}
                  onUpdateFields={(fields) => onUpdateLessonFields(lesson.id, fields)}
                  onRemove={() => onRemoveLesson(lesson.id)}
                  formatDurationDisplay={formatDurationDisplay}
                />
              ))
            )}

            {module.lessons.length > 0 && (
              <button
                type="button"
                onClick={onAddLesson}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-teal-400/60 dark:border-teal-600/40 bg-teal-50/40 hover:bg-teal-50 dark:bg-teal-950/20 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isVi ? 'Thêm Video Bài Học Mới' : 'Add New Video Lesson'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
