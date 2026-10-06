// Header va thanh cong cu tim kiem, them cau hoi cho de thi.

import {
  BookOpen,
  Mic,
  PenTool,
  Plus,
  Search,
  Volume2,
  X,
} from 'lucide-react'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'

interface ExamEditorHeaderProps {
  exam: ToeicExamItem
  isVi: boolean
  is4Skills: boolean
  isSystemPlacement: boolean
  isToeic?: boolean
  isLessonMode?: boolean
  questionsCount: number
  searchQuery: string
  uploadingGlobalAudio: boolean
  globalAudioUrl: string
  onClose: () => void
  onSearchChange: (val: string) => void
  onOpenGlobalAudioPicker: () => void
  onAddQuestion: (targetSkill?: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' | string | number) => void
}

export function ExamEditorHeader({
  exam,
  isVi,
  is4Skills,
  isSystemPlacement,
  isToeic = false,
  isLessonMode = false,
  questionsCount,
  searchQuery,
  uploadingGlobalAudio,
  globalAudioUrl,
  onClose,
  onSearchChange,
  onOpenGlobalAudioPicker,
  onAddQuestion,
}: ExamEditorHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isLessonMode
                  ? isVi ? 'Bộ Câu Hỏi Ôn Tập Bài Học' : 'Lesson Practice Questions'
                  : isVi ? 'Soạn Ngân Hàng Câu Hỏi Đề Thi' : 'Exam Question Bank Editor'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {questionsCount} câu hỏi
              </span>
              {isLessonMode ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {isVi ? 'Ôn tập củng cố' : 'Practice Quiz'}
                </span>
              ) : (
                <>
                  {isToeic ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {isVi ? 'Đề thi TOEIC' : 'TOEIC Exam'}
                    </span>
                  ) : isSystemPlacement ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {isVi ? 'Đầu vào hệ thống' : 'System Placement'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {isVi ? 'Bài thi khóa học' : 'Course Exam'}
                    </span>
                  )}
                  {is4Skills ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      4 Kỹ năng (LRSW)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                      2 Kỹ năng (LR)
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
              {isLessonMode
                ? exam.course_title || exam.title
                : `${exam.title} ${exam.course_title ? `• ${exam.course_title}` : ''}`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isVi ? 'Tìm kiếm theo nội dung, câu số...' : 'Search questions...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end flex-wrap">
          {isLessonMode ? (
            <button
              type="button"
              onClick={() => onAddQuestion()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isVi ? 'Thêm câu hỏi' : 'Add Question'}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenGlobalAudioPicker}
                disabled={uploadingGlobalAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title={
                  isVi
                    ? 'Upload file nghe chung cho toàn đề thi'
                    : 'Upload global audio file'
                }
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {uploadingGlobalAudio
                    ? isVi
                      ? 'Đang tải...'
                      : 'Uploading...'
                    : globalAudioUrl
                      ? isVi
                        ? 'Đổi Audio Đề'
                        : 'Change Audio'
                      : isVi
                        ? 'Gắn Audio Đề'
                        : 'Set Audio'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onAddQuestion('LISTENING')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ {isVi ? 'Nghe' : 'Listening'}</span>
              </button>

              <button
                type="button"
                onClick={() => onAddQuestion('READING')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 text-violet-700 dark:text-violet-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ {isVi ? 'Đọc' : 'Reading'}</span>
              </button>

              {is4Skills && (
                <>
                  <button
                    type="button"
                    onClick={() => onAddQuestion('SPEAKING')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5 text-teal-600" />
                    <span>+ {isVi ? 'Nói' : 'Speaking'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddQuestion('WRITING')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ {isVi ? 'Viết' : 'Writing'}</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
