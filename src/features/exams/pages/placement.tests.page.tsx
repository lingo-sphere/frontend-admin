// Trang quản lý chuyên biệt 2 đề thi đánh giá năng lực đầu vào hệ thống và kết quả làm bài của học viên.

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Trophy,
  Award,
  Users,
  Headphones,
  Mic,
  Sparkles,
  Clock,
  FileText,
  RotateCcw,
  ShieldCheck,
  Edit3,
  Flame,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useAdminExamsQuery, useUpdateExamMutation, useAdminPlacementAttemptsQuery, useDeleteExamMutation } from '@/features/exams/hooks/use.exams.admin.query'
import { PlacementAttemptsTable } from '@/features/exams/components/placement.attempts.table'
import { PlacementExamsTable } from '@/features/exams/components/placement.exams.table'
import { StatCard } from '@/components/stat.card'
import { AdminTabs } from '@/components/admin.tabs'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { toast } from '@/store/toast.store'

type TabType = 'system-exams' | 'student-attempts'

export function PlacementTestsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('system-exams')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFeaturedCollapsed, setIsFeaturedCollapsed] = useState<boolean>(() => {
    return storage.get<boolean>(STORAGE_KEYS.PLACEMENT_FEATURED_COLLAPSED, false) ?? false
  })

  const handleToggleFeaturedCollapse = () => {
    setIsFeaturedCollapsed((prev) => {
      const next = !prev
      storage.set(STORAGE_KEYS.PLACEMENT_FEATURED_COLLAPSED, next)
      return next
    })
  }

  const placementQueryParams = useMemo(() => ({ isSystemPlacement: 'true' }), [])
  const { data: allExams = [], isLoading: isLoadingExams, refetch: refetchExams } = useAdminExamsQuery(placementQueryParams)
  const updateExamMutation = useUpdateExamMutation()
  const deleteExamMutation = useDeleteExamMutation()

  const { data: attemptsData, refetch: refetchAttempts } = useAdminPlacementAttemptsQuery({
    page: 1,
    limit: 1,
  })
  const stats = attemptsData?.stats

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refetchExams(), refetchAttempts()])
      toast.success(isVi ? 'Đã làm mới dữ liệu đề thi đầu vào!' : 'Placement test data refreshed!')
    } finally {
      setIsRefreshing(false)
    }
  }

  const placementExams = useMemo(() => {
    return allExams.filter((e) => {
      const raw = e as Record<string, unknown>
      return Boolean(
        e.is_system_placement ||
        raw.is_system_placement ||
        e.type === 'DIAGNOSTIC_TEST' ||
        raw.exam_type === 'DIAGNOSTIC_TEST'
      )
    })
  }, [allExams])

  const twoSkillsExam = useMemo(() => {
    return (
      placementExams.find(
        (e) =>
          e.is_published &&
          (e.skills_enabled === 'LR' ||
            e.placement_type === '2SKILLS' ||
            (Boolean(e.title) && e.title.includes('2 Kỹ Năng')))
      ) ||
      placementExams.find(
        (e) =>
          e.skills_enabled === 'LR' ||
          e.placement_type === '2SKILLS' ||
          (Boolean(e.title) && e.title.includes('2 Kỹ Năng'))
      )
    )
  }, [placementExams])

  const fourSkillsExam = useMemo(() => {
    return (
      placementExams.find(
        (e) =>
          e.is_published &&
          (e.skills_enabled === 'ALL' ||
            e.placement_type === '4SKILLS' ||
            e.skills_enabled === 'LRWS' ||
            (Boolean(e.title) && e.title.includes('4 Kỹ Năng')))
      ) ||
      placementExams.find(
        (e) =>
          e.skills_enabled === 'ALL' ||
          e.placement_type === '4SKILLS' ||
          e.skills_enabled === 'LRWS' ||
          (Boolean(e.title) && e.title.includes('4 Kỹ Năng'))
      )
    )
  }, [placementExams])

  const systemExamsCount = placementExams.length

  const handleManageQuestions = (exam: ToeicExamItem) => {
    storage.session.set(STORAGE_KEYS.ACTIVE_EXAM, exam)
    navigate(`/practice/placement-tests/${exam._id}/questions`)
  }

  const handleCreatePlacementExam = (type: '2SKILLS' | '4SKILLS') => {
    storage.session.remove(STORAGE_KEYS.ACTIVE_EXAM)
    navigate(`/practice/placement-tests/create?type=${type}`)
  }

  const handleDeleteExam = async (id: string) => {
    try {
      await deleteExamMutation.mutateAsync(id)
      toast.success(isVi ? 'Đã xóa đề thi đầu vào thành công!' : 'Placement test deleted!')
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (isVi ? 'Không thể xóa đề thi đầu vào.' : 'Failed to delete exam.')
      toast.error(msg)
    }
  }

  const handleTogglePublish = async (exam: ToeicExamItem, nextStatus: boolean) => {
    const examId = exam._id
    if (!examId) return

    try {
      if (nextStatus) {
        const isFour =
          exam.skills_enabled === 'ALL' ||
          exam.skills_enabled === 'LRWS' ||
          exam.placement_type === '4SKILLS' ||
          (Boolean(exam.title) && exam.title.includes('4 Kỹ Năng'))

        const conflicting = placementExams.find((e) => {
          if (e._id === examId || !e.is_published) return false
          const eIsFour =
            e.skills_enabled === 'ALL' ||
            e.skills_enabled === 'LRWS' ||
            e.placement_type === '4SKILLS' ||
            (Boolean(e.title) && e.title.includes('4 Kỹ Năng'))
          return isFour ? eIsFour : !eIsFour
        })

        if (conflicting && conflicting._id) {
          await updateExamMutation.mutateAsync({
            id: conflicting._id,
            dto: { is_published: false },
          })
        }
      }

      await updateExamMutation.mutateAsync({
        id: examId,
        dto: { is_published: nextStatus },
      })
      toast.success(
        nextStatus
          ? (isVi ? 'Đã kích hoạt xuất bản bài thi đầu vào công khai!' : 'Placement test published!')
          : (isVi ? 'Đã chuyển bài thi về bản nháp / ẩn khỏi hệ thống!' : 'Placement test set to draft!')
      )
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (isVi ? 'Không thể cập nhật trạng thái xuất bản bài thi.' : 'Failed to update status.')
      toast.error(msg)
    }
  }

  const handleViewLearnerProfile = (userId: string) => {
    navigate(`/users/${userId}`)
  }

  const renderExamCard = (
    exam: ToeicExamItem | undefined,
    type: '2SKILLS' | '4SKILLS',
    defaultTitle: string,
    description: string
  ) => {
    const isTwoSkills = type === '2SKILLS'
    const qCount = exam
      ? Array.isArray(exam.questions) && exam.questions.length > 0
        ? exam.questions.length
        : exam.total_questions || 0
      : 0

    const duration = exam?.duration_minutes || 0
    const isPublished = exam?.is_published ?? false
    const totalAttempts = exam?.total_attempts || 0
    const avgScore = exam?.avg_score || 0

    return (
      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
        <div
          className={`h-2 w-full ${
            isTwoSkills
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
              : 'bg-gradient-to-r from-purple-500 to-fuchsia-600'
          }`}
        />

        <div className="p-6 space-y-5 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isTwoSkills
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900'
                    : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900'
                }`}
              >
                {isTwoSkills ? <Headphones className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isTwoSkills
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {isTwoSkills ? (
                      <>
                        <Headphones className="w-3 h-3" />
                        <span>{isVi ? '2 Kỹ Năng (LR)' : '2 Skills (LR)'}</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" />
                        <span>{isVi ? '4 Kỹ Năng (Full Skills)' : '4 Skills (Full Skills)'}</span>
                      </>
                    )}
                  </span>
                  {!exam ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {isVi ? 'Chưa khởi tạo' : 'Not initialized'}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {isPublished
                        ? (isVi ? 'Đang công khai' : 'Published')
                        : (isVi ? 'Bản nháp / Ẩn' : 'Draft / Hidden')}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                  {exam?.title || defaultTitle}
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[36px]">
            {description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{isVi ? 'Thời gian' : 'Duration'}</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {exam && duration > 0 ? `${duration} ${isVi ? 'phút' : 'mins'}` : '-'}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{isVi ? 'Số câu hỏi' : 'Questions'}</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {exam && qCount > 0 ? `${qCount} ${isVi ? 'câu' : 'qs'}` : '-'}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{isVi ? 'Lượt thi' : 'Attempts'}</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {exam ? totalAttempts.toLocaleString() : '-'}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>{isVi ? 'Điểm TB' : 'Avg Score'}</span>
              </div>
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {exam && avgScore > 0 ? `${avgScore}/990` : '-'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isVi ? 'Trạng thái phát hành:' : 'Publish status:'}
            </span>
            {exam ? (
              <button
                type="button"
                onClick={() => handleTogglePublish(exam, !isPublished)}
                disabled={updateExamMutation.isPending}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            ) : (
              <span className="text-amber-500 font-semibold text-xs">
                {isVi ? 'Chưa khởi tạo' : 'Not created'}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {exam?._id ? `ID: ${exam._id}` : (isVi ? 'Chưa có bản ghi trong hệ thống' : 'Not created in system')}
          </div>

          {exam ? (
            <button
              type="button"
              onClick={() => handleManageQuestions(exam)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isVi ? 'Soạn câu hỏi & Cấu hình' : 'Edit Questions & Config'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleCreatePlacementExam(type)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVi ? 'Khởi tạo đề thi mới' : 'Initialize Exam'}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {isVi ? 'Quản Lý Đề Thi Đầu Vào Hệ Thống' : 'System Placement Tests Management'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isVi ? 'Hệ Thống Đánh Giá Năng Lực' : 'Diagnostic Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isVi
              ? 'Quản lý 2 đề thi đầu vào tiêu chuẩn (2 Kỹ năng LR & 4 Kỹ năng Full Skills), theo dõi thống kê và phân tích kết quả bài làm học viên'
              : 'Manage the 2 official placement tests (2 Skills LR & 4 Skills Full Skills), monitor stats and student attempt performance'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            title={isVi ? 'Làm mới dữ liệu' : 'Refresh Data'}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingExams ? 'animate-spin text-indigo-500' : ''}`} />
            <span>{isVi ? 'Làm mới' : 'Refresh'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCreatePlacementExam('2SKILLS')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isVi ? 'Tạo đề 2 Kỹ Năng' : 'New 2-Skill Exam'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCreatePlacementExam('4SKILLS')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVi ? 'Tạo đề 4 Kỹ Năng' : 'New 4-Skill Exam'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isVi ? 'Tổng lượt thi' : 'Total Attempts'}
          value={stats ? stats.total_attempts.toLocaleString() : '0'}
          subtitle={isVi ? 'Số bài kiểm tra đầu vào đã nộp' : 'Submitted placement tests'}
          icon={Trophy}
          color="indigo"
          trend={stats && stats.total_attempts > 0 ? `${stats.total_attempts}` : undefined}
          trendType="neutral"
        />

        <StatCard
          title={isVi ? 'Học viên tham gia' : 'Learners Evaluated'}
          value={stats ? stats.unique_learners_count.toLocaleString() : '0'}
          subtitle={isVi ? 'Học viên hoàn thành bài test' : 'Learners completed test'}
          icon={Users}
          color="emerald"
          trend={stats && stats.unique_learners_count > 0 ? `${stats.unique_learners_count}` : undefined}
          trendType="up"
        />

        <StatCard
          title={isVi ? 'Điểm TB toàn hệ thống' : 'System Avg Score'}
          value={stats && stats.avg_total_score > 0 ? stats.avg_total_score : '-'}
          subtitle={isVi ? 'Thang điểm chuẩn 990 ETS' : 'Out of 990 ETS scale'}
          icon={Award}
          color="purple"
          trend={stats && stats.avg_total_score > 0 ? `${stats.avg_total_score}/990` : undefined}
          trendType="neutral"
        />

        <StatCard
          title={isVi ? 'Điểm cao nhất' : 'Highest Score'}
          value={stats && stats.highest_score > 0 ? stats.highest_score : '-'}
          subtitle={isVi ? 'Kỷ lục điểm số đầu vào' : 'Record score achieved'}
          icon={Flame}
          color="amber"
          trend={stats && stats.highest_score > 0 ? `${stats.highest_score}/990` : undefined}
          trendType="neutral"
        />
      </div>

      <AdminTabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as TabType)}
        items={[
          {
            key: 'system-exams',
            label: isVi ? 'Đề Thi Đầu Vào Hệ Thống' : 'System Placement Tests',
            icon: Sparkles,
            count: systemExamsCount,
          },
          {
            key: 'student-attempts',
            label: isVi ? 'Kết Quả Làm Bài Học Viên' : 'Learner Attempt Results',
            icon: Users,
            count: stats && stats.total_attempts > 0 ? stats.total_attempts : undefined,
          },
        ]}
      />

      {activeTab === 'system-exams' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden transition-all">
            <div
              onClick={handleToggleFeaturedCollapse}
              className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {isVi ? 'Đề Thi Tiêu Chuẩn Áp Dụng Toàn Hệ Thống' : 'Official System Placement Standards'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                      {isVi ? '2 bài thi chính thức' : '2 Official Tests'}
                    </span>
                    {isFeaturedCollapsed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {isVi ? 'Đang thu gọn' : 'Collapsed'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {isVi
                      ? 'Quy tắc xuất bản và 2 bài thi đánh giá năng lực chính thức (2 Kỹ Năng & 4 Kỹ Năng)'
                      : 'Publishing policy and the 2 official diagnostic tests (2 Skills & 4 Skills)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFeaturedCollapse()
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title={isFeaturedCollapsed ? (isVi ? 'Mở rộng hiển thị' : 'Expand') : (isVi ? 'Thu gọn hiển thị' : 'Collapse')}
                >
                  {isFeaturedCollapsed ? (
                    <>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                      <span>{isVi ? 'Mở rộng' : 'Expand'}</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                      <span>{isVi ? 'Thu gọn' : 'Collapse'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isFeaturedCollapsed
                  ? 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  : 'grid-rows-[1fr] opacity-100 border-t border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-5 space-y-5 bg-slate-50/40 dark:bg-slate-950/20">
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                      <p className="font-bold">
                        {isVi
                          ? 'Quy tắc xuất bản bài thi đầu vào hệ thống:'
                          : 'System Placement Publishing Policy:'}
                      </p>
                      <p className="leading-relaxed opacity-90">
                        {isVi
                          ? 'Hệ thống duy trì duy nhất 1 bài thi Công khai cho loại 2 Kỹ Năng (Listening & Reading) và 1 bài thi Công khai cho loại 4 Kỹ Năng (Full Skills). Học viên sau khi hoàn thành bài test sẽ nhận được gợi ý khóa học cá nhân hóa tương ứng với trình độ CEFR/ETS đạt được.'
                          : 'The system maintains exactly 1 active public test for 2 Skills (LR) and 1 for 4 Skills (Full). Learners completing the test receive personalized course recommendations matched to their achieved CEFR/ETS score bracket.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {renderExamCard(
                      twoSkillsExam,
                      '2SKILLS',
                      isVi
                        ? 'Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC 2 Kỹ Năng (LR)'
                        : 'TOEIC 2-Skill Placement Test (Listening & Reading)',
                      isVi
                        ? 'Đánh giá tốc độ và độ chính xác của 2 kỹ năng Nghe hiểu & Đọc hiểu theo thang điểm 10 - 990. Tự động phân loại trình độ A1 - C1 và đề xuất khóa học tương ứng.'
                        : 'Assess speed and accuracy for Listening & Reading on the 10 - 990 ETS scale. Automatically classifies learners into A1 - C1 and recommends suitable courses.'
                    )}

                    {renderExamCard(
                      fourSkillsExam,
                      '4SKILLS',
                      isVi
                        ? 'Đề Thi Đánh Giá Năng Lực Đầu Vào TOEIC 4 Kỹ Năng (Full Skills)'
                        : 'TOEIC 4-Skill Comprehensive Placement Test (L-R-S-W)',
                      isVi
                        ? 'Khảo sát toàn diện 4 kỹ năng Nghe, Đọc kèm công nghệ AI phân tích ngữ âm, độ lưu loát phần Nói (Speaking) và ngữ pháp cấu trúc phần Viết (Writing).'
                        : 'Comprehensive 4-skill evaluation with AI speech analysis for pronunciation, fluency in Speaking, and grammar structure analysis in Writing.'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <PlacementExamsTable
            exams={placementExams}
            isVi={isVi}
            onManageQuestions={handleManageQuestions}
            onTogglePublish={handleTogglePublish}
            onDeleteExam={handleDeleteExam}
            onCreateExam={handleCreatePlacementExam}
            isMutatingPublish={updateExamMutation.isPending}
            active2SkillsExamId={twoSkillsExam?._id}
            active4SkillsExamId={fourSkillsExam?._id}
          />
        </div>
      )}

      {activeTab === 'student-attempts' && (
        <div className="animate-in fade-in duration-150">
          <PlacementAttemptsTable onViewLearnerProfile={handleViewLearnerProfile} />
        </div>
      )}
    </div>
  )
}
