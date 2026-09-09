// Cột hiển thị và thao tác bảng lộ trình học tập admin.
import { Compass, BookOpen, CheckCircle2, Edit3, Trash2, Layers, Headphones } from 'lucide-react'
import type { DataTableColumn } from '@/components/common/data.table'
import { Popconfirm } from '@/components/common/popconfirm'
import type { LearningRoadmap } from '@/types/api.types'

interface CreateRoadmapColumnsOptions {
  isVi: boolean
  onTogglePublish: (record: LearningRoadmap) => void
  onEdit: (record: LearningRoadmap) => void
  onDelete: (roadmapId: string) => void
}

export function createRoadmapColumns({
  isVi,
  onTogglePublish,
  onEdit,
  onDelete,
}: CreateRoadmapColumnsOptions): DataTableColumn<LearningRoadmap>[] {
  return [
    {
      key: 'title',
      title: isVi ? 'Tên Lộ Trình' : 'Roadmap Title',
      sortable: true,
      render: (record: LearningRoadmap) => (
        <div className="space-y-1 max-w-sm">
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
            <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{record.title}</span>
          </div>
          {record.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {record.description}
            </p>
          )}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              /{record.slug}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'skills_focus',
      title: isVi ? 'Kỹ Năng' : 'Skills Focus',
      align: 'center',
      render: (record: LearningRoadmap) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            record.skills_focus === '4SKILLS'
              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200'
          }`}
        >
          {record.skills_focus === '4SKILLS' ? (
            <>
              <Layers className="w-3 h-3 text-teal-600" />
              <span>4 Kỹ Năng</span>
            </>
          ) : (
            <>
              <Headphones className="w-3 h-3 text-indigo-600" />
              <span>2 Kỹ Năng</span>
            </>
          )}
        </span>
      ),
    },
    {
      key: 'target_score',
      title: isVi ? 'Mục Tiêu' : 'Target',
      align: 'center',
      sortable: true,
      render: (record: LearningRoadmap) => (
        <div className="space-y-0.5">
          <span className="inline-block px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 font-extrabold text-xs">
            TOEIC {record.target_score}+
          </span>
          <div className="text-[10px] text-slate-400">
            Đầu vào: {record.min_entry_score} - {record.max_entry_score}
          </div>
        </div>
      ),
    },
    {
      key: 'stages',
      title: isVi ? 'Số Chặng & Khóa' : 'Stages & Courses',
      align: 'center',
      render: (record: LearningRoadmap) => (
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            {record.stages?.length || 0} Chặng học
          </span>
        </div>
      ),
    },
    {
      key: 'pricing',
      title: isVi ? 'Giá Gói Lộ Trình' : 'Bundle Price',
      align: 'right',
      render: (record: LearningRoadmap) => (
        <div className="space-y-0.5 text-right">
          <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
            {(record.bundle_price || 0).toLocaleString('vi-VN')} đ
          </div>
          {record.original_price && record.original_price > (record.bundle_price || 0) && (
            <div className="text-[11px] text-slate-400 line-through">
              {record.original_price.toLocaleString('vi-VN')} đ
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'is_published',
      title: isVi ? 'Trạng Thái' : 'Status',
      align: 'center',
      render: (record: LearningRoadmap) => (
        <button
          type="button"
          onClick={() => onTogglePublish(record)}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            record.is_published
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          {record.is_published ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Hoạt Động</span>
            </>
          ) : (
            <span>Bản Nháp</span>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao Tác' : 'Actions',
      align: 'right',
      render: (record: LearningRoadmap) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(record)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
            title="Chỉnh sửa lộ trình"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Xóa lộ trình này?"
            description="Hành động này không thể hoàn tác. Các thiết lập chặng sẽ bị xóa."
            onConfirm={() => onDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Xóa lộ trình"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ]
}
