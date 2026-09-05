/**
 * @file course.chapter.card.tsx
 * @description Component quản lý và hiển thị toàn bộ nội dung của một chương học theo cấu trúc cây timeline phân cấp rõ ràng
 */

import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Film,
  Award,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Layers,
} from 'lucide-react'
import { ChapterLessonCard } from './chapter.lesson.card'
import { ChapterAssessmentCard } from './chapter.assessment.card'
import type { CourseModule, CourseLesson } from './course.basic.info.tab'

interface CourseChapterCardProps {
  module: CourseModule
  moduleIndex: number
  totalModules?: number
  isExpanded: boolean
  courseFolder?: string
  isVi: boolean
  is4Skills?: boolean
  onToggleExpand: () => void
  onRemoveModule: () => void
  onUpdateModule: (updated: Partial<CourseModule>) => void
  onAddLesson: () => void
  onRemoveLesson: (lessonId: string) => void
  onMoveLessonUp?: (lessonIndex: number) => void
  onMoveLessonDown?: (lessonIndex: number) => void
  onMoveModuleUp?: () => void
  onMoveModuleDown?: () => void
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
  totalModules = 1,
  isExpanded,
  courseFolder,
  isVi,
  is4Skills = false,
  onToggleExpand,
  onRemoveModule,
  onUpdateModule,
  onAddLesson,
  onRemoveLesson,
  onMoveLessonUp,
  onMoveLessonDown,
  onMoveModuleUp,
  onMoveModuleDown,
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

  const hasLessons = module.lessons.length > 0
  const isFirstChapter = moduleIndex === 0
  const isLastChapter = moduleIndex === totalModules - 1

