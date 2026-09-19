// Form cấu hình thông tin tổng quan bài thi (tiêu đề, thời lượng, kỹ năng, trạng thái phát hành).

import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  FileCheck2,
  ChevronDown,
  Globe,
  GraduationCap,
  Clock,
  Trophy,
  Layers,
  ShieldAlert,
} from 'lucide-react'
import { NumberInput } from '@/components/number.input'
import { CustomSelect } from '@/components/custom.select'
import { toast } from '@/store/toast.store'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'

interface ExamConfigFormProps {
  initialExam: ToeicExamItem
  isCreateMode: boolean
  isVi: boolean
  formTitle: string
  setFormTitle: (val: string) => void
  formPlacementSkills: '2SKILLS' | '4SKILLS'
  handleSkillsChange: (skills: '2SKILLS' | '4SKILLS') => void
  formDuration: number
  setFormDuration: (val: number) => void
  formPassingScore: number
  setFormPassingScore: (val: number) => void
  formDescription: string
  setFormDescription: (val: string) => void
  formIsPublished: boolean
  setFormIsPublished: (val: boolean) => void
  isConfigExpanded: boolean
  setIsConfigExpanded: (val: boolean | ((prev: boolean) => boolean)) => void
  currentActiveConflict?: ToeicExamItem
  isSystemPlacement: boolean
  onCancelExam: () => void
  isCanceling: boolean
}

