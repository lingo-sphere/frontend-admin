/**
 * @file CourseCurriculumManager.tsx
 * @description Quản lý toàn diện chương trình giảng dạy của khóa học (danh sách chương học, bài học video và bài test đánh giá)
 */

import { useState } from 'react'
import {
  Video,
  Plus,
  Film,
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
    mode: 'append' | 'replace' = 'append'
  ) => {
    const targetModule = modules.find((m) => m.id === moduleId)
    const existing = targetModule?.test_questions || []
    const updated = mode === 'append' ? [...existing, ...questions] : questions

    updateModule(moduleId, {
      test_questions: updated,
      challenge_questions: updated,
      post_mini_questions: updated,
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
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
            ? 'Soạn video bài giảng và tạo bài test kiểm tra cuối chương từ file Excel để đánh giá và mở khóa chương tiếp theo.'
            : 'Add lesson videos and upload chapter assessment tests from Excel.'}
        </p>
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
          {modules.map((mod, modIdx) => (
            <CourseChapterCard
              key={mod.id}
              module={mod}
              moduleIndex={modIdx}
              isExpanded={expandedModules.includes(mod.id)}
              courseFolder={courseFolder}
              isVi={isVi}
              onToggleExpand={() => toggleModuleExpand(mod.id)}
              onRemoveModule={() => removeModule(mod.id)}
              onUpdateModule={(updated) => updateModule(mod.id, updated)}
              onAddLesson={() => addLesson(mod.id)}
              onRemoveLesson={(lesId) => removeLesson(mod.id, lesId)}
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/40 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isVi ? 'Thêm Chương Học Mới' : 'Add New Chapter'}</span>
            </button>
          </div>
        </div>
      )}

      <ExcelQuizImporterModal
        key={excelModalState.moduleId || 'excel-modal'}
        isOpen={excelModalState.isOpen}
        onClose={() => setExcelModalState((prev) => ({ ...prev, isOpen: false }))}
        onApplyQuestions={(q: QuizQuestionItem[], mode?: 'append' | 'replace') =>
          handleApplyQuestions(excelModalState.moduleId, q, mode)
        }
        moduleTitle={excelModalState.moduleTitle}
        existingQuestionsCount={
          modules.find((m) => m.id === excelModalState.moduleId)?.test_questions?.length || 0
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
