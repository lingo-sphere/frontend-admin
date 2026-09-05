/**
 * @file course.curriculum.manager.tsx
 * @description Quản lý toàn diện chương trình giảng dạy của khóa học với hệ thống phân cấp trực quan, thống kê bài học và điều khiển tổng thể
 */

import { Film, Plus } from 'lucide-react'
import { ExcelQuizImporterModal } from '@/components/admin/excel.quiz.importer.modal'
import { ModuleQuestionViewerModal } from '@/components/admin/module.question.viewer.modal'
import { CourseChapterCard } from './course.chapter.card'
import { CourseCurriculumHeader } from './course.curriculum.header'
import { CourseCurriculumOutline } from './course.curriculum.outline'
import { useCourseCurriculum } from '@/hooks/use.course.curriculum'
import type { CourseModule } from './course.basic.info.tab'
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
  const {
    expandedModules,
    excelModalState,
    setExcelModalState,
    viewerModalState,
    setViewerModalState,
    totalLessons,
    totalMinutes,
    totalTests,
    areAllExpanded,
    toggleExpandAll,
    toggleModuleExpand,
    addModule,
    removeModule,
    updateModule,
    moveModuleUp,
    moveModuleDown,
    addLesson,
    removeLesson,
    moveLessonUp,
    moveLessonDown,
    updateLessonField,
    updateLessonFields,
    formatDurationDisplay,
    handleApplyQuestions,
    scrollToChapter,
  } = useCourseCurriculum({ modules, onChange })

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <CourseCurriculumHeader
        isVi={isVi}
        modulesCount={modules.length}
        totalLessons={totalLessons}
        totalMinutes={totalMinutes}
        totalTests={totalTests}
        areAllExpanded={areAllExpanded}
        onToggleExpandAll={toggleExpandAll}
        onAddModule={addModule}
      />

      <CourseCurriculumOutline
        isVi={isVi}
        modules={modules}
        expandedModules={expandedModules}
        onScrollToChapter={scrollToChapter}
      />

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
                : 'Click "Create First Chapter" to structure modules, upload video lectures and configure chapter tests.'}
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
              <span>
                {isVi
                  ? `Thêm Chương Học ${modules.length + 1}`
                  : `Add Chapter ${modules.length + 1}`}
              </span>
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
