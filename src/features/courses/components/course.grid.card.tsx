// Card hiển thị thông tin khóa học dạng lưới (Grid View).

import { BookOpen, Edit2, Trash2, Headphones, GraduationCap, Target, BookMarked, Users } from 'lucide-react'
import type { Course } from '@/features/courses/data/courses.data'
import { categoryLabels } from '@/features/courses/data/courses.data'
import { Popconfirm } from '@/components/popconfirm'
import { getCategoryBadgeClass } from '@/features/courses/helpers/course.helper'
import { formatCurrency, formatNumber } from '@/lib/format'
import { resolveMediaUrl } from '@/lib/media.utils'

interface CourseGridCardProps {
  course: Course
  isVi: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: (courseId: string) => void
  onDelete: (courseId: string) => Promise<void> | void
  onViewSubmissions?: (course: Course) => void
  onViewScores?: (course: Course) => void
}

export function CourseGridCard({
  course,
  isVi,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onViewSubmissions,
  onViewScores,
}: CourseGridCardProps) {
  const rawPrice = Number(course.price ?? 0)
  const rawDiscount = Number(course.discount_price ?? 0)

  let effectivePrice = rawPrice
  let originalPrice = 0
  let hasDiscount = false

  if (rawDiscount > 0 && rawPrice > 0 && rawDiscount !== rawPrice) {
    effectivePrice = Math.min(rawPrice, rawDiscount)
    originalPrice = Math.max(rawPrice, rawDiscount)
    hasDiscount = true
  } else if (rawDiscount > 0 && rawPrice === 0) {
    effectivePrice = rawDiscount
  } else if (rawPrice > 0 && rawDiscount === 0) {
    effectivePrice = rawPrice
  }

  const discountPercent =
    hasDiscount && originalPrice > 0
      ? Math.round((1 - effectivePrice / originalPrice) * 100)
      : 0


  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group">
      <div>
        <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={resolveMediaUrl(course.thumbnail_url)}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60">
              <BookOpen className="w-9 h-9 stroke-[1.5] text-slate-400 dark:text-slate-500" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md shadow-xs ${getCategoryBadgeClass(
                course.category
              )}`}
            >
              {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
            </span>
            {course.target_score ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md shadow-xs bg-teal-500/20 text-teal-100 border-teal-500/30">
                🎯 {course.target_score}+
              </span>
            ) : null}
          </div>

          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs ${
                course.is_published
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30'
                  : 'bg-slate-900/60 text-slate-300 border-slate-700/80'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  course.is_published ? 'bg-emerald-400' : 'bg-slate-400'
                }`}
              />
              {course.is_published ? (isVi ? 'Đã xuất bản' : 'Published') : isVi ? 'Bản nháp' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3.5">
          <div>
            <h3
              className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
              onClick={() => onEdit(course.id)}
            >
              {course.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {isVi ? 'Mục tiêu' : 'Target'}
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                <Target className="w-3 h-3 shrink-0" />
                <span>{course.target_score ? `${course.target_score}+` : '-'}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {isVi ? 'Cấu trúc' : 'Curriculum'}
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                <BookMarked className="w-3 h-3 text-slate-400 shrink-0" />
                <span>
                  {course.total_modules}c · {course.total_lessons}b
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {isVi ? 'Học viên' : 'Learners'}
              </span>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                <Users className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{formatNumber(course.enrollments)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div>
          {effectivePrice > 0 ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                  {formatCurrency(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              {hasDiscount && originalPrice > 0 && (
                <span className="text-[10px] text-slate-400 line-through font-medium pl-1 mt-0.5">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              {isVi ? 'Miễn phí' : 'Free'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onViewScores && (
            <button
              onClick={() => onViewScores(course)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
              title={isVi ? 'Xem bảng điểm & tiến độ học viên' : 'Learner Scores & Progress'}
              type="button"
            >
              <GraduationCap className="w-4 h-4" />
            </button>
          )}
          {onViewSubmissions && (
            <button
              onClick={() => onViewSubmissions(course)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
              title={isVi ? 'Xem bài nộp Speaking & Writing' : 'Speaking & Writing Submissions'}
              type="button"
            >
              <Headphones className="w-4 h-4" />
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onEdit(course.id)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
              title={isVi ? 'Chỉnh sửa khóa học' : 'Edit Course'}
              type="button"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <Popconfirm
              title={isVi ? 'Xóa khóa học này?' : 'Delete this course?'}
              description={
                isVi
                  ? 'Hành động này không thể hoàn tác.'
                  : 'This action cannot be undone.'
              }
              okText={isVi ? 'Xóa' : 'Delete'}
              cancelText={isVi ? 'Hủy' : 'Cancel'}
              okType="danger"
              placement="topRight"
              onConfirm={() => onDelete(course.id)}
            >
              <button
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer shadow-2xs"
                title={isVi ? 'Xóa khóa học' : 'Delete Course'}
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  )
}
