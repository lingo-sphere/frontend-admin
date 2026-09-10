// Thông tin cơ bản của lộ trình học tập trong quản trị.

import { TrendingUp, Headphones, Layers } from 'lucide-react'
import { NumberInput } from '@/components/number.input'

interface RoadmapBasicInfoSectionProps {
  formTitle: string
  formSlug: string
  formDescription: string
  formSkillsFocus: '2SKILLS' | '4SKILLS'
  formTargetScore: number
  formMinEntryScore: number
  formMaxEntryScore: number
  formOriginalPrice: number
  formBundlePrice: number
  formIsPublished: boolean
  onTitleChange: (val: string) => void
  onSlugChange: (val: string) => void
  onDescriptionChange: (val: string) => void
  onSkillsFocusChange: (val: '2SKILLS' | '4SKILLS') => void
  onTargetScoreChange: (val: number) => void
  onMinEntryScoreChange: (val: number) => void
  onMaxEntryScoreChange: (val: number) => void
  onOriginalPriceChange: (val: number) => void
  onBundlePriceChange: (val: number) => void
  onIsPublishedChange: (val: boolean) => void
}

export function RoadmapBasicInfoSection({
  formTitle,
  formSlug,
  formDescription,
  formSkillsFocus,
  formTargetScore,
  formMinEntryScore,
  formMaxEntryScore,
  formOriginalPrice,
  formBundlePrice,
  formIsPublished,
  onTitleChange,
  onSlugChange,
  onDescriptionChange,
  onSkillsFocusChange,
  onTargetScoreChange,
  onMinEntryScoreChange,
  onMaxEntryScoreChange,
  onOriginalPriceChange,
  onBundlePriceChange,
  onIsPublishedChange,
}: RoadmapBasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tên Lộ Trình: <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Bứt Phá TOEIC 650+ Từ Con Số 0"
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Đường Dẫn Slug (Tùy chọn):
          </label>
          <input
            type="text"
            placeholder="toeic-but-pha-650-plus"
            value={formSlug}
            onChange={(e) => onSlugChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          Mô tả Lộ trình:
        </label>
        <textarea
          rows={2}
          placeholder="Mô tả tóm tắt mục tiêu, cam kết đầu ra và học viên phù hợp..."
          value={formDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Kỹ Năng Đào Tạo:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSkillsFocusChange('2SKILLS')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                formSkillsFocus === '2SKILLS'
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                <span>2 Kỹ Năng</span>
              </div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">
                Listening & Reading
              </div>
            </button>
            <button
              type="button"
              onClick={() => onSkillsFocusChange('4SKILLS')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                formSkillsFocus === '4SKILLS'
                  ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-200 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>4 Kỹ Năng</span>
              </div>
              <div className="text-[10px] font-normal opacity-80 mt-0.5">
                LR + Speaking & Writing
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Mục Tiêu Điểm Số Đầu Ra (Target Score):
          </label>
          <NumberInput
            min={10}
            max={990}
            fallbackValue={450}
            value={formTargetScore}
            onChange={onTargetScoreChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          <span>Dải Điểm Đầu Vào Khảo Sát Để Gợi Ý Lộ Trình Này</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">
              Điểm Tối Thiểu (Min Score):
            </label>
            <NumberInput
              min={0}
              max={990}
              fallbackValue={0}
              value={formMinEntryScore}
              onChange={onMinEntryScoreChange}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">
              Điểm Tối Đa (Max Score):
            </label>
            <NumberInput
              min={0}
              max={990}
              fallbackValue={990}
              value={formMaxEntryScore}
              onChange={onMaxEntryScoreChange}
              className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Giá Gốc Tổng Khóa (đ):
          </label>
          <NumberInput
            step={50000}
            min={0}
            fallbackValue={0}
            value={formOriginalPrice}
            onChange={onOriginalPriceChange}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Giá Ưu Đãi Trọn Gói (đ):
          </label>
          <NumberInput
            step={50000}
            min={0}
            fallbackValue={0}
            value={formBundlePrice}
            onChange={onBundlePriceChange}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formIsPublished}
              onChange={(e) => onIsPublishedChange(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Xuất Bản Ngay</span>
          </label>
        </div>
      </div>
    </div>
  )
}