  return (
    <div className={`rounded-2xl border-2 transition-all overflow-hidden ${
      isExpanded
        ? 'border-indigo-500/80 bg-white shadow-md shadow-indigo-500/5 dark:border-indigo-500/60 dark:bg-slate-900 border-l-[8px] border-l-indigo-600 dark:border-l-indigo-500'
        : 'border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/80 border-l-[8px] border-l-slate-300 dark:border-l-slate-700'
    }`}>
      <div className={`p-3.5 sm:p-4.5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
        isExpanded
          ? 'bg-gradient-to-r from-indigo-50/80 via-slate-50/50 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-b border-indigo-100 dark:border-indigo-950'
          : 'bg-white hover:bg-slate-50/70 dark:bg-slate-900 dark:hover:bg-slate-850'
      }`}>
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-3 flex-1 min-w-[260px] cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-xs shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{isVi ? 'Chương' : 'Chapter'} {moduleIndex + 1}</span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {module.title || (
                  <span className="italic text-slate-400 font-normal">
                    {isVi ? '(Chưa đặt tiêu đề chương học)' : '(Untitled chapter)'}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Film className="w-3 h-3 text-indigo-500" />
                <span>{module.lessons.length} {isVi ? 'bài học video' : 'lessons'}</span>
                <span>·</span>
                <span>{modDuration} {isVi ? 'phút' : 'min'}</span>
              </span>

              {questionCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Award className="w-3 h-3 text-emerald-600" />
                  <span>{isVi ? 'Bài test' : 'Test'}: {questionCount} {isVi ? 'câu' : 'qs'} ({passingScore}%)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <span>{isVi ? 'Chưa có bài test' : 'No test'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(onMoveModuleUp || onMoveModuleDown) && (
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={onMoveModuleUp}
                disabled={isFirstChapter}
                className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-25 disabled:cursor-not-allowed dark:hover:text-indigo-400 transition-colors"
                title={isVi ? 'Chuyển chương lên trước' : 'Move chapter up'}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onMoveModuleDown}
                disabled={isLastChapter}
                className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-25 disabled:cursor-not-allowed dark:hover:text-indigo-400 transition-colors"
                title={isVi ? 'Chuyển chương xuống sau' : 'Move chapter down'}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!isExpanded && (
            <button
              type="button"
              onClick={onAddLesson}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isVi ? 'Thêm Video' : 'Add Video'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleExpand}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <span className="hidden sm:inline">{isVi ? 'Thu gọn' : 'Collapse'}</span>
                <ChevronUp className="w-4 h-4 text-slate-500" />
              </>
            ) : (
              <>
                <span className="hidden sm:inline">{isVi ? 'Mở rộng' : 'Expand'}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRemoveModule}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title={isVi ? `Xóa Chương ${moduleIndex + 1}` : 'Delete chapter'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                {isVi ? `Thông Tin Cơ Bản Chương ${moduleIndex + 1}` : `Chapter ${moduleIndex + 1} Basic Information`}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isVi ? 'Tiêu đề chương học' : 'Chapter Title'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={module.title}
                  onChange={(e) => onUpdateModule({ title: e.target.value })}
                  placeholder={isVi ? 'VD: Phương pháp xử lý bẫy Part 1 & Từ vựng...' : 'e.g. Part 1 Traps and Core Vocabulary...'}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isVi ? 'Mô tả ngắn về chương' : 'Chapter Description'}
                </label>
                <input
                  type="text"
                  value={module.description}
                  onChange={(e) => onUpdateModule({ description: e.target.value })}
                  placeholder={isVi ? 'VD: Nắm vững 300 từ vựng miêu tả tranh và cách nghe động từ...' : 'Summary of topics covered...'}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="relative pl-5 sm:pl-7 border-l-2 border-indigo-200 dark:border-indigo-900 ml-2 sm:ml-3 space-y-6">
            <div className="relative space-y-3">
              <div className="absolute -left-[29px] sm:-left-[37px] top-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs ring-4 ring-indigo-100 dark:ring-indigo-950">
                <Film className="w-3 h-3" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>
                      {isVi
                        ? `Danh sách bài học video trong Chương ${moduleIndex + 1}`
                        : `Video Lessons in Chapter ${moduleIndex + 1}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-bold">
                      {module.lessons.length}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isVi
                      ? `Các bài học được đánh số ${moduleIndex + 1}.1, ${moduleIndex + 1}.2, ${moduleIndex + 1}.3... theo đúng thứ tự học viên sẽ học`
                      : `Lessons are numbered ${moduleIndex + 1}.1, ${moduleIndex + 1}.2... in learning order`}
                  </p>
                </div>
              </div>

              {!hasLessons ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-2xl bg-white/70 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
                  <Film className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi
                      ? `Chương ${moduleIndex + 1} chưa có bài học video nào`
                      : `No video lessons in Chapter ${moduleIndex + 1} yet`}
                  </p>
                  <button
                    type="button"
                    onClick={onAddLesson}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isVi ? `Tạo Bài Học ${moduleIndex + 1}.1 Đầu Tiên` : 'Create First Lesson'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <ChapterLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      lessonIndex={lessonIndex}
                      chapterIndex={moduleIndex}
                      chapterFolder={chapterFolder}
                      isVi={isVi}
                      isFirst={lessonIndex === 0}
                      isLast={lessonIndex === module.lessons.length - 1}
                      onMoveUp={onMoveLessonUp ? () => onMoveLessonUp(lessonIndex) : undefined}
                      onMoveDown={onMoveLessonDown ? () => onMoveLessonDown(lessonIndex) : undefined}
                      onUpdateField={(field, val) => onUpdateLessonField(lesson.id, field, val)}
                      onUpdateFields={(fields) => onUpdateLessonFields(lesson.id, fields)}
                      onRemove={() => onRemoveLesson(lesson.id)}
                      formatDurationDisplay={formatDurationDisplay}
                    />
                  ))}

                  
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={onAddLesson}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-teal-300 dark:border-teal-800/80 bg-teal-50/50 hover:bg-teal-50 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-extrabold transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                    >
                      <span className="w-5 h-5 rounded-lg bg-teal-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        {isVi
                          ? `Thêm Bài Học Video ${moduleIndex + 1}.${module.lessons.length + 1}`
                          : `Add Video Lesson ${moduleIndex + 1}.${module.lessons.length + 1}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative pt-2">
              <div className="absolute -left-[29px] sm:-left-[37px] top-6 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs ring-4 ring-emerald-100 dark:ring-emerald-950">
                <Award className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-2">
                <ChapterAssessmentCard
                  module={module}
                  chapterIndex={moduleIndex}
                  isVi={isVi}
                  is4Skills={is4Skills}
                  onUpdateModule={onUpdateModule}
                  onOpenExcelModal={onOpenExcelModal}
                  onOpenViewerModal={onOpenViewerModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
