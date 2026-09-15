// Modal tạo mới và chỉnh sửa Lộ trình học tập (Learning Roadmap) trong Admin.

import { useState, useEffect } from 'react'
import { Compass, RotateCcw, CheckCircle2, X } from 'lucide-react'
import { roadmapService } from '@/features/courses/services/course.service'
import { toast } from '@/store/toast.store'
import type { Course as ApiCourse, LearningRoadmap, LearningRoadmapStage } from '@/types/api.types'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { RoadmapBasicInfoSection } from '@/features/roadmaps/components/roadmap.basic.info.section'
import { RoadmapStagesListSection } from '@/features/roadmaps/components/roadmap.stages.list.section'

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
      setFormTargetScore(editingRoadmap.target_score ?? 0)
      setFormMinEntryScore(editingRoadmap.min_entry_score ?? 0)
      setFormMaxEntryScore(editingRoadmap.max_entry_score ?? 0)
      setFormBundlePrice(editingRoadmap.bundle_price ?? 0)
      setFormOriginalPrice(editingRoadmap.original_price ?? 0)
      setFormIsPublished(editingRoadmap.is_published ?? true)
      setFormStages(
        Array.isArray(editingRoadmap.stages) ? editingRoadmap.stages : []
      )
    } else {
      setFormTitle('')
      setFormSlug('')
      setFormDescription('')
      setFormSkillsFocus('2SKILLS')
      setFormTargetScore(0)
      setFormMinEntryScore(0)
      setFormMaxEntryScore(0)
      setFormBundlePrice(0)
      setFormOriginalPrice(0)
      setFormIsPublished(true)
      setFormStages([])
    }
  }, [isOpen, editingRoadmap])

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
    const updated = formStages
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, stage_order: i + 1 }))
    setFormStages(updated)
  }

  const handleUpdateStage = (
    index: number,
    field: keyof LearningRoadmapStage,
    value: LearningRoadmapStage[keyof LearningRoadmapStage]
  ) => {
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
    } catch {
      toast.error('Không thể lưu thông tin lộ trình')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
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

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <RoadmapBasicInfoSection
            formTitle={formTitle}
            formSlug={formSlug}
            formDescription={formDescription}
            formSkillsFocus={formSkillsFocus}
            formTargetScore={formTargetScore}
            formMinEntryScore={formMinEntryScore}
            formMaxEntryScore={formMaxEntryScore}
            formOriginalPrice={formOriginalPrice}
            formBundlePrice={formBundlePrice}
            formIsPublished={formIsPublished}
            onTitleChange={setFormTitle}
            onSlugChange={setFormSlug}
            onDescriptionChange={setFormDescription}
            onSkillsFocusChange={setFormSkillsFocus}
            onTargetScoreChange={setFormTargetScore}
            onMinEntryScoreChange={setFormMinEntryScore}
            onMaxEntryScoreChange={setFormMaxEntryScore}
            onOriginalPriceChange={setFormOriginalPrice}
            onBundlePriceChange={setFormBundlePrice}
            onIsPublishedChange={setFormIsPublished}
          />

          <RoadmapStagesListSection
            formStages={formStages}
            courses={courses}
            exams={exams}
            onAddStage={handleAddStage}
            onRemoveStage={handleRemoveStage}
            onUpdateStage={handleUpdateStage}
          />
        </div>

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
