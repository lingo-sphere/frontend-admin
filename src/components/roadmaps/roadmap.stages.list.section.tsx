/**
 * @file roadmap.stages.list.section.tsx
 * @description Phần cấu hình danh sách các chặng học tập (Stages), khóa học liên kết và bài kiểm tra checkpoint của lộ trình
 */

import { Layers, Plus, Trash2 } from 'lucide-react'
import type { Course as ApiCourse, LearningRoadmapStage } from '@/types/api.types'
import type { ToeicExamItem } from '@/services/exam.service'

interface RoadmapStagesListSectionProps {
  formStages: LearningRoadmapStage[]
  courses: ApiCourse[]
  exams: ToeicExamItem[]
  onAddStage: () => void
  onRemoveStage: (index: number) => void
  onUpdateStage: (index: number, field: keyof LearningRoadmapStage, value: any) => void
}

export function RoadmapStagesListSection({
  formStages,
  courses,
  exams,
  onAddStage,
  onRemoveStage,
  onUpdateStage,
}: RoadmapStagesListSectionProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Cấu Trúc Các Chặng Học Tập (Roadmap Stages)</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Học viên sẽ học lần lượt từ Chặng 1 đến Chặng cuối cùng và làm bài thi Checkpoint để
            mở khóa chặng kế tiếp.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddStage}
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
                  onClick={() => onRemoveStage(index)}
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
                  onChange={(e) => onUpdateStage(index, 'stage_title', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Khóa Học Của Chặng: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={stage.course_id}
                  onChange={(e) => onUpdateStage(index, 'course_id', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer"
                >
                  <option value="">-- Chọn Khóa Học --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.level || 'TOEIC'} •{' '}
                      {c.target_score ? `${c.target_score}+` : ''})
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
                  onChange={(e) => onUpdateStage(index, 'target_band', e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bài Thi Kiểm Tra Chặng (Checkpoint):
                </label>
                <select
                  value={stage.checkpoint_exam_id || ''}
                  onChange={(e) =>
                    onUpdateStage(index, 'checkpoint_exam_id', e.target.value)
                  }
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer"
                >
                  <option value="">-- Chọn bài thi hoặc bỏ trống --</option>
                  {exams.map((ex) => (
                    <option key={ex._id || ex.id} value={ex._id || ex.id}>
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
                  onChange={(e) =>
                    onUpdateStage(index, 'passing_score', Number(e.target.value))
                  }
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
