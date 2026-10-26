// Component hiển thị kết quả bài test đầu vào và lịch sử thi TOEIC của học viên trong trang hồ sơ.
import { useState } from 'react'
import {
  Trophy,
  Headphones,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react'
import { useAdminUserAttemptsQuery } from '@/features/exams/hooks/use.exams.admin.query'
import { PlacementAttemptDetailModal } from '@/features/exams/components/placement.attempt.detail.modal'
import type { UserProfile } from '@/features/users/schemas/user.schema'

interface LearnerExamHistorySectionProps {
  userId: string
  userProfile?: UserProfile | null
}

export function LearnerExamHistorySection({
  userId,
  userProfile,
}: LearnerExamHistorySectionProps) {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const { data: attempts = [], isLoading } = useAdminUserAttemptsQuery(userId)

  const placementScore = userProfile?.placement_test_score ?? 0
  const listeningScore = userProfile?.placement_listening_score ?? 0
  const readingScore = userProfile?.placement_reading_score ?? 0
  const testedAt = userProfile?.placement_tested_at
  const hasPlacementTest = placementScore > 0 || attempts.some((a) => a.attempt_type === 'PLACEMENT' || a.exam_type === 'DIAGNOSTIC_TEST')

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '0 phút'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}p ${secs}s`
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getScoreBand = (score: number) => {
    if (score >= 855) return { text: 'C1 Nâng Cao', color: 'text-purple-600 bg-purple-500/10 border-purple-500/20' }
    if (score >= 785) return { text: 'B2+ Giao Tiếp', color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20' }
    if (score >= 550) return { text: 'B1 Trung Cấp', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' }
    if (score >= 255) return { text: 'A2 Sơ Cấp', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' }
    return { text: 'A1 Bắt Đầu', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Đánh Giá Năng Lực Đầu Vào TOEIC
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Điểm số bài kiểm tra trình độ ban đầu để thiết lập lộ trình học tập cá nhân hóa
              </p>
            </div>
          </div>

          {hasPlacementTest && placementScore > 0 && (
            <div className={`px-3 py-1 rounded-xl text-xs font-bold border self-start sm:self-auto ${getScoreBand(placementScore).color}`}>
              {getScoreBand(placementScore).text}
            </div>
          )}
        </div>

        {hasPlacementTest && placementScore > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Tổng điểm đầu vào
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {placementScore}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 990</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <Headphones className="w-3.5 h-3.5" />
                <span>Listening</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {listeningScore} <span className="text-xs font-normal text-slate-400">/ 495</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Reading</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {readingScore} <span className="text-xs font-normal text-slate-400">/ 495</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Ngày kiểm tra</span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5 truncate">
                {formatDateTime(testedAt ?? undefined)}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Học viên chưa thực hiện bài kiểm tra đầu vào
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Điểm số sẽ được cập nhật tự động ngay khi học viên hoàn thành bài test đầu vào.
            </p>
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Lịch Sử Thi & Luyện Đề TOEIC
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toàn bộ các lần thi thử, bài test đầu vào và kết quả chi tiết từng lần làm
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {attempts.length} lượt thi
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Đang tải lịch sử thi...</span>
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
            <Award className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Chưa có dữ liệu lượt thi nào
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Học viên chưa nộp bài thi TOEIC nào trên hệ thống.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-200 font-bold text-[13px] tracking-wide">
                    <th className="py-3 px-4 text-center">Bài thi</th>
                    <th className="py-3 px-4 text-center">Loại đề</th>
                    <th className="py-3 px-4 text-center">Điểm TOEIC</th>
                    <th className="py-3 px-4 text-center">Kỹ năng (L / R)</th>
                    <th className="py-3 px-4 text-center">Độ chính xác</th>
                    <th className="py-3 px-4 text-center">Thời gian</th>
                    <th className="py-3 px-4 text-center">Ngày nộp</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {attempts.map((att) => {
                    const isPlacement = att.attempt_type === 'PLACEMENT' || att.exam_type === 'DIAGNOSTIC_TEST'
                    const badge = getScoreBand(att.total_scaled_score)
                    return (
                      <tr key={att._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {att.exam_title || 'Đề thi TOEIC'}
                          </p>
                          <span className="text-[10px] text-slate-400">{att.exam_code}</span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isPlacement
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {isPlacement ? <Sparkles className="w-3 h-3" /> : null}
                            <span>{isPlacement ? 'Test đầu vào' : 'Luyện đề Full'}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                              {att.total_scaled_score}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{att.listening_scaled_score}</span>
                          <span className="mx-1 text-slate-300">/</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{att.reading_scaled_score}</span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{att.correct_questions}/{att.total_questions}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDuration(att.total_time_seconds)}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">
                          {formatDateTime(att.submitted_at || att.created_at)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedAttemptId(att._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <PlacementAttemptDetailModal
        attemptId={selectedAttemptId}
        isOpen={Boolean(selectedAttemptId)}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  )
}
