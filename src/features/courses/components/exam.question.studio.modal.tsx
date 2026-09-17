// Modal soan thao ngan hang cau hoi dung chung cho khoa hoc va de thi he thong.

import { useState } from 'react'
import { Save, Plus } from 'lucide-react'
import { useExamQuestionEditor, type ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'
import { ExamQuestionCard } from '@/features/exams/components/exam.question.card'
import { ExamZipDropzone } from '@/features/exams/components/exam.zip.dropzone'
import { ExamEditorHeader } from '@/features/courses/components/exam.editor.header'
import { ExamEditorGlobalAudio } from '@/features/courses/components/exam.editor.global.audio'
import { downloadSampleZip } from '@/features/exams/helpers/zip.exam.helper'
import { ConfirmModal } from '@/components/confirm.modal'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'

export interface ExamQuestionStudioModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  is4Skills?: boolean
  isLessonMode?: boolean
  isVi: boolean
  initialQuestions?: ExamQuestionItem[]
  initialGlobalAudioUrl?: string
  onSave: (
    questions: ExamQuestionItem[],
    globalAudioUrl: string,
    meta?: {
      title?: string
      duration_minutes?: number
      passing_score?: number
      description?: string
    }
  ) => Promise<void> | void
}

export function ExamQuestionStudioModal({
  isOpen,
  onClose,
  title,
  subtitle,
  is4Skills = false,
  isLessonMode = false,
  isVi,
  initialQuestions = [],
  initialGlobalAudioUrl = '',
  onSave,
}: ExamQuestionStudioModalProps) {
  const syntheticExam: ToeicExamItem = {
    _id: 'studio_modal_temp',
    title,
    course_title: subtitle,
    type: 'DIAGNOSTIC_TEST',
    is_system_placement: false,
    skills_enabled: is4Skills ? 'ALL' : 'LR',
    duration_minutes: 60,
    passing_score: 70,
    is_published: false,
    questions: initialQuestions,
    audio_url: initialGlobalAudioUrl,
    total_questions: initialQuestions.length,
  }

  const {
    questions,
    globalAudioUrl,
    searchQuery,
    setSearchQuery,
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
    handleRemoveGlobalAudio,
    handleDuplicateQuestion,
    handleDeleteQuestion,
    handleUpdateQuestion,
    handleOptionChange,
    handleUploadQuestionAudio,
    handleUploadQuestionImage,
    handleZipFileSelected,
    handleSaveQuestions,
    cleanupSessionMedia,
    isDirty,
  } = useExamQuestionEditor({
    isOpen,
    exam: null,
    is4Skills,
    isLessonMode,
    initialQuestions,
    initialGlobalAudioUrl,
    isVi,
    onSave,
    onClose,
  })

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  if (!isOpen) return null

  const handleSafeClose = async () => {
    await cleanupSessionMedia()
    onClose()
  }

  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true)
    } else {
      handleSafeClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-6xl max-h-[94vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <ExamEditorHeader
          exam={syntheticExam}
          isVi={isVi}
          is4Skills={is4Skills}
          isSystemPlacement={false}
          isLessonMode={isLessonMode}
          questionsCount={questions.length}
          searchQuery={searchQuery}
          uploadingGlobalAudio={uploadingGlobalAudio}
          globalAudioUrl={globalAudioUrl}
          onClose={handleRequestClose}
          onSearchChange={setSearchQuery}
          onOpenGlobalAudioPicker={() => globalAudioInputRef.current?.click()}
          onAddQuestion={handleAddQuestion}
        />

        {!isLessonMode && (
          <ExamEditorGlobalAudio
            globalAudioUrl={globalAudioUrl}
            isVi={isVi}
            onRemove={handleRemoveGlobalAudio}
          />
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[350px]">
          {questions.length === 0 || isProcessingZip ? (
            <ExamZipDropzone
              isVi={isVi}
              is4Skills={is4Skills}
              isLessonMode={isLessonMode}
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
                const droppedFile = e.dataTransfer.files?.[0]
                if (droppedFile) {
                  handleZipFileSelected(droppedFile)
                }
              }}
              onOpenZipPicker={() => zipFileInputRef.current?.click()}
              onDownloadSampleZip={() => downloadSampleZip(isVi, is4Skills, isLessonMode)}
            />
          ) : (
            <>
              {filteredQuestions.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {isVi
                    ? 'Không tìm thấy câu hỏi phù hợp với từ khóa.'
                    : 'No questions match search filter.'}
                </div>
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
                      skillsMode={is4Skills ? '4SKILLS' : '2SKILLS'}
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

              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => handleAddQuestion(is4Skills ? 'SPEAKING' : 'READING')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isVi ? 'Thêm câu hỏi mới' : 'Add New Question'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {questions.length} {isVi ? 'câu hỏi trong ngân hàng' : 'questions in bank'}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isVi ? 'Hủy Bỏ' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSaveQuestions}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? isVi
                    ? 'Đang lưu...'
                    : 'Saving...'
                  : isVi
                  ? 'Áp Dụng Câu Hỏi'
                  : 'Apply Questions'}
              </span>
            </button>
          </div>
        </div>

        <input
          ref={zipFileInputRef}
          type="file"
          accept=".zip,.rar,.xlsx,.xls,.csv,application/zip,application/x-rar-compressed,application/vnd.rar,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleZipFileSelected(f)
          }}
          onClick={(e) => {
            ;(e.target as HTMLInputElement).value = ''
          }}
          className="hidden"
        />

        <input
          ref={globalAudioInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a"
          onChange={handleUploadGlobalAudio}
          onClick={(e) => {
            ;(e.target as HTMLInputElement).value = ''
          }}
          className="hidden"
        />

        <input
          ref={questionAudioInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a"
          onChange={handleUploadQuestionAudio}
          onClick={(e) => {
            ;(e.target as HTMLInputElement).value = ''
          }}
          className="hidden"
        />

        <input
          ref={questionImageInputRef}
          type="file"
          accept="image/*,.png,.jpg,.jpeg,.webp"
          onChange={handleUploadQuestionImage}
          onClick={(e) => {
            ;(e.target as HTMLInputElement).value = ''
          }}
          className="hidden"
        />
      </div>

      <ConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false)
          handleSafeClose()
        }}
        variant="warning"
        icon="warning"
        title={isVi ? 'Cảnh báo dữ liệu chưa được lưu' : 'Unsaved Questions Warning'}
        message={
          isVi
            ? 'Bạn có chắc chắn muốn đóng cửa sổ? Dữ liệu câu hỏi đang biên soạn sẽ không được lưu và bị mất.'
            : 'Are you sure you want to close? All unsaved questions and media will be discarded.'
        }
        confirmText={isVi ? 'Đồng ý đóng & hủy' : 'Discard & Close'}
        cancelText={isVi ? 'Ở lại tiếp tục' : 'Stay'}
      />
    </div>
  )
}
