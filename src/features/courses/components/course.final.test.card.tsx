// Thẻ quản lý đề thi tốt nghiệp khóa học.

import { useState } from 'react'
import {
  FileSpreadsheet,
  Eye,
  Award,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { ExamQuestionStudioModal } from '@/features/courses/components/exam.question.studio.modal'
import type { CourseFormData } from '@/features/courses/components/course.basic.info.tab'
import { CourseFinalTestSkillsSection } from '@/features/courses/components/course.final.test.skills.section'
import type { ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'

interface CourseFinalTestCardProps {
  formData: CourseFormData
  onChange: (updated: Partial<CourseFormData>) => void
  isVi: boolean
}

export function CourseFinalTestCard({ formData, onChange, isVi }: CourseFinalTestCardProps) {
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false)

  const finalQuestionsCount = formData.final_test_questions?.length || 0

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 ring-1 ring-indigo-500/30">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isVi ? '2. Bài kiểm tra Tốt nghiệp Khóa học (Final Test)' : '2. Course Final Test (Graduation Test)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isVi
                ? 'Nạp đề thi tốt nghiệp từ file ZIP (bao gồm toàn bộ câu hỏi, audio và hình ảnh), đồng thời biên soạn trực quan.'
                : 'Upload graduation exam from ZIP archive (including questions, audio, and images), with visual realtime editing.'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>{isVi ? 'Ngân hàng câu hỏi Final Test' : 'Question Bank'}</span>
            </span>
            {finalQuestionsCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300/80 dark:border-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{finalQuestionsCount} {isVi ? 'câu hỏi' : 'questions'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-semibold border border-amber-300/80 dark:border-amber-700">
                <HelpCircle className="w-3 h-3 text-amber-600" />
                <span>{isVi ? 'Chưa có câu hỏi' : 'Empty'}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {isVi
              ? 'Hỗ trợ nạp gói ZIP đề thi (bao gồm file câu hỏi Excel và toàn bộ file nghe audio, hình ảnh), đồng thời xem và chỉnh sửa trực tiếp từng câu hỏi.'
              : 'Upload ZIP archive (including question spreadsheet and audio/image media), with realtime visual editing.'}
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setIsStudioModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {finalQuestionsCount > 0 ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isVi
                    ? `Chỉnh Sửa Ngân Hàng Câu Hỏi (${finalQuestionsCount} câu)`
                    : `Edit Question Bank (${finalQuestionsCount} qs)`}
                </span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>
                  {isVi ? 'Soạn Đề Thi / Nạp ZIP' : 'Create Exam / Import ZIP'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {formData.category === 'TOEIC_4_SKILLS' && (
        <CourseFinalTestSkillsSection
          formData={formData}
          onChange={onChange}
        />
      )}

      {isStudioModalOpen && (
        <ExamQuestionStudioModal
          isOpen={isStudioModalOpen}
          onClose={() => setIsStudioModalOpen(false)}
          title={`${isVi ? 'Soạn Đề Thi Tốt Nghiệp Final Test - ' : 'Final Test Exam Editor - '}${formData.title || 'Khóa học'}`}
          subtitle={isVi ? 'Đề thi tốt nghiệp đánh giá toàn diện năng lực' : 'Comprehensive graduation exam'}
          is4Skills={formData.category === 'TOEIC_4_SKILLS'}
          isVi={isVi}
          initialQuestions={(formData.final_test_questions || []) as ExamQuestionItem[]}
          initialGlobalAudioUrl={formData.final_test_audio_url || ''}
          onSave={(q, audioUrl) => {
            onChange({
              final_test_questions: q,
              final_test_audio_url: audioUrl || '',
            })
          }}
        />
      )}
    </div>
  )
}
