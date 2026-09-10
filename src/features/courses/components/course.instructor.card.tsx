/**
 * @file course.instructor.card.tsx
 * @description Card hiển thị thông tin Giảng viên / Quản trị viên phụ trách khóa học kèm modal phóng to avatar
 */

import { useState } from 'react'
import { UserCheck, X } from 'lucide-react'
import type { CourseFormData } from '@/features/courses/components/course.basic.info.tab'

interface CourseInstructorCardProps {
  formData: CourseFormData
  isVi: boolean
}

export function CourseInstructorCard({ formData, isVi }: CourseInstructorCardProps) {
  const [previewAvatarModal, setPreviewAvatarModal] = useState(false)

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isVi ? 'Thông tin người tạo / Giảng viên phụ trách' : 'Instructor & Creator Information'}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {isVi ? 'Chỉ xem' : 'Read-only'}
          </span>
        </div>

        <div className="flex items-center gap-3.5 pt-1">
          <div className="shrink-0">
            {formData.author_avatar ? (
              <button
                type="button"
                onClick={() => setPreviewAvatarModal(true)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform hover:scale-105"
                title={isVi ? 'Bấm vào ảnh để phóng to xem' : 'Click to zoom avatar'}
              >
                <img
                  src={formData.author_avatar}
                  alt={formData.author_name || 'Avatar'}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs group-hover:opacity-90 transition-all dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                />
              </button>
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-900/40">
                {formData.author_name ? formData.author_name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                {isVi ? 'Họ tên Giảng viên' : 'Instructor Name'}
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {formData.author_name || (isVi ? 'Giảng viên LingoSphere' : 'Instructor')}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                {isVi ? 'Chức danh / Học vị' : 'Academic Title'}
              </span>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                {formData.author_title || (isVi ? 'Giảng viên chuyên môn' : 'Lecturer')}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-400">
            {isVi ? 'Email liên hệ:' : 'Email:'}
          </span>
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[240px]">
            {formData.author_email || 'admin@lingosphere.edu.vn'}
          </span>
        </div>
      </div>

      {previewAvatarModal && formData.author_avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] p-4 animate-in fade-in duration-150 cursor-pointer"
          onClick={() => setPreviewAvatarModal(false)}
        >
          <div
            className="relative max-w-md max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 truncate">
                {formData.author_name || (isVi ? 'Ảnh đại diện Giảng viên' : 'Instructor Avatar')}
              </span>
              <button
                type="button"
                onClick={() => setPreviewAvatarModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/40 rounded-2xl mt-1">
              <img
                src={formData.author_avatar}
                alt={formData.author_name || 'Avatar'}
                className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