export function ExamConfigForm({
  initialExam,
  isCreateMode,
  isVi,
  formTitle,
  setFormTitle,
  formPlacementSkills,
  handleSkillsChange,
  formDuration,
  setFormDuration,
  formPassingScore,
  setFormPassingScore,
  formDescription,
  setFormDescription,
  formIsPublished,
  setFormIsPublished,
  isConfigExpanded,
  setIsConfigExpanded,
  currentActiveConflict,
  isSystemPlacement,
  onCancelExam,
  isCanceling,
}: ExamConfigFormProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={onCancelExam}
            disabled={isCanceling}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {isSystemPlacement
                ? (isVi ? 'Đề thi đầu vào' : 'Placement Tests')
                : (isVi ? 'Bài thi khóa học' : 'Course Exams')}
            </span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs sm:max-w-md">
            {isCreateMode
              ? isVi
                ? 'Tạo bài thi đánh giá mới (Toàn Hệ Thống)'
                : 'Create New Placement Exam'
              : formTitle || initialExam.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCreateMode ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVi ? 'Chế độ tạo mới' : 'New Exam Mode'}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {isVi ? 'Mã đề:' : 'ID:'} {initialExam._id || initialExam.id}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Thông Tin Cấu Hình Bài Thi' : 'Exam Configuration'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {formPlacementSkills === '4SKILLS' ? '4 Kỹ năng (LRSW)' : '2 Kỹ năng (LR)'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {formDuration} {isVi ? 'phút' : 'mins'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                    formIsPublished
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {formIsPublished
                    ? isVi
                      ? 'Public (Công khai)'
                      : 'Public'
                    : isVi
                    ? 'Private (Bản nháp)'
                    : 'Private'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVi
                  ? 'Cấu hình tiêu đề, thang điểm chuẩn, thời lượng thi và bộ kỹ năng áp dụng'
                  : 'Configure exam title, passing score, duration, and target skills'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs font-semibold hidden sm:inline">
              {isConfigExpanded ? (isVi ? 'Thu gọn' : 'Collapse') : isVi ? 'Chỉnh sửa cấu hình' : 'Expand'}
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ease-in-out ${
                isConfigExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isConfigExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Phạm vi áp dụng bài thi:' : 'Applied Scope:'}
                </label>
                <div className="flex items-center justify-between px-4 py-2.5 bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-bold text-violet-800 dark:text-violet-300">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>
                      {isVi ? '[TOÀN HỆ THỐNG] - Bài thi đầu vào phân loại trình độ (Placement Test)' : '[SYSTEM WIDE] - Placement Test'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700">
                    {isVi ? 'Toàn hệ thống' : 'Global System'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Tiêu đề bài thi *' : 'Exam Title *'}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    isVi
                      ? 'Ví dụ: Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC (LR)'
                      : 'e.g., TOEIC Diagnostic Placement Test'
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isVi ? 'Bộ kỹ năng đánh giá (Placement Type):' : 'Assessment Skills:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => handleSkillsChange('2SKILLS')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      formPlacementSkills === '2SKILLS'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {isVi ? '2 Kỹ năng (LR)' : '2 Skills (LR)'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        Listening & Reading
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isVi
                        ? 'Thi Trắc nghiệm Đọc và Nghe, thời gian chuẩn 60 phút, tối đa 990 điểm.'
                        : 'Standard Multiple Reading and Listening, 60 mins duration.'}
                    </p>
                  </div>

                  <div
                    onClick={() => handleSkillsChange('4SKILLS')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      formPlacementSkills === '4SKILLS'
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/40 dark:border-teal-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {isVi ? '4 Kỹ năng (LRSW)' : '4 Skills (LRSW)'}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                        Toàn diện 4 Kỹ năng
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isVi
                        ? 'Gồm Trắc nghiệm Nghe/Đọc + Ghi âm Nói (Speaking) + Viết luận (Writing).'
                        : 'Comprehensive Listening, Reading, Speaking audio recording, and Writing.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${!isSystemPlacement ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isVi ? 'Thời gian thi (phút):' : 'Duration (mins):'}</span>
                    </div>
                  </label>
                  <NumberInput
                    min={5}
                    max={240}
                    fallbackValue={60}
                    value={formDuration}
                    onChange={setFormDuration}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {!isSystemPlacement && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isVi ? 'Điểm chuẩn đạt:' : 'Passing Score:'}</span>
                      </div>
                    </label>
                    <NumberInput
                      min={0}
                      max={990}
                      fallbackValue={0}
                      value={formPassingScore}
                      onChange={setFormPassingScore}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isVi ? 'Trạng thái phát hành:' : 'Publish Status:'}</span>
                    </div>
                  </label>
                  <CustomSelect
                    value={formIsPublished ? 'PUBLISHED' : 'DRAFT'}
                    onChange={(val) => {
                      const isPub = val === 'PUBLISHED'
                      if (isPub && currentActiveConflict) {
                        toast.error(
                          isVi
                            ? `Đã có bài thi "${currentActiveConflict.title}" đang Public. Hệ thống chỉ cho phép 1 bài thi cùng bộ kỹ năng Public cùng lúc!`
                            : `System already has a public test for this skill set!`
                        )
                        return
                      }
                      setFormIsPublished(isPub)
                    }}
                    options={[
                      {
                        value: 'PUBLISHED',
                        label: isVi ? 'Public (Công khai)' : 'Public',
                        badge: isVi ? 'Hiển thị' : 'Visible',
                        badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                      },
                      {
                        value: 'DRAFT',
                        label: isVi ? 'Private (Bản nháp)' : 'Private Draft',
                        badge: isVi ? 'Ẩn' : 'Hidden',
                        badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                      },
                    ]}
                    size="md"
                  />
                </div>
              </div>

              {currentActiveConflict && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">{isVi ? 'Lưu ý trùng lặp bài thi Public:' : 'Public Conflict Notice:'}</span>{' '}
                    {isVi
                      ? `Hiện đã có bài thi "${currentActiveConflict.title}" đang Public cho bộ kỹ năng ${formPlacementSkills}. Nếu lưu bài này ở chế độ Private, bạn vẫn có thể soạn câu hỏi bình thường và công khai sau khi chuyển bài cũ về Private.`
                      : `Test "${currentActiveConflict.title}" is already public. You can save this test as Private draft.`}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isVi ? 'Mô tả bài thi (tùy chọn):' : 'Description (optional):'}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={
                    isVi
                      ? 'Nhập mô tả hướng dẫn hoặc ghi chú dành cho thí sinh làm bài...'
                      : 'Enter instructions or notes for students...'
                  }
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
