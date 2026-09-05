/**
 * @file exam.question.editor.modal.tsx
 * @description Modal biên soạn và quản lý ngân hàng câu hỏi đề thi (hỗ trợ nhập thủ công, audio/hình ảnh, import gói ZIP)
 */

import { useTranslation } from 'react-i18next'
import { BookOpen, Plus } from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'
import { downloadSampleZip } from '@/components/exams/zip.exam.helper'
import { ExamQuestionCard } from '@/components/exams/exam.question.card'
import { ExamZipDropzone } from '@/components/exams/exam.zip.dropzone'
import { ExamEditorHeader } from './editor/exam.editor.header'
import { ExamEditorFooter } from './editor/exam.editor.footer'
import { ExamEditorGlobalAudio } from './editor/exam.editor.global.audio'
import {
  useExamQuestionEditor,
  type ExamQuestionItem,
} from '@/hooks/use.exam.question.editor'

export type { ExamQuestionItem }

interface ExamQuestionEditorModalProps {
  isOpen: boolean
  onClose: () => void
  exam: ToeicExamItem | null
  onExamUpdated: (updatedExam: ToeicExamItem) => void
}

export function ExamQuestionEditorModal({
  isOpen,
  onClose,
  exam,
  onExamUpdated,
}: ExamQuestionEditorModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

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
    isOpen,
    exam,
    isVi,
    onExamUpdated,
    onClose,
  })

  if (!isOpen || !exam) return null

  const is4Skills = exam.placement_type === '4SKILLS' || exam.skills_enabled === 'ALL'
  const isSystemPlacement = Boolean(
    exam.is_system_placement || exam.type === 'DIAGNOSTIC_TEST' || !exam.course_id
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-5xl max-h-[94vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
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
          onClose={onClose}
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

        <div
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isVi
                      ? 'Đề thi khóa học hiện chưa có câu hỏi nào'
                      : 'No questions in this course exam yet'}
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

        <ExamEditorFooter
          questionsCount={questions.length}
          isVi={isVi}
          isSaving={isSaving}
          onClose={onClose}
          onSave={handleSaveQuestions}
        />
      </div>
    </div>
  )
}
