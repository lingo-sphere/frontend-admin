import { useState } from 'react'
import {
  Video,
  Plus,
  Trash2,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  Film,
  FileSpreadsheet,
  Award,
  Eye,
} from 'lucide-react'
import { R2MediaUploader } from '@/components/admin/R2MediaUploader'
import { ExcelQuizImporterModal } from '@/components/admin/ExcelQuizImporterModal'
import { ModuleQuestionViewerModal } from '@/components/admin/ModuleQuestionViewerModal'
import type {
  CourseModule,
  CourseLesson,
} from './CourseBasicInfoTab'
import type { QuizQuestionItem } from '@/services/ai.service'

interface CourseCurriculumManagerProps {
  modules: CourseModule[]
  onChange: (modules: CourseModule[]) => void
  onPreviewVideo: (url: string) => void
  isVi: boolean
  courseFolder?: string
}

export function CourseCurriculumManager({
  modules,
  onChange,
  onPreviewVideo: _onPreviewVideo,
  isVi,
  courseFolder,
}: CourseCurriculumManagerProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.map((m) => m.id)
  )

  const [excelModalState, setExcelModalState] = useState<{
    isOpen: boolean
    moduleId: string
    moduleTitle: string
  }>({
    isOpen: false,
    moduleId: '',
    moduleTitle: '',
  })

  const [viewerModalState, setViewerModalState] = useState<{
    isOpen: boolean
    moduleId: string
    moduleTitle: string
    testTitle: string
    questions: QuizQuestionItem[]
  }>({
    isOpen: false,
    moduleId: '',
    moduleTitle: '',
    testTitle: '',
    questions: [],
  })

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const addModule = () => {
    const now = Date.now()
    const newModuleId = `mod-${now}`
    const newModule: CourseModule = {
      id: newModuleId,
      title: '',
      description: '',
      module_order: modules.length + 1,
      created_at_timestamp: now,
      passing_score: 70,
      test_questions: [],
      challenge_passing_score: 70,
      challenge_questions: [],
      post_mini_passing_score: 70,
      post_mini_questions: [],
      lessons: [
        {
          id: `les-${now}`,
          title: '',
          video_url: '',
          duration_minutes: 0,
          content: '',
          is_preview: false,
          lesson_order: 1,
        },
      ],
    }
    onChange([...modules, newModule])
    setExpandedModules((prev) => [...prev, newModuleId])
  }

  const removeModule = (moduleId: string) => {
    onChange(modules.filter((m) => m.id !== moduleId))
  }

  const updateModule = (moduleId: string, updated: Partial<CourseModule>) => {
    onChange(
      modules.map((m) => (m.id === moduleId ? { ...m, ...updated } : m))
    )
  }

  const addLesson = (moduleId: string) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        const newLesson: CourseLesson = {
          id: `les-${Date.now()}`,
          title: '',
          video_url: '',
          duration_minutes: 0,
          content: '',
          is_preview: false,
          lesson_order: m.lessons.length + 1,
        }
        return {
          ...m,
          lessons: [...m.lessons, newLesson],
        }
      })
    )
  }

  const removeLesson = (moduleId: string, lessonId: string) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        return {
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lessonId),
        }
      })
    )
  }

  const updateLessonField = (
    moduleId: string,
    lessonId: string,
    field: keyof CourseLesson,
    value: string | number | boolean
  ) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        return {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, [field]: value } : l
          ),
        }
      })
    )
  }

  const handleApplyQuestions = (
    moduleId: string,
    questions: QuizQuestionItem[]
  ) => {
    updateModule(moduleId, {
      test_questions: questions,
      challenge_questions: questions,
      post_mini_questions: questions,
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" />
            <span>
              {isVi
                ? '3. Chương trình giảng dạy, Bài học & Bài Test Đánh giá'
                : '3. Curriculum, Lessons & Chapter Assessments'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi
              ? 'Soạn video bài giảng và tạo bài test kiểm tra cuối chương (AI & Excel) để đánh giá và mở khóa chương tiếp theo.'
              : 'Add lesson videos and generate chapter assessment tests using AI or Excel.'}
          </p>
        </div>

        <button
          type="button"
          onClick={addModule}
          className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isVi ? 'Thêm Chương Mới' : 'Add Chapter'}</span>
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isVi ? 'Chưa có chương học nào' : 'No chapters added yet'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {isVi
                ? 'Bấm nút "Thêm Chương Mới" để bắt đầu thiết kế lộ trình và tải lên các bài học video cho khóa học.'
                : 'Click "Add Chapter" to begin creating your curriculum and uploading lesson videos.'}
            </p>
          </div>
          <button
            type="button"
            onClick={addModule}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Tạo Chương Đầu Tiên' : 'Create First Chapter'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, modIdx) => {
            const isExpanded = expandedModules.includes(mod.id)
            const modDuration = mod.lessons.reduce(
              (acc, l) => acc + (Number(l.duration_minutes) || 0),
              0
            )

            const questionsList =
              mod.test_questions ||
              mod.post_mini_questions ||
              mod.challenge_questions ||
              []
            const questionCount = questionsList.length
            const passingScore =
              mod.passing_score ??
              mod.post_mini_passing_score ??
              mod.challenge_passing_score ??
              70

            return (
              <div
                key={mod.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden dark:border-slate-800 dark:bg-slate-950/40"
              >
                {}
                <div className="p-4 flex items-center justify-between gap-3 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => toggleModuleExpand(mod.id)}
                    className="flex items-center gap-2.5 text-left flex-1 font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-sm">
                      {isVi ? 'Chương' : 'Chapter'} {modIdx + 1}:{' '}
                      {mod.title || (isVi ? 'Chưa đặt tên chương' : 'Untitled Chapter')}
                    </span>
                    <span className="text-[11px] font-normal text-slate-400 ml-2">
                      ({mod.lessons.length} {isVi ? 'bài' : 'lessons'} · {modDuration} {isVi ? 'phút' : 'min'})
                    </span>

                    {}
                    {questionCount > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        🎯 Bài Test ({questionCount} câu · {passingScore}%)
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addLesson(mod.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Thêm Video' : 'Add Video'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeModule(mod.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Xóa chương này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-6">
                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {isVi ? 'Tên chương' : 'Chapter Title'}
                        </label>
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) =>
                            updateModule(mod.id, { title: e.target.value })
                          }
                          placeholder="VD: Tổng quan phương pháp nghe Part 1"
                          className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {isVi ? 'Mô tả tóm tắt chương' : 'Description'}
                        </label>
                        <input
                          type="text"
                          value={mod.description}
                          onChange={(e) =>
                            updateModule(mod.id, { description: e.target.value })
                          }
                          placeholder="VD: Nắm vững cấu trúc và từ vựng cốt lõi..."
                          className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {}
                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/30">
                            <Award className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                              {isVi ? 'Bài Kiểm Tra Đánh Giá Chương' : 'Chapter Assessment Test'}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {isVi
                                ? 'Học viên làm đạt ngưỡng điểm để hoàn thành và mở khóa chương tiếp theo'
                                : 'Students pass this test to complete and unlock the next chapter'}
                            </p>
                          </div>
                        </div>

                        {}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            {isVi ? 'Ngưỡng đạt:' : 'Passing Score:'}
                          </span>
                          <input
                            type="number"
                            min={10}
                            max={100}
                            value={passingScore}
                            onChange={(e) => {
                              const val = Math.max(10, Math.min(100, Number(e.target.value) || 70))
                              updateModule(mod.id, {
                                passing_score: val,
                                challenge_passing_score: val,
                                post_mini_passing_score: val,
                              })
                            }}
                            className="w-12 h-7 text-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-indigo-600 dark:bg-slate-950 dark:border-slate-700 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
                          />
                          <span className="text-[11px] font-bold text-slate-500">%</span>
                        </div>
                      </div>

                      {}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-500/15 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {questionCount > 0
                              ? `✅ Đã có ${questionCount} câu hỏi trắc nghiệm`
                              : '⚠️ Chưa có câu hỏi nào trong bài test này'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExcelModalState({
                                isOpen: true,
                                moduleId: mod.id,
                                moduleTitle: mod.title || `Chương ${modIdx + 1}`,
                              })
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            <span>Upload File Excel (.xlsx)</span>
                          </button>

                          {questionCount > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setViewerModalState({
                                  isOpen: true,
                                  moduleId: mod.id,
                                  moduleTitle: mod.title || `Chương ${modIdx + 1}`,
                                  testTitle: `Bài Kiểm Tra - ${mod.title || `Chương ${modIdx + 1}`}`,
                                  questions: questionsList,
                                })
                              }
                              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs"
                              title="Xem & sửa câu hỏi"
                            >
                              <Eye className="h-3.5 w-3.5 text-indigo-500" />
                              <span>Xem/Sửa câu hỏi</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-teal-500" />
                        <span>
                          {isVi
                            ? 'Danh sách Video bài giảng trong chương:'
                            : 'Video Lessons in this Chapter:'}
                        </span>
                      </p>

                      {mod.lessons.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl space-y-2 dark:border-slate-800">
                          <p className="text-xs text-slate-500">
                            {isVi
                              ? 'Chương này chưa có video bài học nào'
                              : 'No video lessons in this chapter yet'}
                          </p>
                          <button
                            type="button"
                            onClick={() => addLesson(mod.id)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 dark:bg-indigo-600/20 dark:text-indigo-300 transition-colors cursor-pointer"
                          >
                            + {isVi ? 'Thêm Video Đầu Tiên' : 'Add First Video'}
                          </button>
                        </div>
                      ) : (
                        mod.lessons.map((les, lesIdx) => {
                          const modOrder = mod.module_order || modIdx + 1
                          const modTimestamp = mod.created_at_timestamp || Date.now()
                          const chapterFolder = courseFolder
                            ? `${courseFolder}/${modOrder}-${modTimestamp}`
                            : `courses/modules/${modOrder}-${modTimestamp}`

                          return (
                            <div
                              key={les.id}
                              className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 transition-all dark:bg-slate-900 dark:border-slate-800"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/20">
                                    {lesIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={les.title}
                                    onChange={(e) =>
                                      updateLessonField(
                                        mod.id,
                                        les.id,
                                        'title',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Tên bài học video..."
                                    className="w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                                  />
                                </div>

                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={les.is_preview}
                                      onChange={(e) =>
                                        updateLessonField(
                                          mod.id,
                                          les.id,
                                          'is_preview',
                                          e.target.checked
                                        )
                                      }
                                      className="w-4 h-4 accent-indigo-600 rounded"
                                    />
                                    <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
                                      {isVi ? 'Học thử miễn phí' : 'Free Preview'}
                                    </span>
                                  </label>

                                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <input
                                      type="number"
                                      min={0}
                                      value={les.duration_minutes || ''}
                                      onChange={(e) =>
                                        updateLessonField(
                                          mod.id,
                                          les.id,
                                          'duration_minutes',
                                          Math.max(0, Number(e.target.value) || 0)
                                        )
                                      }
                                      placeholder="0"
                                      className="w-12 h-6 text-center text-xs font-semibold bg-transparent text-slate-900 outline-none dark:text-slate-100"
                                    />
                                    <span className="text-[10px] text-slate-400">
                                      {isVi ? 'phút' : 'min'}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => removeLesson(mod.id, les.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title="Xóa bài học này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {}
                              <R2MediaUploader
                                type="video"
                                value={les.video_url}
                                onChange={(url) =>
                                  updateLessonField(mod.id, les.id, 'video_url', url)
                                }
                                folder={chapterFolder}
                                label={
                                  isVi
                                    ? `Video Bài Giảng (Lưu tại: ${chapterFolder})`
                                    : `Lesson Video (Saved to: ${chapterFolder})`
                                }
                                isVi={isVi}
                              />

                              {}
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
                                  value={les.content}
                                  onChange={(e) =>
                                    updateLessonField(
                                      mod.id,
                                      les.id,
                                      'content',
                                      e.target.value
                                    )
                                  }
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
                        })
                      )}

                      {mod.lessons.length > 0 && (
                        <button
                          type="button"
                          onClick={() => addLesson(mod.id)}
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
          })}

          <div className="pt-2">
            <button
              type="button"
              onClick={addModule}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/40 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isVi ? 'Thêm Chương Học Mới' : 'Add New Chapter'}</span>
            </button>
          </div>
        </div>
      )}

      <ExcelQuizImporterModal
        isOpen={excelModalState.isOpen}
        onClose={() => setExcelModalState((prev) => ({ ...prev, isOpen: false }))}
        onApplyQuestions={(q: QuizQuestionItem[]) =>
          handleApplyQuestions(excelModalState.moduleId, q)
        }
        moduleTitle={excelModalState.moduleTitle}
      />

      <ModuleQuestionViewerModal
        isOpen={viewerModalState.isOpen}
        onClose={() => setViewerModalState((prev) => ({ ...prev, isOpen: false }))}
        questions={viewerModalState.questions}
        onSaveQuestions={(q: QuizQuestionItem[]) =>
          handleApplyQuestions(viewerModalState.moduleId, q)
        }
        moduleTitle={viewerModalState.moduleTitle}
        testTitle={viewerModalState.testTitle}
      />
    </div>
  )
}
