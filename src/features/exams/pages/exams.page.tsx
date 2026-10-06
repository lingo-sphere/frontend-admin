// Trang quản trị ngân hàng đề thi TOEIC và lịch sử làm đề thi TOEIC của học viên.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw, BookOpen, Trophy, Sparkles, GraduationCap } from 'lucide-react'
import { useReloadAnimation } from '@/hooks/use.reload.animation'
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
import { ToeicAiImportModal } from '@/features/exams/components/toeic.ai.import.modal'
import { ToeicAttemptsTable } from '@/features/exams/components/toeic.attempts.table'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export function ExamsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'exams' | 'attempts'>('exams')
  const queryParams = useMemo(() => ({ isSystemPlacement: 'false' }), [])
  const { data: rawExams = [], isLoading, refetch } = useAdminExamsQuery(queryParams)

  const exams = useMemo(() => {
    return rawExams.filter((exam) => {
      const raw = exam as unknown as { is_system_placement?: boolean; exam_type?: string; placement_type?: string }
      const isPlacement =
        exam.is_system_placement === true ||
        raw.is_system_placement === true ||
        exam.type === 'PRE_TEST' ||
        exam.type === 'DIAGNOSTIC_TEST' ||
        raw.exam_type === 'DIAGNOSTIC_TEST' ||
        Boolean(raw.placement_type) ||
        (typeof exam.code === 'string' && exam.code.toLowerCase().includes('placement')) ||
        (typeof exam.title === 'string' && (exam.title.toLowerCase().includes('đầu vào') || exam.title.toLowerCase().includes('đánh giá năng lực')))

      return !isPlacement
    })
  }, [rawExams])

  const { isReloading: isRefreshing, trigger: handleRefresh } = useReloadAnimation(refetch)
  const { mutateAsync: createExam } = useCreateExamMutation()
  const { mutateAsync: updateExam } = useUpdateExamMutation()
  const { mutateAsync: deleteExam } = useDeleteExamMutation()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showAiImportModal, setShowAiImportModal] = useState<boolean>(false)

  const handleManageQuestions = (exam: ToeicExamItem) => {
    storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, exam)
    navigate(`/practice/exams/${exam._id}/questions`)
  }

  const stats = useMemo(() => {
    const total = exams.length
    const published = exams.filter((e) => e.is_published).length
    const totalAttempts = exams.reduce((sum, e) => sum + (e.total_attempts || 0), 0)
    const scoredExams = exams.filter((e) => (e.avg_score || 0) > 0)
    const avgScore = scoredExams.length
      ? Math.round(scoredExams.reduce((sum, e) => sum + (e.avg_score || 0), 0) / scoredExams.length)
      : 0

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

  const handleCreateExam = async (title: string, type: string, duration: number, skillsEnabled: 'LR' | 'ALL' = 'LR') => {
    try {
      const created = await createExam({
        title,
        code: `exam_${Date.now()}`,
        type: type || 'FULL_TEST',
        exam_type: type || 'FULL_TEST',
        skills_enabled: skillsEnabled,
        duration_minutes: duration,
        is_published: true,
      })
      const examItem = created || {
        id: `exam_${Date.now()}`,
        title,
        type: type as ToeicExamItem['type'],
        skills_enabled: skillsEnabled,
        duration_minutes: duration,
        total_questions: type === 'FULL_TEST' ? 200 : 50,
        total_attempts: 0,
        avg_score: 0,
        is_published: true,
        created_at: new Date().toISOString().split('T')[0],
      }
      setShowAddModal(false)
      storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, examItem)
      navigate(`/practice/exams/${examItem._id}/questions`)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isVi ? 'Quản Lý Đề Thi TOEIC & Lịch Sử Luyện Đề' : 'TOEIC Exams & Practice History'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Quản lý ngân hàng đề thi TOEIC và theo dõi lịch sử làm bài, luyện đề của học viên'
              : 'Manage TOEIC exam bank and review student test attempts'}
          </p>
        </div>

        {activeTab === 'exams' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
              <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => setShowAiImportModal(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isVi ? 'Nhập đề thông minh (AI)' : 'AI Smart Importer'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isVi ? 'Thêm đề thi mới' : 'Create Exam'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'exams'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isVi ? 'Ngân hàng đề thi TOEIC' : 'TOEIC Exam Bank'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attempts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'attempts'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{isVi ? 'Lịch sử làm đề thi TOEIC của học viên' : 'Student TOEIC Practice History'}</span>
        </button>
      </div>

      {activeTab === 'exams' ? (
        <div className="space-y-6">
          <ExamStatsOverview stats={stats} />

          <ExamListTable
            exams={exams}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedSkill={selectedSkill}
            onSkillChange={setSelectedSkill}
            onTogglePublish={handleTogglePublish}
            onDeleteExam={handleDeleteExam}
            onManageQuestions={handleManageQuestions}
          />

          <CreateExamModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateExam}
          />

          <ToeicAiImportModal
            isOpen={showAiImportModal}
            onClose={() => setShowAiImportModal(false)}
            onSuccess={() => {
              handleRefresh()
            }}
          />
        </div>
      ) : (
        <ToeicAttemptsTable onViewLearnerProfile={(userId) => navigate(`/users/${userId}`)} />
      )}
    </div>
  )
}

