/**
 * @file course.exam.form.fields.tsx
 * @description Form input fields for course exam creation and editing
 */

import { Sparkles, Lock } from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'
import type { CourseSelectItem } from './course.exam.header.actions'
import { CourseExamPlacementSection } from './course.exam.placement.section'

interface CourseExamFormFieldsProps {
  editingExam: ToeicExamItem | null
  formCourseId: string
  onFormCourseChange: (val: string) => void
  courses: CourseSelectItem[]
  formTitle: string
  onFormTitleChange: (val: string) => void
  isSystemPlacement: boolean
  formPlacementSkills: '2SKILLS' | '4SKILLS'
  onPlacementSkillsChange: (skills: '2SKILLS' | '4SKILLS') => void
  currentActiveConflict?: ToeicExamItem
  published2SkillsExam?: ToeicExamItem
  published4SkillsExam?: ToeicExamItem
  formType: string
  onFormTypeChange: (val: string) => void
  formDuration: number
  onFormDurationChange: (val: number) => void
  formPassingScore: number
  onFormPassingScoreChange: (val: number) => void
  formDescription: string
  onFormDescriptionChange: (val: string) => void
  formIsPublished: boolean
  onFormIsPublishedChange: (val: boolean) => void
  onConflictBlocked: () => void
  isVi: boolean
}

export function CourseExamFormFields({
  editingExam,
  formCourseId,
  onFormCourseChange,
  courses,
  formTitle,
  onFormTitleChange,
  isSystemPlacement,
  formPlacementSkills,
  onPlacementSkillsChange,
  currentActiveConflict,
  published2SkillsExam,
  published4SkillsExam,
  formType,
  onFormTypeChange,
  formDuration,
  onFormDurationChange,
  formPassingScore,
  onFormPassingScoreChange,
  formDescription,
  onFormDescriptionChange,
  formIsPublished,
  onFormIsPublishedChange,
  onConflictBlocked,
  isVi,
}: CourseExamFormFieldsProps) {
  return (
    <div
      className="space-y-3 overflow-y-auto pr-0.5 flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {!editingExam || formCourseId === 'GLOBAL_SYSTEM_PLACEMENT' ? (
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isVi ? 'Phạm vi áp dụng bài thi:' : 'Applied Scope:'}
          </label>
          <div className="flex items-center justify-between px-3 py-1.5 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 rounded-xl text-xs font-bold text-violet-800 dark:text-violet-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse shrink-0"></span>
              <span className="truncate">🌐 [TOÀN HỆ THỐNG] - Bài thi đầu vào phân loại trình độ (Placement Test)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700 shrink-0">
              {isVi ? 'Đề thi tổng hợp' : 'System Wide'}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-1">
            {isVi
              ? '* Lưu ý: Bài kiểm tra riêng theo từng khóa học (Challenge, Final Test) được tạo trực tiếp tại giao diện Quản lý khóa học.'
              : '* Note: Course-specific exams (Challenge, Final Test) are created in the Course Management interface.'}
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            {isVi ? 'Khóa học áp dụng:' : 'Applied Course:'}
          </label>
          <select
            value={formCourseId}
            onChange={(e) => onFormCourseChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isVi ? 'Tiêu đề bài thi:' : 'Exam Title:'}
        </label>
        <input
          type="text"
          value={formTitle}
          onChange={(e) => onFormTitleChange(e.target.value)}
          placeholder={
            isSystemPlacement
              ? isVi
                ? 'Ví dụ: Bài Test Đầu Vào Hệ Thống - TOEIC 2 Kỹ Năng (LR Baseline)...'
                : 'e.g. System Placement Test - TOEIC 2 Skills...'
              : isVi
              ? 'Ví dụ: Challenge Test: Kiểm tra cột mốc Chương 1...'
              : 'e.g. Challenge Test: Chapter 1 Milestone...'
          }
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
        />
      </div>

      {isSystemPlacement ? (
        <CourseExamPlacementSection
          formPlacementSkills={formPlacementSkills}
          onChangeSkills={onPlacementSkillsChange}
          currentActiveConflict={currentActiveConflict}
          published2SkillsExam={published2SkillsExam}
          published4SkillsExam={published4SkillsExam}
          isVi={isVi}
        />
      ) : (
        <div className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Loại bài kiểm tra:' : 'Exam Type:'}
            </label>
            <select
              value={formType}
              onChange={(e) => onFormTypeChange(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="CHALLENGE_TEST">
                {isVi ? 'Bài Test Thử Thách Chương (Challenge)' : 'Chapter Challenge Test'}
              </option>
              <option value="FULL_TEST">
                {isVi ? 'Bài Thi Tốt Nghiệp Cuối Khóa (Final Test)' : 'Final Course Graduation Test'}
              </option>
            </select>
          </div>
        </div>
      )}

      {isSystemPlacement ? (
        <div className="space-y-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Thời lượng làm bài (phút):' : 'Duration (mins):'}
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={formDuration}
              onChange={(e) => onFormDurationChange(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/50 text-[11px] text-violet-700 dark:text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <span>
              {isVi
                ? 'Bài thi đầu vào không áp dụng "Điểm đạt". Điểm thi được lưu làm Baseline đầu vào để cá nhân hóa và gợi ý lộ trình học phù hợp nhất.'
                : 'Placement test has no passing threshold. The score becomes the learner baseline and guides study roadmap recommendations.'}
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Thời lượng làm bài (phút):' : 'Duration (mins):'}
            </label>
            <input
              type="number"
              min={5}
              max={180}
              value={formDuration}
              onChange={(e) => onFormDurationChange(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Điểm đạt yêu cầu (%):' : 'Passing Score (%):'}
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={formPassingScore}
              onChange={(e) => onFormPassingScoreChange(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isVi ? 'Mô tả / Hướng dẫn học viên:' : 'Description / Instructions:'}
        </label>
        <textarea
          rows={2}
          value={formDescription}
          onChange={(e) => onFormDescriptionChange(e.target.value)}
          placeholder={isVi ? 'Ghi chú hướng dẫn bài thi...' : 'Exam notes or instructions...'}
          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      <div className="flex items-start gap-2 pt-0.5">
        <input
          type="checkbox"
          id="formIsPublishedModal"
          checked={isSystemPlacement && currentActiveConflict ? false : formIsPublished}
          disabled={Boolean(isSystemPlacement && currentActiveConflict)}
          onChange={(e) => {
            if (isSystemPlacement && currentActiveConflict && e.target.checked) {
              onConflictBlocked()
              return
            }
            onFormIsPublishedChange(e.target.checked)
          }}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div>
          <label
            htmlFor="formIsPublishedModal"
            className={`text-xs font-semibold ${
              isSystemPlacement && currentActiveConflict
                ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 cursor-pointer'
            }`}
          >
            {isVi ? 'Xuất bản ngay cho học viên làm bài (Public)' : 'Publish immediately for learners (Public)'}
          </label>
          {isSystemPlacement && currentActiveConflict && (
            <p className="text-[10.5px] text-rose-500 dark:text-rose-400 font-medium mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3 shrink-0" />
              <span>
                {isVi
                  ? 'Khóa xuất bản: Đã có 1 bài thi đang Public. Bài này sẽ được lưu ở chế độ Private (Bản nháp).'
                  : 'Locked: Public test already exists. This will be saved as Private (Draft).'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
