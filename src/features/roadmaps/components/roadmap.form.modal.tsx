// Modal tạo mới và chỉnh sửa Lộ trình học tập (Learning Roadmap) trong Admin.

import { useEffect } from 'react'
import { Compass, RotateCcw, CheckCircle2, X } from 'lucide-react'
import { useForm, useStore } from '@tanstack/react-form'
import { roadmapService } from '@/features/courses/services/course.service'
import { toast } from '@/store/toast.store'
import type { Course as ApiCourse, LearningRoadmap, LearningRoadmapStage } from '@/types/api.types'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { RoadmapBasicInfoSection } from '@/features/roadmaps/components/roadmap.basic.info.section'
import { RoadmapStagesListSection } from '@/features/roadmaps/components/roadmap.stages.list.section'
import { queryClient } from '@/config/query.config'
import { roadmapAdminKeys } from '@/features/roadmaps/keys/roadmap.admin.keys'

interface RoadmapFormModalProps {
  isOpen: boolean
  editingRoadmap: LearningRoadmap | null
  courses: ApiCourse[]
  exams: ToeicExamItem[]
  onClose: () => void
  onSuccess: () => void
}

type RoadmapFormStage = Omit<LearningRoadmapStage, 'course'>

interface RoadmapFormValues {
  title: string
  slug: string
  description: string
  skills_focus: '2SKILLS' | '4SKILLS'
  target_score: number
  min_entry_score: number
  max_entry_score: number
  bundle_price: number
  original_price: number
  is_published: boolean
  stages: RoadmapFormStage[]
}

const initialDefaultValues: RoadmapFormValues = {
  title: '',
  slug: '',
  description: '',
  skills_focus: '2SKILLS',
  target_score: 650,
  min_entry_score: 250,
  max_entry_score: 500,
  bundle_price: 1200000,
  original_price: 1600000,
  is_published: true,
  stages: [
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
  ],
}

export function RoadmapFormModal({
  isOpen,
  editingRoadmap,
  courses,
  exams,
  onClose,
  onSuccess,
}: RoadmapFormModalProps) {
  const form = useForm({
    defaultValues: initialDefaultValues,
    onSubmit: async ({ value }: { value: RoadmapFormValues }) => {
      if (!value.title.trim()) {
        toast.warning('Vui lòng nhập tên Lộ trình học tập!')
        return
      }

      const hasEmptyCourse = value.stages.some((s: LearningRoadmapStage) => !s.course_id)
      if (hasEmptyCourse) {
        toast.warning('Vui lòng chọn khóa học cho tất cả các chặng trong lộ trình!')
        return
      }

      try {
        const payload: Partial<LearningRoadmap> = {
          title: value.title.trim(),
          slug: value.slug.trim() || undefined,
          description: value.description.trim(),
          skills_focus: value.skills_focus,
          target_score: value.target_score,
          min_entry_score: value.min_entry_score,
          max_entry_score: value.max_entry_score,
          bundle_price: value.bundle_price,
          original_price: value.original_price,
          is_published: value.is_published,
          stages: value.stages,
        }

        if (editingRoadmap?._id) {
          await roadmapService.updateRoadmap(editingRoadmap._id, payload)
          toast.success('Cập nhật lộ trình học tập thành công!')
        } else {
          await roadmapService.createRoadmap(payload)
          toast.success('Tạo lộ trình học tập mới thành công!')
        }

        await queryClient.invalidateQueries({ queryKey: roadmapAdminKeys.all })
        onSuccess()
        onClose()
      } catch {
        toast.error('Không thể lưu thông tin lộ trình')
      }
    },
  })

  useEffect(() => {
    if (!isOpen) return

    if (editingRoadmap) {
      form.reset({
        title: editingRoadmap.title || '',
        slug: editingRoadmap.slug || '',
        description: editingRoadmap.description || '',
        skills_focus: (editingRoadmap.skills_focus || '2SKILLS') as '2SKILLS' | '4SKILLS',
        target_score: editingRoadmap.target_score ?? 0,
        min_entry_score: editingRoadmap.min_entry_score ?? 0,
        max_entry_score: editingRoadmap.max_entry_score ?? 0,
        bundle_price: editingRoadmap.bundle_price ?? 0,
        original_price: editingRoadmap.original_price ?? 0,
        is_published: editingRoadmap.is_published ?? true,
        stages: Array.isArray(editingRoadmap.stages) ? editingRoadmap.stages : [],
      })
    } else {
      form.reset(initialDefaultValues)
    }
  }, [isOpen, editingRoadmap])

  const values = useStore(form.store, (state) => state.values)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  if (!isOpen) return null

  const handleAddStage = () => {
    const nextOrder = values.stages.length + 1
    const newStage: LearningRoadmapStage = {
      stage_order: nextOrder,
      stage_title: `Chặng ${nextOrder}: Giai Đoạn Nâng Cao`,
      stage_description: 'Mục tiêu hoàn thiện các kỹ năng trọng tâm',
      course_id: courses[0]?._id || '',
      target_band: `${Math.min(990, values.target_score - 50 * (values.stages.length ? 1 : 0))}+`,
      checkpoint_exam_id: '',
      passing_score: 75,
    }
    form.setFieldValue('stages', [...values.stages, newStage])
  }

  const handleRemoveStage = (index: number) => {
    if (values.stages.length <= 1) {
      toast.warning('Lộ trình cần có ít nhất 1 chặng học!')
      return
    }
    const updated = values.stages
      .filter((_: LearningRoadmapStage, i: number) => i !== index)
      .map((s: LearningRoadmapStage, i: number) => ({ ...s, stage_order: i + 1 }))
    form.setFieldValue('stages', updated)
  }

  const handleUpdateStage = (
    index: number,
    field: keyof LearningRoadmapStage,
    val: LearningRoadmapStage[keyof LearningRoadmapStage]
  ) => {
    const updated = [...values.stages]
    updated[index] = { ...updated[index], [field]: val }
    form.setFieldValue('stages', updated)
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
            formTitle={values.title}
            formSlug={values.slug}
            formDescription={values.description}
            formSkillsFocus={values.skills_focus}
            formTargetScore={values.target_score}
            formMinEntryScore={values.min_entry_score}
            formMaxEntryScore={values.max_entry_score}
            formOriginalPrice={values.original_price}
            formBundlePrice={values.bundle_price}
            formIsPublished={values.is_published}
            onTitleChange={(val) => form.setFieldValue('title', val)}
            onSlugChange={(val) => form.setFieldValue('slug', val)}
            onDescriptionChange={(val) => form.setFieldValue('description', val)}
            onSkillsFocusChange={(val) => form.setFieldValue('skills_focus', val)}
            onTargetScoreChange={(val) => form.setFieldValue('target_score', val)}
            onMinEntryScoreChange={(val) => form.setFieldValue('min_entry_score', val)}
            onMaxEntryScoreChange={(val) => form.setFieldValue('max_entry_score', val)}
            onOriginalPriceChange={(val) => form.setFieldValue('original_price', val)}
            onBundlePriceChange={(val) => form.setFieldValue('bundle_price', val)}
            onIsPublishedChange={(val) => form.setFieldValue('is_published', val)}
          />

          <RoadmapStagesListSection
            formStages={values.stages}
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
            disabled={isSubmitting}
            onClick={() => form.handleSubmit()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
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
