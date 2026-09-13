// Trang quan tri tao moi va chinh sua khoa hoc kem tinh nang nhap nhanh tu thu muc.

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { CourseBasicInfoTab } from '@/features/courses/components/course.basic.info.tab'
import { CourseCurriculumManager } from '@/features/courses/components/course.curriculum.manager'
import { VideoPreviewModal } from '@/components/video.preview.modal'
import { useCourseForm } from '@/features/courses/hooks/use.course.form'
import { CourseFormHeader } from '@/features/courses/components/course.form.header'
import { CourseFolderImportModal } from '@/features/courses/components/course.folder.import.modal'

interface CourseFormPageProps {
  editCourseId?: string
}

export function CourseFormPage({ editCourseId }: CourseFormPageProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)

  const {
    formData,
    setFormData,
    isEditMode,
    isLoading,
    isSubmitting,
    videoPreviewUrl,
    setVideoPreviewUrl,
    handleSubmit,
    totalLessons,
    totalDuration,
    courseFolder,
    setActiveNavItem,
  } = useCourseForm(editCourseId, isVi)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full px-[10px] pb-12">
      <CourseFormHeader
        isEditMode={isEditMode}
        isVi={isVi}
        modulesCount={formData.modules.length}
        totalLessons={totalLessons}
        totalDuration={totalDuration}
        onBack={() => setActiveNavItem('courses')}
        onOpenFolderImport={!isEditMode ? () => setIsFolderModalOpen(true) : undefined}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <CourseBasicInfoTab
          formData={formData}
          onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
          isVi={isVi}
          courseFolder={courseFolder}
        />

        <CourseCurriculumManager
          modules={formData.modules}
          onChange={(modules) => setFormData((prev) => ({ ...prev, modules }))}
          onPreviewVideo={(url) => setVideoPreviewUrl(url)}
          isVi={isVi}
          is4Skills={formData.category === 'TOEIC_4_SKILLS'}
          courseFolder={courseFolder}
        />

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveNavItem('courses')}
            className="flex items-center gap-2 h-11 px-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <span>{isVi ? 'Hủy Bỏ' : 'Cancel'}</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>
              {isSubmitting
                ? isVi
                  ? 'Đang lưu...'
                  : 'Saving...'
                : isVi
                ? 'Lưu Khóa Học'
                : 'Save Course'}
            </span>
          </button>
        </div>
      </form>

      {videoPreviewUrl && (
        <VideoPreviewModal
          isOpen={!!videoPreviewUrl}
          onClose={() => setVideoPreviewUrl(null)}
          videoUrl={videoPreviewUrl}
          isVi={isVi}
        />
      )}

      <CourseFolderImportModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onApply={(importedInfo, importedModules) => {
          setFormData((prev) => ({
            ...prev,
            ...importedInfo,
            modules: importedModules,
          }))
        }}
        isVi={isVi}
        courseFolder={courseFolder}
      />
    </div>
  )
}

