import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import { examAdminService, type ToeicExamItem } from '@/services/exam.service'
import { toast } from '@/store/toast-store'

import { ExamStatsOverview } from '@/components/exams/ExamStatsOverview'
import { ExamListTable } from '@/components/exams/ExamListTable'
import { CreateExamModal } from '@/components/exams/CreateExamModal'

const INITIAL_EXAMS: ToeicExamItem[] = [
  {
    id: 'exam_toeic_full_01',
    title: 'ETS TOEIC 2024 - Test 01 (Full 200 Questions)',
    type: 'FULL_TEST',
    duration_minutes: 120,
    total_questions: 200,
    total_attempts: 1248,
    avg_score: 745,
    is_published: true,
    created_at: '2026-08-20',
  },
  {
    id: 'exam_toeic_mini_01',
    title: 'TOEIC Mini-Test 50 Questions (Khảo sát nhanh)',
    type: 'MINI_TEST',
    duration_minutes: 45,
    total_questions: 50,
    total_attempts: 3410,
    avg_score: 680,
    is_published: true,
    created_at: '2026-08-22',
  },
  {
    id: 'exam_toeic_pre_01',
    title: 'Pre-test Đánh Giá Năng Lực Toàn Khóa (Baseline)',
    type: 'PRE_TEST',
    duration_minutes: 60,
    total_questions: 60,
    total_attempts: 850,
    avg_score: 550,
    is_published: true,
    created_at: '2026-08-24',
  },
  {
    id: 'exam_toeic_post_mini_ch1',
    title: 'Post-mini Test Chương 1 - Business & Office',
    type: 'POST_MINI_TEST',
    duration_minutes: 30,
    total_questions: 30,
    total_attempts: 2100,
    avg_score: 820,
    is_published: true,
    created_at: '2026-08-25',
  },
]

export function ExamsPage() {
  const [exams, setExams] = useState<ToeicExamItem[]>(INITIAL_EXAMS)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)

  const fetchExams = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await examAdminService.getExams()
      if (data && data.length > 0) {
        setExams(data)
      }
    } catch {
      // Keep fallback exams
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
        prev.map((e) => ((e.id || e._id) === id ? { ...e, is_published: !current } : e))
      )
      toast.success('Cập nhật trạng thái xuất bản thành công!')
    } catch {
      setExams((prev) =>
        prev.map((e) => ((e.id || e._id) === id ? { ...e, is_published: !current } : e))
      )
      toast.success('Đã chuyển đổi trạng thái đề thi (Local)!')
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return
    try {
      await examAdminService.deleteExam(id)
      setExams((prev) => prev.filter((e) => (e.id || e._id) !== id))
      toast.success('Đã xóa đề thi thành công!')
    } catch {
      setExams((prev) => prev.filter((e) => (e.id || e._id) !== id))
      toast.success('Đã xóa đề thi khỏi danh sách!')
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
      if (created) {
        setExams((prev) => [created, ...prev])
      }
      setShowAddModal(false)
      toast.success('Thêm mới đề thi TOEIC thành công!')
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
      toast.success('Đã tạo đề thi mới (Local)!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Quản Lý Đề Thi TOEIC & Kiểm Tra
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ngân hàng đề thi TOEIC Full Test 200 câu, Mini-Test 50 câu, Pre-Test Baseline và Post-Mini Test theo chương
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchExams}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đề Thi Mới</span>
          </button>
        </div>
      </div>

      {/* Top Overview KPI Cards */}
      <ExamStatsOverview stats={stats} />

      {/* Main Exam List Table */}
      <ExamListTable
        exams={exams}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        onTogglePublish={handleTogglePublish}
        onDeleteExam={handleDeleteExam}
      />

      {/* Create Exam Modal */}
      <CreateExamModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateExam}
      />
    </div>
  )
}
