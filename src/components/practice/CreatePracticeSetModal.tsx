/**
 * @file CreatePracticeSetModal.tsx
 * @description Component giao diện CreatePracticeSetModal phục vụ khu vực Quản trị Admin
 */

import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { CustomSelect } from '@/components/common/CustomSelect'

interface CreatePracticeSetModalProps {
  isOpen: boolean
  title: string
  description: string
  category: string
  difficulty: string
  totalQuestions: number
  duration: number
  onTitleChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onCategoryChange: (val: string) => void
  onDifficultyChange: (val: string) => void
  onTotalQuestionsChange: (val: number) => void
  onDurationChange: (val: number) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function CreatePracticeSetModal({
  isOpen,
  title,
  description,
  category,
  difficulty,
  totalQuestions,
  duration,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onDifficultyChange,
  onTotalQuestionsChange,
  onDurationChange,
  onClose,
  onSubmit,
}: CreatePracticeSetModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isVi ? 'Thêm bộ bài tập luyện tập mới' : 'Add New Practice Set'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isVi ? 'Tiêu đề bộ bài tập' : 'Practice Set Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={isVi ? 'VD: Chuyên đề Mệnh đề quan hệ & Đại từ quan hệ' : 'e.g. Relative Clauses & Relative Pronouns'}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Phân loại' : 'Category'}
              </label>
              <CustomSelect
                value={category}
                onChange={onCategoryChange}
                options={[
                  { value: 'GRAMMAR', label: isVi ? 'Ngữ pháp' : 'Grammar' },
                  { value: 'VOCABULARY', label: isVi ? 'Từ vựng' : 'Vocabulary' },
                  { value: 'TOEIC_READING', label: isVi ? 'Đọc hiểu TOEIC' : 'TOEIC Reading' },
                  { value: 'MINI_TEST', label: isVi ? 'Đề luyện tập rút gọn' : 'Mini Practice Test' },
                ]}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Độ khó' : 'Difficulty'}
              </label>
              <CustomSelect
                value={difficulty}
                onChange={onDifficultyChange}
                options={[
                  { value: 'BEGINNER', label: isVi ? 'Cơ bản (350 - 500)' : 'Beginner (350 - 500)', badge: '350-500' },
                  { value: 'INTERMEDIATE', label: isVi ? 'Trung cấp (550 - 750)' : 'Intermediate (550 - 750)', badge: '550-750' },
                  { value: 'ADVANCED', label: isVi ? 'Nâng cao (800+)' : 'Advanced (800+)', badge: '800+' },
                ]}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Số câu hỏi' : 'Number of Questions'}
              </label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => onTotalQuestionsChange(Number(e.target.value))}
                min={5}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Thời lượng (phút)' : 'Duration (mins)'}
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => onDurationChange(Number(e.target.value))}
                min={5}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Mô tả nội dung trọng tâm và kỹ năng cần rèn luyện..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Tạo bộ bài tập
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
