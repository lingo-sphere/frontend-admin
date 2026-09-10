// Component danh sách câu hỏi đề thi và vùng kéo thả import zip tài liệu
import { BookOpen, Plus } from 'lucide-react'
import { ExamQuestionCard } from '@/features/exams/components/exam.question.card'
import { ExamZipDropzone } from '@/features/exams/components/exam.zip.dropzone'
import { EmptyState } from '@/components/empty.state'
import type { ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'

export interface CourseExamQuestionsListProps {
  questions: ExamQuestionItem[]
  filteredQuestions: ExamQuestionItem[]
  isVi: boolean
  is4Skills: boolean
  isSystemPlacement: boolean
  isProcessingZip: boolean
  zipProcessStatus: string
  zipProgress: { current: number; total: number } | null
  isDragOverZip: boolean
  formPlacementSkills: '2SKILLS' | '4SKILLS'
  uploadingQuestionAudioIdx: number | null
  uploadingQuestionImageIdx: number | null
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onOpenZipPicker: () => void
  onDownloadSampleZip: () => void
  onAddQuestion: (skill?: 'READING' | 'LISTENING' | 'SPEAKING' | 'WRITING') => void
  onUpdateQuestion: (index: number, updates: Partial<ExamQuestionItem>) => void
  onOptionChange: (qIndex: number, optIdx: number, val: string) => void
  onDuplicateQuestion: (index: number) => void
  onDeleteQuestion: (index: number) => void
  onRequestUploadAudio: (index: number) => void
  onRequestUploadImage: (index: number) => void
}

export function CourseExamQuestionsList({
  questions,
  filteredQuestions,
  isVi,
  is4Skills,
  isSystemPlacement,
  isProcessingZip,
  zipProcessStatus,
  zipProgress,
  isDragOverZip,
  formPlacementSkills,
  uploadingQuestionAudioIdx,
  uploadingQuestionImageIdx,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenZipPicker,
  onDownloadSampleZip,
  onAddQuestion,
  onUpdateQuestion,
  onOptionChange,
  onDuplicateQuestion,
  onDeleteQuestion,
  onRequestUploadAudio,
  onRequestUploadImage,
}: CourseExamQuestionsListProps) {
  if (questions.length === 0) {
    if (isSystemPlacement || isProcessingZip) {
      return (
        <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[400px]">
          <ExamZipDropzone
            isVi={isVi}
            is4Skills={is4Skills}
            isProcessingZip={isProcessingZip}
            zipProcessStatus={zipProcessStatus}
            zipProgress={zipProgress}
            isDragOverZip={isDragOverZip}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onOpenZipPicker={onOpenZipPicker}
            onDownloadSampleZip={onDownloadSampleZip}
          />
        </div>
      )
    }

    return (
      <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[400px]">
        <EmptyState
          icon={BookOpen}
          title={isVi ? 'Đề thi hiện chưa có câu hỏi nào' : 'No questions in this exam yet'}
          description={
            isVi
              ? 'Nhấn nút "Thêm câu hỏi" để bắt đầu soạn câu hỏi cho bài thi này.'
              : 'Click "Add Question" to start crafting questions for this exam.'
          }
          action={
            <button
              type="button"
              onClick={() => onAddQuestion('READING')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isVi ? 'Thêm câu hỏi đầu tiên' : 'Add First Question'}</span>
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[400px]">
      {filteredQuestions.map((q, filteredIdx) => {
        const actualIdx = questions.findIndex((item) => item.id === q.id)
        const qIndex = actualIdx !== -1 ? actualIdx : filteredIdx

        return (
          <ExamQuestionCard
            key={q.id || qIndex}
            question={q}
            index={qIndex}
            isVi={isVi}
            skillsMode={formPlacementSkills}
            isUploadingAudio={uploadingQuestionAudioIdx === qIndex}
            isUploadingImage={uploadingQuestionImageIdx === qIndex}
            onUpdate={(updates) => onUpdateQuestion(qIndex, updates)}
            onOptionChange={(optIdx, val) => onOptionChange(qIndex, optIdx, val)}
            onDuplicate={() => onDuplicateQuestion(qIndex)}
            onDelete={() => onDeleteQuestion(qIndex)}
            onRequestUploadAudio={() => onRequestUploadAudio(qIndex)}
            onRequestUploadImage={() => onRequestUploadImage(qIndex)}
          />
        )
      })}
    </div>
  )
}
