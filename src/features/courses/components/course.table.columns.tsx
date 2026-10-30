// Component cấu hình cột bảng dữ liệu danh sách khóa học cho Quản trị Admin.

import { BookOpen, Target, Layers, Users, Headphones, GraduationCap } from 'lucide-react'
import { Button, Tooltip } from 'antd'
import type { Course } from '@/features/courses/data/courses.data'
import { categoryLabels } from '@/features/courses/data/courses.data'
import type { DataTableColumn } from '@/components/data.table'
import { TableRowActions } from '@/components/table.row.actions'
import { getCategoryBadgeClass } from '@/features/courses/helpers/course.helper'
import { formatCurrency, formatNumber } from '@/lib/format'
import { resolveMediaUrl } from '@/lib/media.utils'

interface GetCourseColumnsOptions {
  isVi: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: (courseId: string) => void
  onDelete: (courseId: string) => Promise<void> | void
  onViewSubmissions?: (course: Course) => void
  onViewStudentScores?: (course: Course) => void
}

export function getCourseColumns({
  isVi,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onViewSubmissions,
  onViewStudentScores,
}: GetCourseColumnsOptions): DataTableColumn<Course>[] {
  return [
    {
      key: 'info',
      title: isVi ? 'Thông tin khóa học' : 'Course Info',
      minWidth: 280,
      sortable: true,
      render: (course) => (
        <div className="flex items-center gap-3.5 py-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:bg-slate-950 overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative group">
            {course.thumbnail_url ? (
              <img
                src={resolveMediaUrl(course.thumbnail_url)}
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
                title={course.title}
                onClick={() => onEdit(course.id)}
              >
                {course.title}
              </p>
            </div>
            <p
              className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5"
              title={course.description || undefined}
            >
              {course.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: isVi ? 'Danh mục' : 'Category',
      width: 140,
      align: 'center',
      sortable: true,
      render: (course) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap shadow-2xs ${getCategoryBadgeClass(course.category)}`}
        >
          {categoryLabels[course.category]?.[isVi ? 'vi' : 'en'] || course.category}
        </span>
      ),
    },
    {
      key: 'target_score',
      title: isVi ? 'Mục tiêu điểm' : 'Target Score',
      width: 140,
      align: 'center',
      sortable: true,
      render: (course) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border whitespace-nowrap shadow-2xs bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60">
          <Target className="w-3.5 h-3.5 text-teal-500 shrink-0" />
          <span>{course.target_score ? `${course.target_score}+ Điểm` : 'Chưa đặt'}</span>
        </span>
      ),
    },
    {
      key: 'stats',
      title: isVi ? 'Số bài & Học viên' : 'Lessons & Learners',
      width: 170,
      render: (course) => (
        <div className="space-y-1 py-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-750 dark:text-slate-200 whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              {isVi
                ? `${course.total_modules} chương · ${course.total_lessons} bài học`
                : `${course.total_modules} modules · ${course.total_lessons} lessons`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              {formatNumber(course.enrollments)}{' '}
              {isVi ? 'học viên' : 'learners'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      title: isVi ? 'Học phí' : 'Price',
      width: 130,
      align: 'center',
      sortable: true,
      render: (course) => {
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

        const discountPercent = hasDiscount && originalPrice > 0
          ? Math.round((1 - effectivePrice / originalPrice) * 100)
          : 0

        return (
          <div className="whitespace-nowrap py-1">
            {effectivePrice > 0 ? (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center font-extrabold text-xs px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                    {formatCurrency(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                {hasDiscount && originalPrice > 0 && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through font-medium pl-1">
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
        )
      },
    },
    {
      key: 'enrollments',
      title: isVi ? 'Học viên' : 'Students',
      width: 140,
      align: 'center',
      sortable: true,
      render: (course) => (
        <div className="whitespace-nowrap py-1">
          <button
            onClick={() => onViewStudentScores?.(course)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 border border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700 font-bold text-xs transition-all cursor-pointer shadow-2xs group"
            title={isVi ? 'Xem bảng điểm & tiến độ học viên của khóa này' : 'View student scores & progress'}
            type="button"
          >
            <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span>{formatNumber(course.enrollments || 0)} {isVi ? 'học viên' : 'learners'}</span>
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      title: isVi ? 'Trạng thái' : 'Status',
      width: 130,
      align: 'center',
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
            {course.is_published
              ? (isVi ? 'Đã xuất bản' : 'Published')
              : (isVi ? 'Bản nháp' : 'Draft')}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao tác' : 'Actions',
      width: 130,
      align: 'center',
      fixed: 'right',
      render: (course) => (
        <TableRowActions
          isVi={isVi}
          onEdit={canEdit ? () => onEdit(course.id) : undefined}
          onDelete={canDelete ? () => onDelete(course.id) : undefined}
          deleteTitle={isVi ? 'Xóa khóa học này?' : 'Delete this course?'}
          deleteDescription={isVi ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.'}
          extraActions={
            <>
              {onViewStudentScores && (
                <Tooltip title={isVi ? 'Xem bảng điểm & tiến độ học viên' : 'View student scores & progress'}>
                  <Button
                    size="small"
                    icon={<GraduationCap size={14} />}
                    onClick={() => onViewStudentScores(course)}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  />
                </Tooltip>
              )}
              {onViewSubmissions && (
                <Tooltip title={isVi ? 'Xem bài nộp Speaking & Writing' : 'View submissions'}>
                  <Button
                    size="small"
                    icon={<Headphones size={14} />}
                    onClick={() => onViewSubmissions(course)}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  />
                </Tooltip>
              )}
            </>
          }
        />
      ),
    },
  ]
}
