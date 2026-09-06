/**
 * @file course.exam.questions.page.tsx
 * @description Trang quản lý và biên soạn ngân hàng câu hỏi đề thi khóa học toàn diện
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, ChevronRight, Loader2, Plus } from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'
import { courseService } from '@/services/course.service'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast.store'
import { downloadSampleZip } from '@/components/exams/zip.exam.helper'
import { ExamQuestionCard } from '@/components/exams/exam.question.card'
import { ExamZipDropzone } from '@/components/exams/exam.zip.dropzone'
import { ExamEditorHeader } from '@/components/exams/editor/exam.editor.header'
import { ExamEditorFooter } from '@/components/exams/editor/exam.editor.footer'
import { ExamEditorGlobalAudio } from '@/components/exams/editor/exam.editor.global.audio'
import { useExamQuestionEditor } from '@/hooks/use.exam.question.editor'
import type { Course } from '@/types/api.types'

interface CourseExamQuestionsPageProps {
  examId: string
}

interface CourseExamQuestionsEditorProps {
  exam: ToeicExamItem
  isVi: boolean
  onBack: () => void
  onExamUpdated: (updated: ToeicExamItem) => void
}

function CourseExamQuestionsEditor({
  exam,
  isVi,
  onBack,
  onExamUpdated,
}: CourseExamQuestionsEditorProps) {
  const is4Skills = exam.placement_type === '4SKILLS' || exam.skills_enabled === 'ALL'
  const isSystemPlacement = Boolean(
    exam.is_system_placement || exam.type === 'DIAGNOSTIC_TEST' || !exam.course_id
  )

  const {
    questions,
    globalAudioUrl,
    setGlobalAudioUrl,
    searchQuery,
    setSearchQuery,
    partFilter,
    setPartFilter,
    isProcessingZip,
    zipProcessStatus,
    zipProgress,
    isDragOverZip,
    setIsDragOverZip,
    isSaving,
    uploadingGlobalAudio,
    uploadingQuestionAudioIdx,
    uploadingQuestionImageIdx,
    zipFileInputRef,
    globalAudioInputRef,
    questionAudioInputRef,
    questionImageInputRef,
    activeQuestionIdxRef,
    filteredQuestions,
    handleAddQuestion,
    handleUploadGlobalAudio,
    handleDuplicateQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
    handleOptionChange,
    handleUploadQuestionAudio,
    handleUploadQuestionImage,
    handleZipFileSelected,
    handleSaveQuestions,
  } = useExamQuestionEditor({
    isOpen: true,
    exam,
    isVi,
    onExamUpdated,
    onClose: onBack,
  })

  return (
    <div className="space-y-4 w-full pb-16 animate-in fade-in duration-200">
      <input
        ref={zipFileInputRef}
        type="file"
        accept=".zip,application/zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleZipFileSelected(file)
        }}
      />
      <input
        ref={globalAudioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleUploadGlobalAudio}
      />
      <input
        ref={questionAudioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleUploadQuestionAudio}
      />
      <input
        ref={questionImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadQuestionImage}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isVi ? 'Bài thi khóa học' : 'Course Exams'}</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs sm:max-w-md">
            {exam.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {isVi ? 'Mã đề:' : 'ID:'} {exam._id || exam.id}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <ExamEditorHeader
          exam={exam}
          isVi={isVi}
          is4Skills={is4Skills}
          isSystemPlacement={isSystemPlacement}
          questionsCount={questions.length}
          searchQuery={searchQuery}
          partFilter={partFilter}
          isProcessingZip={isProcessingZip}
          uploadingGlobalAudio={uploadingGlobalAudio}
          globalAudioUrl={globalAudioUrl}
          onClose={onBack}
          onSearchChange={setSearchQuery}
          onPartFilterChange={setPartFilter}
          onDownloadSampleZip={() => downloadSampleZip(isVi)}
          onOpenZipPicker={() => zipFileInputRef.current?.click()}
          onOpenGlobalAudioPicker={() => globalAudioInputRef.current?.click()}
          onAddQuestion={handleAddQuestion}
        />

        <ExamEditorGlobalAudio
          globalAudioUrl={globalAudioUrl}
          isVi={isVi}
          onRemove={() => setGlobalAudioUrl('')}
        />

        <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[400px]">
          {questions.length === 0 ? (
            isSystemPlacement || isProcessingZip ? (
              <ExamZipDropzone
                isVi={isVi}
                isProcessingZip={isProcessingZip}
                zipProcessStatus={zipProcessStatus}
                zipProgress={zipProgress}
                isDragOverZip={isDragOverZip}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOverZip(true)
                }}
                onDragLeave={() => setIsDragOverZip(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOverZip(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleZipFileSelected(file)
                }}
                onOpenZipPicker={() => zipFileInputRef.current?.click()}
                onDownloadSampleZip={() => downloadSampleZip(isVi)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1.5">
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {isVi
                      ? 'Đề thi hiện chưa có câu hỏi nào'
                      : 'No questions in this exam yet'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isVi
                      ? 'Nhấn nút "Thêm câu hỏi" để bắt đầu soạn câu hỏi cho bài thi này.'
                      : 'Click "Add Question" to start crafting questions for this exam.'}
                  </p>
                </div>
                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddQuestion(
                        partFilter !== 'ALL' && !isNaN(Number(partFilter))
                          ? Number(partFilter)
                          : 5
                      )
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-indigo-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isVi ? 'Thêm câu hỏi đầu tiên' : 'Add First Question'}</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            filteredQuestions.map((q, filteredIdx) => {
              const actualIdx = questions.findIndex((item) => item.id === q.id)
              const qIndex = actualIdx !== -1 ? actualIdx : filteredIdx

              return (
                <ExamQuestionCard
                  key={q.id || qIndex}
                  question={q}
                  index={qIndex}
                  isVi={isVi}
                  isUploadingAudio={uploadingQuestionAudioIdx === qIndex}
                  isUploadingImage={uploadingQuestionImageIdx === qIndex}
                  onUpdate={(updates) => handleUpdateQuestion(qIndex, updates)}
                  onOptionChange={(optIdx, val) => handleOptionChange(qIndex, optIdx, val)}
                  onDuplicate={() => handleDuplicateQuestion(qIndex)}
                  onDelete={() => handleDeleteQuestion(qIndex)}
                  onRequestUploadAudio={() => {
                    activeQuestionIdxRef.current = qIndex
                    questionAudioInputRef.current?.click()
                  }}
                  onRequestUploadImage={() => {
                    activeQuestionIdxRef.current = qIndex
                    questionImageInputRef.current?.click()
                  }}
                />
              )
            })
          )}
        </div>

        <div className="sticky bottom-0 z-20 shadow-lg">
          <ExamEditorFooter
            questionsCount={questions.length}
            isVi={isVi}
            isSaving={isSaving}
            onClose={onBack}
            onSave={handleSaveQuestions}
          />
        </div>
      </div>
    </div>
  )
}

export function CourseExamQuestionsPage({ examId }: CourseExamQuestionsPageProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)

  const [exam, setExam] = useState<ToeicExamItem | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const loadExam = async () => {
      try {
        const cachedStr = sessionStorage.getItem('lingo_admin_active_exam')
        if (cachedStr) {
          const cached = JSON.parse(cachedStr) as ToeicExamItem
          if (cached && (cached._id === examId || cached.id === examId) && cached.title) {
            if (isMounted) {
              setExam(cached)
              setIsLoading(false)
            }
            return
          }
        }

        if (examId.startsWith('course_final_')) {
          const courseId = examId.replace('course_final_', '')
          const rawRes = await courseService.getCourseById(courseId)
          const rawCourse = ((rawRes as { course?: Course }).course || rawRes) as Course
          if (rawCourse && isMounted) {
            const courseExam: ToeicExamItem = {
              id: rawCourse.final_test_exam_id || examId,
              _id: rawCourse.final_test_exam_id || examId,
              title: `Bài Thi Tốt Nghiệp: ${rawCourse.title}`,
              course_id: rawCourse._id,
              course_title: rawCourse.title,
              type: 'FULL_TEST',
              total_questions: rawCourse.final_test_questions?.length || 0,
              duration_minutes: 60,
              passing_score: rawCourse.final_test_passing_score || 70,
              is_published: rawCourse.is_published ?? true,
              questions: rawCourse.final_test_questions || [],
              audio_url: rawCourse.final_test_audio_url || '',
              author_id: rawCourse.author_id,
            }
            setExam(courseExam)
            sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(courseExam))
          }
        } else if (examId.startsWith('mod_challenge_')) {
          const modId = examId.replace('mod_challenge_', '')
          const coursesRes = await courseService.getAllCourses({ pageSize: 100 })
          const coursesList = coursesRes.result || []
          let found = false
          for (const c of coursesList) {
            try {
              const modulesList = await courseService.getModules(c._id)
              const foundMod = modulesList.find((m) => (m._id || m.id) === modId)
              if (foundMod && isMounted) {
                const qList =
                  foundMod.challenge_questions && foundMod.challenge_questions.length > 0
                    ? foundMod.challenge_questions
                    : foundMod.post_mini_questions && foundMod.post_mini_questions.length > 0
                    ? foundMod.post_mini_questions
                    : []
                const challengeExam: ToeicExamItem = {
                  id: examId,
                  _id: examId,
                  title: `Challenge Test: ${foundMod.title}`,
                  course_id: c._id,
                  course_title: c.title,
                  module_id: foundMod._id || foundMod.id,
                  module_title: foundMod.title,
                  type: 'CHALLENGE_TEST',
                  total_questions: qList.length,
                  duration_minutes: foundMod.challenge_duration_minutes || foundMod.post_mini_duration_minutes || 15,
                  passing_score: foundMod.challenge_passing_score || foundMod.post_mini_passing_score || 80,
                  is_published: true,
                  questions: qList,
                  audio_url: foundMod.challenge_audio_url || foundMod.test_audio_url || foundMod.audio_url || '',
                  author_id: c.author_id,
                }
                setExam(challengeExam)
                sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(challengeExam))
                found = true
                break
              }
            } catch {}
          }
          if (!found && isMounted) {
            toast.error(isVi ? 'Không tìm thấy bài thi chương học.' : 'Module exam not found.')
          }
        } else {
          const apiExams = await examAdminService.getExams().catch(() => [])
          const match = apiExams.find((e) => (e._id || e.id) === examId)
          if (match && isMounted) {
            setExam(match)
            sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(match))
          } else if (isMounted) {
            toast.error(isVi ? 'Không tìm thấy bài thi chỉ định.' : 'Exam not found.')
          }
        }
      } catch {
        if (isMounted) {
          toast.error(isVi ? 'Lỗi khi tải thông tin bài thi.' : 'Failed to load exam.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadExam()

    return () => {
      isMounted = false
    }
  }, [examId, isVi])

  const handleBack = () => {
    setActiveNavItem('course-exams')
  }

  const handleExamUpdated = async (updated: ToeicExamItem) => {
    setExam(updated)
    sessionStorage.setItem('lingo_admin_active_exam', JSON.stringify(updated))
    try {
      if (updated.course_id && String(examId).startsWith('course_final_')) {
        await courseService.updateCourse(updated.course_id, {
          final_test_questions: updated.questions,
          ...(updated.audio_url ? { final_test_audio_url: updated.audio_url } : {}),
        })
      } else if (updated.module_id || String(examId).startsWith('mod_challenge_')) {
        const modId = updated.module_id || String(examId).replace('mod_challenge_', '')
        await courseService.updateModule(modId, {
          challenge_questions: updated.questions,
          post_mini_questions: updated.questions,
          ...(updated.audio_url
            ? {
                challenge_audio_url: updated.audio_url,
                test_audio_url: updated.audio_url,
              }
            : {}),
        })
      }
    } catch (syncErr) {
      console.warn('Lỗi đồng bộ câu hỏi vào khóa học/chương học:', syncErr)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isVi ? 'Đang nạp dữ liệu câu hỏi đề thi...' : 'Loading exam questions...'}
        </p>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isVi ? 'Không tìm thấy thông tin bài thi' : 'Exam not found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isVi
              ? 'Bài thi không tồn tại hoặc đã bị xóa khỏi hệ thống.'
              : 'The requested exam does not exist or has been deleted.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isVi ? 'Quay lại danh sách bài thi' : 'Back to Exams'}</span>
        </button>
      </div>
    )
  }

  return (
    <CourseExamQuestionsEditor
      exam={exam}
      isVi={isVi}
      onBack={handleBack}
      onExamUpdated={handleExamUpdated}
    />
  )
}
