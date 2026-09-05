/**
 * @file course.exam.placement.section.tsx
 * @description System placement configuration selector and conflict warning banner
 */

import { Sparkles, AlertTriangle } from 'lucide-react'
import type { ToeicExamItem } from '@/services/exam.service'

interface CourseExamPlacementSectionProps {
  formPlacementSkills: '2SKILLS' | '4SKILLS'
  onChangeSkills: (skills: '2SKILLS' | '4SKILLS') => void
  currentActiveConflict?: ToeicExamItem
  published2SkillsExam?: ToeicExamItem
  published4SkillsExam?: ToeicExamItem
  isVi: boolean
}

export function CourseExamPlacementSection({
  formPlacementSkills,
  onChangeSkills,
  currentActiveConflict,
  published2SkillsExam,
  published4SkillsExam,
  isVi,
}: CourseExamPlacementSectionProps) {
  return (
    <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/80 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-violet-800 dark:text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          <span>
            {isVi
              ? 'Bài Thi Đầu Vào Phân Loại Trình Độ Hệ Thống'
              : 'System Placement Test Configuration'}
          </span>
        </div>
        <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
          {isVi ? 'Tối đa 2 bài Public (1 bài 2KN & 1 bài 4KN)' : 'Max 2 Public tests'}
        </span>
      </div>

      {currentActiveConflict && (
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-0.5 animate-in fade-in duration-150">
          <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-[11.5px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {isVi
                ? `Đã có bài thi ${formPlacementSkills === '2SKILLS' ? '2 Kỹ Năng' : '4 Kỹ Năng'} đang hoạt động Public: "${currentActiveConflict.title}"`
                : `Active public test exists: "${currentActiveConflict.title}"`}
            </span>
          </div>
          <p className="text-[10.5px] text-amber-700 dark:text-amber-400 pl-5 leading-tight">
            {isVi
              ? 'Bài thi mới này bắt buộc tạo dạng Private (Bản nháp). Muốn đổi thành Public, hãy chuyển bài cũ về Private trước.'
              : 'New test will be created as Private (Draft). To make it Public, make existing test Private first.'}
          </p>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
          {isVi ? 'Chọn cấu hình kỹ năng đánh giá:' : 'Evaluation Skills:'}
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onChangeSkills('2SKILLS')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              formPlacementSkills === '2SKILLS'
                ? 'bg-white dark:bg-slate-900 border-violet-500 ring-2 ring-violet-500/20 text-violet-900 dark:text-violet-200 shadow-xs'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-violet-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">🎧 📖 2 Kỹ Năng</span>
              {published2SkillsExam && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                  {isVi ? 'Đã có Public' : 'Public Active'}
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">Listening & Reading (10 - 990)</div>
          </button>

          <button
            type="button"
            onClick={() => onChangeSkills('4SKILLS')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              formPlacementSkills === '4SKILLS'
                ? 'bg-white dark:bg-slate-900 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-200 shadow-xs'
                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">🎧 📖 🗣️ ✍️ 4 Kỹ Năng</span>
              {published4SkillsExam && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                  {isVi ? 'Đã có Public' : 'Public Active'}
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">LR + Speaking & Writing</div>
          </button>
        </div>
      </div>
    </div>
  )
}
