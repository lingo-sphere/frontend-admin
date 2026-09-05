/**
 * @file roadmap.form.modal.tsx
 * @description Modal tạo mới và chỉnh sửa Lộ trình học tập (Learning Roadmap) kèm cấu hình các chặng học (Stages)
 */

import { useState, useEffect } from 'react'
import {
  Compass,
  Layers,
  Plus,
  Trash2,
  TrendingUp,
  X,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import { roadmapService } from '@/services/course.service'
import { toast } from '@/store/toast-store'
import type { Course as ApiCourse, LearningRoadmap, LearningRoadmapStage } from '@/types/api.types'
import type { ToeicExamItem } from '@/services/exam.service'

interface RoadmapFormModalProps {
  isOpen: boolean
  editingRoadmap: LearningRoadmap | null
  courses: ApiCourse[]
  exams: ToeicExamItem[]
  onClose: () => void
  onSuccess: () => void
}

export function RoadmapFormModal({
  isOpen,
  editingRoadmap,
  courses,
  exams,
  onClose,
  onSuccess,
}: RoadmapFormModalProps) {
  const [formTitle, setFormTitle] = useState<string>('')
  const [formSlug, setFormSlug] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formSkillsFocus, setFormSkillsFocus] = useState<'2SKILLS' | '4SKILLS'>('2SKILLS')
  const [formTargetScore, setFormTargetScore] = useState<number>(650)
  const [formMinEntryScore, setFormMinEntryScore] = useState<number>(250)
  const [formMaxEntryScore, setFormMaxEntryScore] = useState<number>(500)
  const [formBundlePrice, setFormBundlePrice] = useState<number>(1200000)
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(1600000)
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true)
  const [formStages, setFormStages] = useState<LearningRoadmapStage[]>([
    {
      stage_order: 1,
      stage_title: 'Chặng 1: Nền Tảng Cốt Lõi',
      stage_description: 'Củng cố ngữ pháp, từ vựng nền tảng và phản xạ nghe hiểu',
      course_id: '',
      target_band: '450+',
      checkpoint_exam_id: '',
      passing_score: 70,
    },
    {
      stage_order: 2,
      stage_title: 'Chặng 2: Bứt Phá Mục Tiêu',
      stage_description: 'Chiến thuật giải đề, khắc phục bẫy điểm và nâng cao tốc độ',
      course_id: '',
      target_band: '650+',
      checkpoint_exam_id: '',
      passing_score: 75,
    },
  ])
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (!isOpen) return

    if (editingRoadmap) {
      setFormTitle(editingRoadmap.title || '')
      setFormSlug(editingRoadmap.slug || '')
      setFormDescription(editingRoadmap.description || '')
      setFormSkillsFocus(editingRoadmap.skills_focus || '2SKILLS')
      setFormTargetScore(editingRoadmap.target_score || 650)
      setFormMinEntryScore(editingRoadmap.min_entry_score || 0)
      setFormMaxEntryScore(editingRoadmap.max_entry_score || 990)
      setFormBundlePrice(editingRoadmap.bundle_price || 0)
      setFormOriginalPrice(editingRoadmap.original_price || 0)
      setFormIsPublished(editingRoadmap.is_published ?? true)
      setFormStages(
        Array.isArray(editingRoadmap.stages) && editingRoadmap.stages.length > 0
          ? editingRoadmap.stages
          : [
              {
                stage_order: 1,
                stage_title: 'Chặng 1: Xây Dựng Nền Tảng',
                stage_description: 'Củng cố ngữ pháp và từ vựng',
                course_id: courses[0]?._id || '',
                target_band: '450+',
                checkpoint_exam_id: '',
                passing_score: 70,
              },
            ]
      )
    } else {
      setFormTitle('')
      setFormSlug('')
      setFormDescription('')
      setFormSkillsFocus('2SKILLS')
      setFormTargetScore(650)
      setFormMinEntryScore(250)
      setFormMaxEntryScore(500)
      setFormBundlePrice(1200000)
      setFormOriginalPrice(1600000)
      setFormIsPublished(true)
      setFormStages([
        {
          stage_order: 1,
          stage_title: 'Chặng 1: Xây Dựng Nền Tảng',
          stage_description: 'Củng cố ngữ pháp và từ vựng trọng tâm',
          course_id: courses[0]?._id || '',
          target_band: '450+',
          checkpoint_exam_id: '',
          passing_score: 70,
        },
        {
          stage_order: 2,
          stage_title: 'Chặng 2: Bứt Phá Điểm Số',
          stage_description: 'Nâng cao tốc độ và xử lý các câu khó',
          course_id: courses[1]?._id || courses[0]?._id || '',
          target_band: '650+',
          checkpoint_exam_id: '',
          passing_score: 75,
        },
      ])
    }
  }, [isOpen, editingRoadmap, courses])

  if (!isOpen) return null

  const handleAddStage = () => {
    const nextOrder = formStages.length + 1
    setFormStages([
      ...formStages,
      {
        stage_order: nextOrder,
        stage_title: `Chặng ${nextOrder}: Giai Đoạn Nâng Cao`,
        stage_description: 'Mục tiêu hoàn thiện các kỹ năng trọng tâm',
        course_id: courses[0]?._id || '',
        target_band: `${Math.min(990, formTargetScore - 50 * (formStages.length ? 1 : 0))}+`,
        checkpoint_exam_id: '',
        passing_score: 75,
      },
    ])
  }

  const handleRemoveStage = (index: number) => {
    if (formStages.length <= 1) {
      toast.warning('Lộ trình cần có ít nhất 1 chặng học!')
      return
    }
    const updated = formStages.filter((_, i) => i !== index).map((s, i) => ({ ...s, stage_order: i + 1 }))
    setFormStages(updated)
  }

  const handleUpdateStage = (index: number, field: keyof LearningRoadmapStage, value: any) => {
    const updated = [...formStages]
    updated[index] = { ...updated[index], [field]: value }
    setFormStages(updated)
  }

  const handleSaveRoadmap = async () => {
    if (!formTitle.trim()) {
      toast.warning('Vui lòng nhập tên Lộ trình học tập!')
      return
    }

    const hasEmptyCourse = formStages.some((s) => !s.course_id)
    if (hasEmptyCourse) {
      toast.warning('Vui lòng chọn khóa học cho tất cả các chặng trong lộ trình!')
      return
    }

    setIsSaving(true)
    try {
      const payload: Partial<LearningRoadmap> = {
        title: formTitle.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim(),
        skills_focus: formSkillsFocus,
        target_score: formTargetScore,
        min_entry_score: formMinEntryScore,
        max_entry_score: formMaxEntryScore,
        bundle_price: formBundlePrice,
        original_price: formOriginalPrice,
        is_published: formIsPublished,
        stages: formStages,
      }

      if (editingRoadmap?._id) {
        await roadmapService.updateRoadmap(editingRoadmap._id, payload)
        toast.success('Cập nhật lộ trình học tập thành công!')
      } else {
        await roadmapService.createRoadmap(payload)
        toast.success('Tạo lộ trình học tập mới thành công!')
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Lỗi khi lưu lộ trình:', err)
      toast.error('Không thể lưu thông tin lộ trình')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editingRoadmap ? 'Chỉnh Sửa Lộ Trình Học Tập' : 'Tạo Lộ Trình Học Tập Mới'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
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
                  onChange={(e) => setFormTitle(e.target.value)}
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
                  onChange={(e) => setFormSlug(e.target.value)}
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
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Skills Focus & Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kỹ Năng Đào Tạo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSkillsFocus('2SKILLS')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formSkillsFocus === '2SKILLS'
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs">🎧 📖 2 Kỹ Năng</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">Listening & Reading</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSkillsFocus('4SKILLS')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formSkillsFocus === '4SKILLS'
                        ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs">🗣️ ✍️ 4 Kỹ Năng</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">LR + Speaking & Writing</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mục Tiêu Điểm Số Đầu Ra (Target Score):
                </label>
                <input
                  type="number"
                  min={10}
                  max={990}
                  value={formTargetScore}
                  onChange={(e) => setFormTargetScore(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Score Bracket Match */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dải Điểm Đầu Vào Khảo Sát Để Gợi Ý Lộ Trình Này</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Điểm Tối Thiểu (Min Score):</label>
                  <input
                    type="number"
                    min={0}
                    max={990}
                    value={formMinEntryScore}
                    onChange={(e) => setFormMinEntryScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Điểm Tối Đa (Max Score):</label>
                  <input
                    type="number"
                    min={0}
                    max={990}
                    value={formMaxEntryScore}
                    onChange={(e) => setFormMaxEntryScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Giá Gốc Tổng Khóa (đ):
                </label>
                <input
                  type="number"
                  step={50000}
                  value={formOriginalPrice}
                  onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Giá Ưu Đãi Trọn Gói (đ):
                </label>
                <input
                  type="number"
                  step={50000}
                  value={formBundlePrice}
                  onChange={(e) => setFormBundlePrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Xuất Bản Ngay</span>
                </label>
              </div>
            </div>
          </div>

          {/* Stages Builder */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Cấu Trúc Các Chặng Học Tập (Roadmap Stages)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Học viên sẽ học lần lượt từ Chặng 1 đến Chặng cuối cùng và làm bài thi Checkpoint để mở khóa chặng kế tiếp.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStage}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Chặng</span>
              </button>
            </div>

            <div className="space-y-3">
              {formStages.map((stage, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Chặng {index + 1}
                      </span>
                    </div>
                    {formStages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(index)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                        title="Xóa chặng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tiêu Đề Chặng:
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Chặng 1: Nền tảng 450+"
                        value={stage.stage_title}
                        onChange={(e) => handleUpdateStage(index, 'stage_title', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Khóa Học Của Chặng: <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={stage.course_id}
                        onChange={(e) => handleUpdateStage(index, 'course_id', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer"
                      >
                        <option value="">-- Chọn Khóa Học --</option>
                        {courses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.title} ({c.level || 'TOEIC'} • {c.target_score ? `${c.target_score}+` : ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Band Mục Tiêu Chặng:
                      </label>
                      <input
                        type="text"
                        placeholder="450+"
                        value={stage.target_band || ''}
                        onChange={(e) => handleUpdateStage(index, 'target_band', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Bài Thi Kiểm Tra Chặng (Checkpoint):
                      </label>
                      <select
                        value={stage.checkpoint_exam_id || ''}
                        onChange={(e) => handleUpdateStage(index, 'checkpoint_exam_id', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer"
                      >
                        <option value="">-- Chọn bài thi hoặc bỏ trống --</option>
                        {exams.map((ex) => (
                          <option key={ex.id || ex._id} value={ex.id || ex._id}>
                            {ex.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Điểm Đạt Checkpoint (%):
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={stage.passing_score || 70}
                        onChange={(e) => handleUpdateStage(index, 'passing_score', Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveRoadmap}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingRoadmap ? 'Lưu Thay Đổi' : 'Tạo Lộ Trình'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
