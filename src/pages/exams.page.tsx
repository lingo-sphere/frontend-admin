/**
 * @file exams.page.tsx
 * @description Trang quản trị ExamsPage trong giao diện Admin
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, RotateCcw } from 'lucide-react'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast.store'

import { ExamStatsOverview } from '@/components/exams/exam.stats.overview'
import { ExamListTable } from '@/components/exams/exam.list.table'
import { CreateExamModal } from '@/components/exams/create.exam.modal'
import { ExamQuestionEditorModal } from '@/components/exams/exam.question.editor.modal'

export function ExamsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [exams, setExams] = useState<ToeicExamItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showQuestionsModal, setShowQuestionsModal] = useState<boolean>(false)
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState<ToeicExamItem | null>(null)

  const handleExamQuestionsUpdated = (updated: ToeicExamItem) => {
    const examId = updated._id || updated.id
    setExams((prev) =>
      prev.map((e) => ((e._id || e.id) === examId ? { ...e, ...updated } : e))
    )
    if (selectedExamForQuestions && (selectedExamForQuestions._id || selectedExamForQuestions.id) === examId) {
      setSelectedExamForQuestions((prev) => (prev ? { ...prev, ...updated } : null))
    }
  }

  const fetchExams = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await examAdminService.getExams()
      setExams(Array.isArray(data) ? data : [])
    } catch {
      setExams([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

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
      await examAdminService.updateExam(id, { is_published: !current })
      setExams((prev) =>
        prev.map((e) => ((e._id || e.id) === id ? { ...e, is_published: !current } : e))
      )
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
      await examAdminService.deleteExam(id)
      setExams((prev) => prev.filter((e) => (e._id || e.id) !== id))
      toast.success(isVi ? 'Đã xóa đề thi thành công!' : 'Exam deleted successfully!')
    } catch {
      toast.error(isVi ? 'Lỗi khi xóa đề thi' : 'Failed to delete exam')
    }
  }

  const handleCreateExam = async (title: string, type: string, duration: number) => {
    try {
      const created = await examAdminService.createExam({
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
      setExams((prev) => [examItem, ...prev])
      setShowAddModal(false)
      setSelectedExamForQuestions(examItem)
      setShowQuestionsModal(true)
      toast.success(
        isVi
          ? 'Đã tạo khung đề thi! Chuyển sang bước soạn câu hỏi...'
          : 'Created exam shell! Opening question bank editor...'
      )
    } catch {
      const fallbackExam: ToeicExamItem = {
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
      setExams((prev) => [fallbackExam, ...prev])
      setShowAddModal(false)
      setSelectedExamForQuestions(fallbackExam)
      setShowQuestionsModal(true)
      toast.success(
        isVi
          ? 'Đã tạo đề thi mới (Local)! Mời bạn soạn câu hỏi.'
          : 'Created new exam (Local)! Opening question editor.'
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isVi ? 'Quản Lý Đề Thi TOEIC & Kiểm Tra' : 'TOEIC Exam & Test Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Ngân hàng đề thi TOEIC Full Test 200 câu, Mini-Test 50 câu, Pre-Test Baseline và Post-Mini Test theo chương'
              : 'Question bank for TOEIC Full Test (200Q), Mini-Test (50Q), Baseline Pre-Test, and Chapter Post-Mini Tests'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchExams}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isVi ? 'Tạo Đề Thi Mới' : 'Create New Exam'}</span>
          </button>
        </div>
      </div>

      
      <ExamStatsOverview stats={stats} />

      
      <ExamListTable
        exams={exams}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onTogglePublish={handleTogglePublish}
        onDeleteExam={handleDeleteExam}
        onManageQuestions={(exam) => {
          setSelectedExamForQuestions(exam)
          setShowQuestionsModal(true)
        }}
      />

      
      <CreateExamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateExam}
      />

      
      <ExamQuestionEditorModal
        isOpen={showQuestionsModal}
        onClose={() => {
          setShowQuestionsModal(false)
          setSelectedExamForQuestions(null)
        }}
        exam={selectedExamForQuestions}
        onExamUpdated={handleExamQuestionsUpdated}
      />
    </div>
  )
}
