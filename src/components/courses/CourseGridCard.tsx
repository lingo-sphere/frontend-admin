/**
 * @file CourseGridCard.tsx
 * @description Component giao diện CourseGridCard phục vụ khu vực Quản trị Admin
 */

import { BookOpen, Edit2, Trash2 } from 'lucide-react'
import type { Course } from '@/data/courses-data'
import { categoryLabels, levelLabels } from '@/data/courses-data'
import { Popconfirm } from '@/components/common/Popconfirm'
import { getCategoryBadgeClass, getLevelBadgeClass } from '@/helpers/course.helper'

interface CourseGridCardProps {
  course: Course
  isVi: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: (courseId: string) => void
  onDelete: (courseId: string) => Promise<void> | void
}

export function CourseGridCard({
  course,
  isVi,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: CourseGridCardProps) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all flex flex-col group h-full">
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
            <BookOpen className="w-8 h-8 text-indigo-500/70" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md shadow-xs ${getCategoryBadgeClass(course.category)}`}
          >
            {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md shadow-xs ${getLevelBadgeClass(course.level)}`}
          >
            {levelLabels[course.level]?.[isVi ? 'vi' : 'en'] || course.level}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs ${
              course.is_published
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${course.is_published ? 'bg-emerald-400' : 'bg-slate-400'}`}
            />
            {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
            onClick={() => onEdit(course.id)}
          >
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
            {course.description}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Mục tiêu</p>
              <p className="text-xs font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                {course.target_score}+
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Chương / Bài</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                {course.total_modules}m · {course.total_lessons}b
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Học viên</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                {course.enrollments.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
            {course.price ? `${course.price.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
          </span>

          <div className="flex items-center gap-1.5">
            {canEdit && (
              <button
                onClick={() => onEdit(course.id)}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer shadow-2xs"
                title="Chỉnh sửa khóa học"
                type="button"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <Popconfirm
                title="Xóa khóa học này?"
                description="Hành động này không thể hoàn tác."
                okText="Xóa"
                cancelText="Hủy"
                okType="danger"
                placement="topRight"
                onConfirm={() => onDelete(course.id)}
              >
                <button
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer shadow-2xs"
                  title="Xóa khóa học"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Popconfirm>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
