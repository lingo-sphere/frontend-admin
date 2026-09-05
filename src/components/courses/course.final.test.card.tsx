/**
 * @file course.final.test.card.tsx
 * @description Course graduation final test card managing questions, Excel import, audio, and Speaking/Writing prompts
 */

import { useState } from 'react'
import {
  FileSpreadsheet,
  Eye,
  Award,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { ExcelQuizImporterModal } from '@/components/admin/excel.quiz.importer.modal'
import { ModuleQuestionViewerModal } from '@/components/admin/module.question.viewer.modal'
import type { CourseFormData } from './course.basic.info.tab'
import { CourseFinalTestAudio } from './course.final.test.audio'
import { CourseFinalTestSkillsSection } from './course.final.test.skills.section'

interface CourseFinalTestCardProps {
  formData: CourseFormData
  onChange: (updated: Partial<CourseFormData>) => void
  isVi: boolean
}

export function CourseFinalTestCard({ formData, onChange, isVi }: CourseFinalTestCardProps) {
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false)
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false)

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
                ? 'Upload đề thi tốt nghiệp cuối khóa từ file Excel (.xlsx).'
                : 'Upload graduation final exam from Excel file (.xlsx).'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/90 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{isVi ? 'Ngân hàng câu hỏi Final Test' : 'Question Bank'}</span>
              </span>
              {finalQuestionsCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300/80 dark:border-emerald-700">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{finalQuestionsCount} {isVi ? 'câu hỏi' : 'questions'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[11px] font-semibold border border-amber-300/80 dark:border-amber-700">
                  <HelpCircle className="w-3 h-3 text-amber-600" />
                  <span>{isVi ? 'Chưa có câu hỏi' : 'Empty'}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isVi
                ? 'Tải file Excel để nạp tự động hàng loạt câu hỏi cho đề thi tốt nghiệp cuối khóa.'
                : 'Upload Excel file to bulk import graduation test questions.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Upload File Excel (.xlsx)</span>
            </button>

            {finalQuestionsCount > 0 && (
              <button
                type="button"
                onClick={() => setIsViewerModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isVi ? 'Xem & Sửa' : 'View/Edit'}</span>
              </button>
            )}
          </div>
        </div>

        <CourseFinalTestAudio
          formData={formData}
          onChange={onChange}
          isVi={isVi}
        />
      </div>

      {formData.category === 'TOEIC_4_SKILLS' && (
        <CourseFinalTestSkillsSection
          formData={formData}
          onChange={onChange}
        />
      )}

      <ExcelQuizImporterModal
        key="final-test-excel-modal"
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onApplyQuestions={(q, mode = 'append', audioUrl?: string) => {
          const existing = formData.final_test_questions || []
          const combined = mode === 'append' ? [...existing, ...q] : q
          onChange({
            final_test_questions: combined,
            ...(audioUrl !== undefined ? { final_test_audio_url: audioUrl } : {}),
          })
        }}
        initialAudioUrl={formData.final_test_audio_url}
        moduleTitle={`Final Test Khóa Học: ${formData.title || 'Khóa học'}`}
        existingQuestionsCount={formData.final_test_questions?.length || 0}
      />

      <ModuleQuestionViewerModal
        key="final-test-viewer-modal"
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        questions={formData.final_test_questions || []}
        onSaveQuestions={(q) => onChange({ final_test_questions: q })}
        moduleTitle={formData.title || 'Khóa học'}
        testTitle={`Bài Kiểm Tra Tốt Nghiệp Final Test`}
      />
    </div>
  )
}
