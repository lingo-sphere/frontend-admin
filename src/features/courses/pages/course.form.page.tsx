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
import { StickyFormActionBar } from '@/components/sticky.form.action.bar'

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

        <StickyFormActionBar
          title={formData.title || (isEditMode ? (isVi ? 'Khóa học' : 'Course') : (isVi ? 'Khóa học mới' : 'New course'))}
          statusText={isVi ? (isEditMode ? 'Đang chỉnh sửa:' : 'Đang tạo mới:') : (isEditMode ? 'Editing:' : 'Creating:')}
          badgeText={`${formData.modules.length} ${isVi ? 'chương' : 'chapters'} · ${totalLessons} ${isVi ? 'bài học' : 'lessons'}`}
          cancelText={isVi ? 'Hủy Bỏ' : 'Cancel'}
          saveText={isSubmitting ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu Khóa Học' : 'Save Course')}
          savingText={isVi ? 'Đang lưu...' : 'Saving...'}
          isSubmitting={isSubmitting}
          onCancel={() => setActiveNavItem('courses')}
        />
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

