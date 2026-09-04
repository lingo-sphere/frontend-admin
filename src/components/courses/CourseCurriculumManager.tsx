/**
 * @file CourseCurriculumManager.tsx
 * @description Quản lý toàn diện chương trình giảng dạy của khóa học với hệ thống phân cấp trực quan, thống kê bài học và điều khiển tổng thể
 */

import { useState } from 'react'
import {
  Video,
  Plus,
  Film,
  Layers,
  Clock,
  Award,
  ChevronsUpDown,
  ChevronsDownUp,
  Sparkles,
  Compass,
} from 'lucide-react'
import { ExcelQuizImporterModal } from '@/components/admin/ExcelQuizImporterModal'
import { ModuleQuestionViewerModal } from '@/components/admin/ModuleQuestionViewerModal'
import { CourseChapterCard } from './CourseChapterCard'
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
  is4Skills?: boolean
  courseFolder?: string
}

export function CourseCurriculumManager({
  modules,
  onChange,
  onPreviewVideo: _onPreviewVideo,
  isVi,
  is4Skills = false,
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

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const totalMinutes = modules.reduce(
    (acc, m) =>
      acc +
      (m.lessons || []).reduce(
        (sum, l) => sum + (Number(l.duration_minutes) || 0),
        0
      ),
    0
  )
  const totalTests = modules.filter(
    (m) =>
      (m.test_questions && m.test_questions.length > 0) ||
      (m.post_mini_questions && m.post_mini_questions.length > 0)
  ).length

  const areAllExpanded = modules.length > 0 && expandedModules.length === modules.length

  const toggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedModules([])
    } else {
      setExpandedModules(modules.map((m) => m.id))
    }
  }

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

  const moveModuleUp = (index: number) => {
    if (index <= 0) return
    const updated = [...modules]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    updated.forEach((m, idx) => {
      m.module_order = idx + 1
    })
    onChange(updated)
  }

  const moveModuleDown = (index: number) => {
    if (index >= modules.length - 1) return
    const updated = [...modules]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    updated.forEach((m, idx) => {
      m.module_order = idx + 1
    })
    onChange(updated)
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

  const moveLessonUp = (moduleId: string, lessonIndex: number) => {
    if (lessonIndex <= 0) return
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        const updatedLessons = [...m.lessons]
        const temp = updatedLessons[lessonIndex]
        updatedLessons[lessonIndex] = updatedLessons[lessonIndex - 1]
        updatedLessons[lessonIndex - 1] = temp
        updatedLessons.forEach((l, idx) => {
          l.lesson_order = idx + 1
        })
        return { ...m, lessons: updatedLessons }
      })
    )
  }

  const moveLessonDown = (moduleId: string, lessonIndex: number) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        if (lessonIndex >= m.lessons.length - 1) return m
        const updatedLessons = [...m.lessons]
        const temp = updatedLessons[lessonIndex]
        updatedLessons[lessonIndex] = updatedLessons[lessonIndex + 1]
        updatedLessons[lessonIndex + 1] = temp
        updatedLessons.forEach((l, idx) => {
          l.lesson_order = idx + 1
        })
        return { ...m, lessons: updatedLessons }
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

  const updateLessonFields = (
    moduleId: string,
    lessonId: string,
    fields: Partial<CourseLesson>
  ) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        return {
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, ...fields } : l
          ),
        }
      })
    )
  }

  const formatDurationDisplay = (seconds?: number, minutes?: number) => {
    if (typeof seconds === 'number' && seconds > 0) {
      if (seconds < 60) return `${seconds}s`
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return s > 0 ? `${m}p ${s}s` : `${m} phút`
    }
    if (typeof minutes === 'number' && minutes > 0) {
      if (minutes < 1) {
        const s = Math.round(minutes * 60)
        return `${s}s`
      }
      return `${minutes} phút`
    }
    return '0s'
  }

  const handleApplyQuestions = (
    moduleId: string,
    questions: QuizQuestionItem[],
    mode: 'append' | 'replace' = 'append',
    audioUrl?: string
  ) => {
    const targetModule = modules.find((m) => m.id === moduleId)
    const existing = targetModule?.test_questions || []
    const updated = mode === 'append' ? [...existing, ...questions] : questions

    const audioUpdates = audioUrl
      ? {
          test_audio_url: audioUrl,
          challenge_audio_url: audioUrl,
          audio_url: audioUrl,
        }
      : {}

    updateModule(moduleId, {
      test_questions: updated,
      challenge_questions: updated,
      post_mini_questions: updated,
      ...audioUpdates,
    })
  }

  const scrollToChapter = (moduleId: string) => {
    if (!expandedModules.includes(moduleId)) {
      setExpandedModules((prev) => [...prev, moduleId])
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-500/10">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {isVi
                  ? '3. Chương trình giảng dạy & Lộ trình học tập'
                  : '3. Curriculum & Chapter Learning Path'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi
                  ? 'Thiết kế các chương học, gắn bài học video và bài test đánh giá để học viên mở khóa từng chặng.'
                  : 'Structure chapters, upload lesson videos and configure chapter tests.'}
              </p>
            </div>
          </div>

          {modules.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold border border-indigo-100 dark:border-indigo-800/80">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{modules.length} {isVi ? 'chương học' : 'chapters'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-bold border border-teal-100 dark:border-teal-800/80">
                <Film className="w-3.5 h-3.5 text-teal-600" />
                <span>{totalLessons} {isVi ? 'video bài giảng' : 'lessons'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold border border-amber-100 dark:border-amber-800/80">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{totalMinutes} {isVi ? 'phút bài giảng' : 'min'}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold border border-purple-100 dark:border-purple-800/80">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>{totalTests}/{modules.length} {isVi ? 'chương có bài test' : 'tests ready'}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {modules.length > 0 && (
            <button
              type="button"
              onClick={toggleExpandAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {areAllExpanded ? (
                <>
                  <ChevronsDownUp className="w-4 h-4 text-slate-500" />
                  <span>{isVi ? 'Thu gọn tất cả' : 'Collapse all'}</span>
                </>
              ) : (
                <>
                  <ChevronsUpDown className="w-4 h-4 text-slate-500" />
                  <span>{isVi ? 'Mở rộng tất cả' : 'Expand all'}</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={addModule}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Thêm Chương Mới' : 'Add Chapter'}</span>
          </button>
        </div>
      </div>

      {modules.length >= 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            <span>{isVi ? 'Danh mục nhanh:' : 'Outline:'}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {modules.map((mod, idx) => {
              const isCurrentExpanded = expandedModules.includes(mod.id)
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => scrollToChapter(mod.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isCurrentExpanded
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Chương {idx + 1}</span>
                  {mod.title && (
                    <span className="max-w-[120px] truncate font-medium text-[11px] opacity-90">
                      : {mod.title}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {modules.length === 0 ? (
        <div className="py-16 px-4 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 text-center space-y-4 bg-gradient-to-b from-indigo-50/30 to-slate-50/50 dark:from-indigo-950/20 dark:to-slate-950/40">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center ring-8 ring-indigo-500/5 border border-indigo-500/20">
            <Film className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <p className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              {isVi ? 'Khóa học chưa có chương trình giảng dạy' : 'No curriculum created yet'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isVi
                ? 'Bấm nút "Tạo Chương Đầu Tiên" bên dưới để bắt đầu cấu trúc các chương học (Modules), tải video bài giảng và thiết lập bài kiểm tra mở khóa.'
                : 'Click "Create First Chapter" to structure modules, upload video lectures and configure chapter unlock tests.'}
            </p>
          </div>
          <button
            type="button"
            onClick={addModule}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Tạo Chương Học Đầu Tiên' : 'Create First Chapter'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {modules.map((mod, modIdx) => (
            <CourseChapterCard
              key={mod.id}
              module={mod}
              moduleIndex={modIdx}
              totalModules={modules.length}
              isExpanded={expandedModules.includes(mod.id)}
              courseFolder={courseFolder}
              isVi={isVi}
              is4Skills={is4Skills}
              onToggleExpand={() => toggleModuleExpand(mod.id)}
              onRemoveModule={() => removeModule(mod.id)}
              onUpdateModule={(updated) => updateModule(mod.id, updated)}
              onMoveModuleUp={() => moveModuleUp(modIdx)}
              onMoveModuleDown={() => moveModuleDown(modIdx)}
              onAddLesson={() => addLesson(mod.id)}
              onRemoveLesson={(lesId) => removeLesson(mod.id, lesId)}
              onMoveLessonUp={(lesIdx) => moveLessonUp(mod.id, lesIdx)}
              onMoveLessonDown={(lesIdx) => moveLessonDown(mod.id, lesIdx)}
              onUpdateLessonField={(lesId, field, val) =>
                updateLessonField(mod.id, lesId, field, val)
              }
              onUpdateLessonFields={(lesId, fields) =>
                updateLessonFields(mod.id, lesId, fields)
              }
              onOpenExcelModal={() =>
                setExcelModalState({
                  isOpen: true,
                  moduleId: mod.id,
                  moduleTitle: mod.title || (isVi ? `Chương ${modIdx + 1}` : `Chapter ${modIdx + 1}`),
                })
              }
              onOpenViewerModal={() => {
                const questionsList =
                  mod.test_questions ||
                  mod.post_mini_questions ||
                  mod.challenge_questions ||
                  []
                setViewerModalState({
                  isOpen: true,
                  moduleId: mod.id,
                  moduleTitle: mod.title || (isVi ? `Chương ${modIdx + 1}` : `Chapter ${modIdx + 1}`),
                  testTitle: `${isVi ? 'Bài Kiểm Tra - ' : 'Assessment - '}${mod.title || (isVi ? `Chương ${modIdx + 1}` : `Chapter ${modIdx + 1}`)}`,
                  questions: questionsList,
                })
              }}
              formatDurationDisplay={formatDurationDisplay}
            />
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={addModule}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold transition-all shadow-2xs cursor-pointer group"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </span>
              <span>{isVi ? `Thêm Chương Học ${modules.length + 1}` : `Add Chapter ${modules.length + 1}`}</span>
            </button>
          </div>
        </div>
      )}

      <ExcelQuizImporterModal
        key={excelModalState.moduleId || 'excel-modal'}
        isOpen={excelModalState.isOpen}
        onClose={() => setExcelModalState((prev) => ({ ...prev, isOpen: false }))}
        onApplyQuestions={(q: QuizQuestionItem[], mode?: 'append' | 'replace', audioUrl?: string) =>
          handleApplyQuestions(excelModalState.moduleId, q, mode, audioUrl)
        }
        moduleTitle={excelModalState.moduleTitle}
        existingQuestionsCount={
          modules.find((m) => m.id === excelModalState.moduleId)?.test_questions?.length || 0
        }
        initialAudioUrl={
          modules.find((m) => m.id === excelModalState.moduleId)?.test_audio_url ||
          modules.find((m) => m.id === excelModalState.moduleId)?.challenge_audio_url ||
          modules.find((m) => m.id === excelModalState.moduleId)?.audio_url ||
          ''
        }
      />

      <ModuleQuestionViewerModal
        key={viewerModalState.moduleId || 'viewer-modal'}
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
