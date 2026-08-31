import { BookOpen, Target, Layers, Users, Edit2, Trash2 } from 'lucide-react'
import type { Course } from '@/data/courses-data'
import { categoryLabels, levelLabels } from '@/data/courses-data'
import type { DataTableColumn } from '@/components/common/DataTable'
import { getCategoryBadgeClass, getLevelBadgeClass } from '@/helpers/course.helper'

interface GetCourseColumnsOptions {
  isVi: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: (courseId: string) => void
  onDelete: (courseId: string) => void
}

export function getCourseColumns({
  isVi,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: GetCourseColumnsOptions): DataTableColumn<Course>[] {
  return [
    {
      key: 'info',
      title: 'Khóa học & Lộ trình',
      render: (course) => (
        <div className="flex items-center gap-3.5 py-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative group">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/30">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1"
                onClick={() => onEdit(course.id)}
              >
                {course.title}
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-md">
              {course.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                <Target className="w-3 h-3" /> Target {course.target_score}+
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Danh mục & Trình độ',
      render: (course) => (
        <div className="space-y-1.5 py-1">
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap ${getCategoryBadgeClass(course.category)}`}
            >
              {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
            </span>
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap ${getLevelBadgeClass(course.level)}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'stats',
      title: 'Số bài & Học viên',
      render: (course) => (
        <div className="space-y-1 py-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-750 dark:text-slate-200 whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              {course.total_modules} chương · {course.total_lessons} video
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{course.enrollments.toLocaleString('vi-VN')} học viên</span>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      title: 'Học phí',
      render: (course) => (
        <div className="whitespace-nowrap py-1">
          <span className="inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
            {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (course) => (
        <div className="whitespace-nowrap py-1">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              course.is_published
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${course.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
            />
            {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'right',
      render: (course) => (
        <div className="flex items-center justify-end gap-1.5 py-1">
          {canEdit && (
            <button
              onClick={() => onEdit(course.id)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/80 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-2xs"
              title="Chỉnh sửa khóa học"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(course.id)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 hover:text-rose-500 transition-all cursor-pointer shadow-2xs"
              title="Xóa khóa học"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]
}
