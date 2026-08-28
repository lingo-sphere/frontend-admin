import { useState } from 'react'
import {
  Video,
  Plus,
  Trash2,
  Play,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  Film,
} from 'lucide-react'
import { R2MediaUploader } from '@/components/admin/R2MediaUploader'
import type {
  CourseFormData,
  CourseModule,
  CourseLesson,
} from '@/pages/course-form/CourseBasicInfoTab'

interface CourseCurriculumManagerProps {
  modules: CourseModule[]
  onChange: (modules: CourseModule[]) => void
  onPreviewVideo: (url: string) => void
  isVi: boolean
}

export function CourseCurriculumManager({
  modules,
  onChange,
  onPreviewVideo,
  isVi,
}: CourseCurriculumManagerProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.map((m) => m.id)
  )

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const addModule = () => {
    const newModuleId = `mod-${Date.now()}`
    const newModule: CourseModule = {
      id: newModuleId,
      title: isVi
        ? `Chương ${modules.length + 1}: Tiêu đề chương mới`
        : `Chapter ${modules.length + 1}: New Chapter`,
      description: '',
      module_order: modules.length + 1,
      lessons: [
        {
          id: `les-${Date.now()}`,
          title: isVi ? 'Bài 1: Video mở đầu' : 'Lesson 1: Introduction Video',
          video_url: '',
          duration_minutes: 15,
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
    if (modules.length <= 1) return
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
          title: isVi
            ? `Bài ${m.lessons.length + 1}: Bài giảng video mới`
            : `Lesson ${m.lessons.length + 1}: New Video Lesson`,
          video_url: '',
          duration_minutes: 15,
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" />
            <span>
              {isVi
                ? '2. Chương trình giảng dạy & Video bài giảng'
                : '2. Curriculum & Video Lessons'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isVi
              ? 'Mỗi chương gồm danh sách các bài học video, link video bài giảng, thời lượng và tóm tắt kiến thức.'
              : 'Each module includes video lessons, video URLs, duration, and summary notes.'}
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

      <div className="space-y-4">
        {modules.map((mod, modIdx) => {
          const isExpanded = expandedModules.includes(mod.id)
          const modDuration = mod.lessons.reduce(
            (acc, l) => acc + (Number(l.duration_minutes) || 0),
            0
          )

          return (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden dark:border-slate-800 dark:bg-slate-950/60"
            >
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
                    {mod.title.replace(/^(Chương|Chapter)\s*\d+:\s*/, '')}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400 ml-2">
                    ({mod.lessons.length} {isVi ? 'bài' : 'lessons'} · {modDuration} {isVi ? 'phút' : 'min'})
                  </span>
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

                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(mod.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Xóa chương này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
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
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 dark:bg-indigo-600/20 dark:text-indigo-300 transition-colors"
                        >
                          + {isVi ? 'Thêm Video Đầu Tiên' : 'Add First Video'}
                        </button>
                      </div>
                    ) : (
                      mod.lessons.map((les, lesIdx) => (
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
                                  {isVi ? 'Học thử' : 'Preview'}
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={() => removeLesson(mod.id, les.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Xóa bài học"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                            <div className="sm:col-span-2">
                              <R2MediaUploader
                                type="video"
                                value={les.video_url}
                                onChange={(url) =>
                                  updateLessonField(
                                    mod.id,
                                    les.id,
                                    'video_url',
                                    url
                                  )
                                }
                                folder="course-videos"
                                label={isVi ? 'Video bài giảng (Cloudflare R2 MP4 / WebM)' : 'Lesson Video (Cloudflare R2 MP4 / WebM)'}
                                isVi={isVi}
                              />
                            </div>

                            <div className="space-y-1 sm:pt-6">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-teal-500" />
                                <span>{isVi ? 'Thời lượng (Phút)' : 'Duration (Mins)'}</span>
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={les.duration_minutes}
                                onChange={(e) =>
                                  updateLessonField(
                                    mod.id,
                                    les.id,
                                    'duration_minutes',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full h-9 px-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span>
                                {isVi
                                  ? 'Ghi chú / Tóm tắt kiến thức trọng tâm cho video này'
                                  : 'Lesson Summary / Key Points'}
                              </span>
                            </label>
                            <textarea
                              value={les.content}
                              onChange={(e) =>
                                updateLessonField(
                                  mod.id,
                                  les.id,
                                  'content',
                                  e.target.value
                                )
                              }
                              rows={2}
                              placeholder={
                                isVi
                                  ? 'Ghi chú kiến thức chính, từ vựng hoặc công thức cần nhớ trong video...'
                                  : 'Summary of key notes or formula...'
                              }
                              className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
