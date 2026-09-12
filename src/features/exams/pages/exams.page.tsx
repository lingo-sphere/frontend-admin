// Trang quản trị ngân hàng đề thi toàn hệ thống sử dụng TanStack Query.
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw } from 'lucide-react'
import { type ToeicExamItem } from '@/features/exams/services/exam.service'
import {
  useAdminExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
} from '@/features/exams/hooks/use.exams.admin.query'
import { toast } from '@/store/toast.store'
import { useNavigate } from 'react-router-dom'
import { ExamStatsOverview } from '@/features/exams/components/exam.stats.overview'
import { ExamListTable } from '@/features/exams/components/exam.list.table'
import { CreateExamModal } from '@/features/exams/components/create.exam.modal'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export function ExamsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const { data: exams = [], isLoading, refetch } = useAdminExamsQuery()
  const { mutateAsync: createExam } = useCreateExamMutation()
  const { mutateAsync: updateExam } = useUpdateExamMutation()
  const { mutateAsync: deleteExam } = useDeleteExamMutation()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)

  const handleManageQuestions = (exam: ToeicExamItem) => {
    storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, exam)
    navigate(`/course-exams/${exam._id || exam.id}/questions`)
  }

  const stats = useMemo(() => {
    const total = exams.length
    const published = exams.filter((e) => e.is_published).length
    const totalAttempts = exams.reduce((sum, e) => sum + (e.total_attempts || 0), 0)
    const scoredExams = exams.filter((e) => (e.avg_score || 0) > 0)
    const avgScore = scoredExams.length
      ? Math.round(scoredExams.reduce((sum, e) => sum + (e.avg_score || 0), 0) / scoredExams.length)
      : 720

    return { total, published, totalAttempts, avgScore }
  }, [exams])

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await updateExam({ id, dto: { is_published: !current } })
      toast.success(
        isVi
          ? 'Cập nhật trạng thái xuất bản thành công!'
          : 'Publish status updated successfully!'
      )
    } catch {
      toast.error(isVi ? 'Lỗi khi cập nhật trạng thái đề thi' : 'Failed to update exam status')
    }
  }

  const handleDeleteExam = async (id: string) => {
    try {
      await deleteExam(id)
      toast.success(isVi ? 'Đã xóa đề thi thành công!' : 'Exam deleted successfully!')
    } catch {
      toast.error(isVi ? 'Lỗi khi xóa đề thi' : 'Failed to delete exam')
    }
  }

  const handleCreateExam = async (title: string, type: string, duration: number) => {
    try {
      const created = await createExam({
        title,
        type: type || 'FULL_TEST',
        duration_minutes: duration,
        is_published: true,
      })
      const examItem = created || {
        id: `exam_${Date.now()}`,
        title,
        type: type as ToeicExamItem['type'],
        duration_minutes: duration,
        total_questions: type === 'FULL_TEST' ? 200 : 50,
        total_attempts: 0,
        avg_score: 0,
        is_published: true,
        created_at: new Date().toISOString().split('T')[0],
      }
      setShowAddModal(false)
      storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, examItem)
      navigate(`/course-exams/${examItem._id || examItem.id}/questions`)
      toast.success(
        isVi
          ? 'Đã tạo khung đề thi! Chuyển sang bước soạn câu hỏi...'
          : 'Created exam shell! Opening question bank editor...'
      )
    } catch {
      toast.error(
        isVi
          ? 'Không thể tạo đề thi lúc này. Vui lòng kiểm tra lại kết nối và thử lại.'
          : 'Failed to create exam. Please check your connection and try again.'
      )
    }
  }

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchSearch =
        !searchQuery ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof exam.code === 'string' && exam.code.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchType =
        selectedType === 'ALL' ||
        exam.type === selectedType ||
        (selectedType === 'MINI_TEST' && exam.type === 'PART_PRACTICE')

      return matchSearch && matchType
    })
  }, [exams, searchQuery, selectedType])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isVi ? 'Ngân Hàng Đề Thi TOEIC' : 'TOEIC Exam Bank'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Quản lý các đề thi Full Test, Mini Test và ngân hàng câu hỏi phục vụ học viên'
              : 'Manage Full Tests, Mini Tests, and question banks for learners'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Thêm đề thi mới' : 'Create Exam'}</span>
          </button>
        </div>
      </div>

      <ExamStatsOverview stats={stats} />

      <ExamListTable
        exams={filteredExams}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onTogglePublish={handleTogglePublish}
        onDeleteExam={handleDeleteExam}
        onManageQuestions={handleManageQuestions}
      />

      <CreateExamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateExam}
      />
    </div>
  )
}
