// Modal hiển thị chi tiết bài thi test đầu vào của học viên dành cho Admin.
import { useState, useMemo } from 'react'
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Headphones,
  BookOpen,
  Trophy,
  Clock,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Mic,
  PenTool,
  Volume2,
  Bot,
  Lightbulb,
  Edit3,
  Send,
  Loader2,
  Mail,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminAttemptResultQuery } from '@/features/exams/hooks/use.exams.admin.query'
import { examService, type AdminAttemptAnswer, type AdminAttemptQuestion } from '@/features/exams/services/exam.service'
import { resolveMediaUrl } from '@/lib/media.utils'
import { toast } from '@/store/toast.store'

interface PlacementAttemptDetailModalProps {
  attemptId: string | null
  isOpen: boolean
  onClose: () => void
}

export function PlacementAttemptDetailModal({
  attemptId,
  isOpen,
  onClose,
}: PlacementAttemptDetailModalProps) {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'SKIPPED'>('ALL')
  const [filterPart, setFilterPart] = useState<number | 'ALL'>('ALL')
  const [searchQuestion, setSearchQuestion] = useState<string>('')

  const [isEditingScore, setIsEditingScore] = useState(false)
  const [editListeningScore, setEditListeningScore] = useState<number>(0)
  const [editReadingScore, setEditReadingScore] = useState<number>(0)
  const [editTotalScore, setEditTotalScore] = useState<number>(0)
  const [editFeedback, setEditFeedback] = useState<string>('')
  const [editSendEmail, setEditSendEmail] = useState<boolean>(true)
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false)

  const { data, isLoading } = useAdminAttemptResultQuery(attemptId || '', isOpen)

  const attempt = data?.attempt
  const answers = data?.answers || []
  const partAnalysis = data?.part_analysis || []
  const learner = data?.learner

  const handleOpenEditScore = () => {
    if (!attempt) return
    setEditListeningScore(attempt.listening_scaled_score ?? 0)
    setEditReadingScore(attempt.reading_scaled_score ?? 0)
    setEditTotalScore(attempt.total_scaled_score ?? 0)
    setEditFeedback(attempt.teacher_feedback || '')
    setEditSendEmail(true)
    setIsEditingScore(true)
  }

  const handleListeningChange = (val: number) => {
    const clamped = Math.max(0, Math.min(495, isNaN(val) ? 0 : val))
    setEditListeningScore(clamped)
    setEditTotalScore(clamped + editReadingScore)
  }

  const handleReadingChange = (val: number) => {
    const clamped = Math.max(0, Math.min(495, isNaN(val) ? 0 : val))
    setEditReadingScore(clamped)
    setEditTotalScore(editListeningScore + clamped)
  }

  const handleSaveScore = async () => {
    if (!attemptId) return
    try {
      setIsSubmittingScore(true)
      await examService.updateAdminAttemptScore(attemptId, {
        listening_scaled_score: editListeningScore,
        reading_scaled_score: editReadingScore,
        total_scaled_score: editTotalScore,
        teacher_feedback: editFeedback.trim(),
        send_email: editSendEmail,
      })
      await queryClient.invalidateQueries({ queryKey: ['admin-attempt-result', attemptId] })
      await queryClient.invalidateQueries({ queryKey: ['admin-placement-attempts'] })
      toast.success(
        editSendEmail
          ? 'Đã cập nhật điểm bài thi và gửi email thông báo thành công cho học viên!'
          : 'Đã cập nhật điểm bài thi thành công!'
      )
      setIsEditingScore(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật điểm bài thi'
      toast.error(msg)
    } finally {
      setIsSubmittingScore(false)
    }
  }

  const getAudioSrc = (str?: string): string => {
    if (!str) return ''
    const trimmed = str.trim()
    if (/^data:audio/i.test(trimmed)) {
      const commaIdx = trimmed.indexOf(',')
      if (commaIdx !== -1) {
        const header = trimmed.substring(0, commaIdx).toLowerCase()
        const body = trimmed.substring(commaIdx + 1)
        return `${header},${body}`
      }
    }
    return resolveMediaUrl(trimmed)
  }

  const isAudioContent = (str?: string): boolean => {
    if (!str) return false
    const s = str.trim().toLowerCase()
    return (
      s.startsWith('data:audio/') ||
      s.startsWith('blob:') ||
      s.includes('audio/webm') ||
      s.includes('audio/mp3') ||
      s.includes('audio/wav') ||
      s.includes('audio/ogg') ||
      s.includes('audio/m4a') ||
      /\.(mp3|wav|ogg|webm|m4a|aac)(\?.*)?$/i.test(s)
    )
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '0 phút'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs} giây`
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
    if (score >= 855) return { text: 'Nâng Cao (C1)', color: 'text-purple-600 bg-purple-500/10 border-purple-500/20' }
    if (score >= 785) return { text: 'Tự Tin Giao Tiếp (B2+)', color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20' }
    if (score >= 550) return { text: 'Trung Cấp (B1)', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' }
    if (score >= 255) return { text: 'Sơ Cấp (A2)', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' }
    return { text: 'Mới Bắt Đầu (A1)', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' }
  }

  const filteredAnswers = useMemo(() => {
    return answers.filter((ans) => {
      const qObj = typeof ans.question_id === 'object' && ans.question_id !== null
        ? (ans.question_id as AdminAttemptQuestion)
        : null

      const isSkipped = !ans.selected_option
      const isCorrect = ans.is_correct
      const isIncorrect = !isCorrect && !isSkipped

      if (filterStatus === 'CORRECT' && !isCorrect) return false
      if (filterStatus === 'INCORRECT' && !isIncorrect) return false
      if (filterStatus === 'SKIPPED' && !isSkipped) return false

      if (filterPart !== 'ALL' && ans.part_number !== filterPart) return false

      if (searchQuestion.trim()) {
        const query = searchQuestion.toLowerCase().trim()
        const textEn = qObj?.question_text_en?.toLowerCase() || ''
        const textVi = qObj?.question_text_vi?.toLowerCase() || ''
        const qNum = String(ans.question_number)
        return textEn.includes(query) || textVi.includes(query) || qNum.includes(query)
      }

      return true
    })
  }, [answers, filterStatus, filterPart, searchQuestion])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/35 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Chi Tiết Bài Test Đầu Vào
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {attempt?.exam_code}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {attempt?.exam_title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Đang tải dữ liệu bài làm của học viên...
              </p>
            </div>
          ) : !attempt ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Không tìm thấy thông tin bài làm này.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Học Viên Thực Hiện
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                      {learner?.avatar_url ? (
                        <img
                          src={learner.avatar_url}
                          alt={learner.full_name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        learner?.full_name?.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {learner?.full_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {learner?.email}
                      </p>
                      {learner?.target_toeic_score ? (
                        <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                          Target: {learner.target_toeic_score}+
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDuration(attempt.total_time_seconds)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDateTime(attempt.submitted_at || attempt.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-500/20 flex flex-col justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Tổng Điểm Quy Đổi TOEIC
                        </span>
                        {attempt.is_score_manually_edited && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Đã điều chỉnh thủ công
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                          {attempt.total_scaled_score}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/ 990 điểm</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${getScoreBand(attempt.total_scaled_score).color}`}>
                        {getScoreBand(attempt.total_scaled_score).text}
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenEditScore}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                        title="Chỉnh sửa điểm bài thi và gửi email thông báo học viên"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chỉnh Sửa Điểm</span>
                      </button>
                    </div>
                  </div>

                  {isEditingScore ? (
                    <div className="mt-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-blue-500/30 space-y-4 shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          <span>Chỉnh Sửa Điểm Số & Gửi Nhận Xét Tới Học Viên</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Học viên: {learner?.full_name}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                            Điểm Listening (0 - 495)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={495}
                            value={editListeningScore}
                            onChange={(e) => handleListeningChange(Number(e.target.value))}
                            className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                            Điểm Reading (0 - 495)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={495}
                            value={editReadingScore}
                            onChange={(e) => handleReadingChange(Number(e.target.value))}
                            className="w-full h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                            Tổng Điểm Quy Đổi (0 - 990)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={990}
                            value={editTotalScore}
                            onChange={(e) => setEditTotalScore(Math.max(0, Math.min(990, Number(e.target.value))))}
                            className="w-full h-9 px-3 rounded-xl border border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-sm font-black text-blue-700 dark:text-blue-300 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                          Lời Nhận Xét & Hướng Dẫn Của Giảng Viên (Gửi kèm qua Email)
                        </label>
                        <textarea
                          rows={3}
                          value={editFeedback}
                          onChange={(e) => setEditFeedback(e.target.value)}
                          placeholder="Ví dụ: Bạn làm tốt phần nghe, cần cải thiện tốc độ làm bài đọc Part 7..."
                          className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <input
                            type="checkbox"
                            checked={editSendEmail}
                            onChange={(e) => setEditSendEmail(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                            <span>Gửi email thông báo điểm mới tới học viên <strong>({learner?.email})</strong></span>
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingScore(false)}
                            disabled={isSubmittingScore}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveScore}
                            disabled={isSubmittingScore}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                          >
                            {isSubmittingScore ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isSubmittingScore ? 'Đang cập nhật...' : 'Lưu Điểm & Gửi Email'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {attempt.teacher_feedback && (
                        <div className="mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                          <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Lời nhận xét của Giảng viên / Admin:</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap pl-5 italic">"{attempt.teacher_feedback}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            <Headphones className="w-3.5 h-3.5" />
                            <span>Listening</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {attempt.listening_scaled_score} <span className="text-[10px] font-normal text-slate-400">/ 495</span>
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Reading</span>
                          </div>
                          <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {attempt.reading_scaled_score} <span className="text-[10px] font-normal text-slate-400">/ 495</span>
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Câu đúng</span>
                          </div>
                          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {attempt.correct_questions} <span className="text-[10px] font-normal text-slate-400">/ {attempt.total_questions}</span>
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Độ chính xác</span>
                          </div>
                          <p className="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                            {attempt.total_questions > 0
                              ? Math.round((attempt.correct_questions / attempt.total_questions) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {partAnalysis.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Phân Tích Từng Part (Kỹ Năng Chi Tiết)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {partAnalysis.map((p) => (
                      <div
                        key={p.part_number}
                        onClick={() => setFilterPart(filterPart === p.part_number ? 'ALL' : p.part_number)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          filterPart === p.part_number
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase">
                          Part {p.part_number}
                        </div>
                        <div className={`text-sm font-black mt-0.5 ${filterPart === p.part_number ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                          {p.correct_count}/{p.total_questions}
                        </div>
                        <div className={`text-[10px] font-semibold ${filterPart === p.part_number ? 'text-blue-100' : 'text-slate-400'}`}>
                          {p.accuracy_percent}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'ALL'
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({answers.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('CORRECT')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'CORRECT'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đúng ({answers.filter((a) => a.is_correct).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('INCORRECT')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'INCORRECT'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Sai ({answers.filter((a) => !a.is_correct && a.selected_option).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterStatus('SKIPPED')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterStatus === 'SKIPPED'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Chưa làm ({answers.filter((a) => !a.selected_option).length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm số câu hoặc nội dung..."
                      value={searchQuestion}
                      onChange={(e) => setSearchQuestion(e.target.value)}
                      className="h-8.5 pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors w-48 sm:w-60"
                    />
                  </div>

                  {filterPart !== 'ALL' && (
                    <button
                      onClick={() => setFilterPart('ALL')}
                      className="h-8.5 px-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Filter className="w-3 h-3" />
                      <span>Part {filterPart} (Xóa lọc)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {filteredAnswers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Không có câu hỏi nào khớp với bộ lọc hiện tại.
                  </div>
                ) : (
                  filteredAnswers.map((ans) => {
                    const qObj = typeof ans.question_id === 'object' && ans.question_id !== null
                      ? (ans.question_id as AdminAttemptQuestion)
                      : null

                    const rawSelectedOption = ans.selected_option || ''
                    const isAudioAnswer = isAudioContent(rawSelectedOption)
                    const isWritingAnswer = !isAudioAnswer && rawSelectedOption.length > 5 && !['A', 'B', 'C', 'D'].includes(rawSelectedOption.trim().toUpperCase()) && (!qObj?.options || qObj.options.length === 0)
                    const isSkipped = !rawSelectedOption
                    const isCorrect = ans.is_correct
                    const correctKey = (ans.correct_option || qObj?.correct_option || '').trim().toUpperCase()
                    const userSelectedKey = rawSelectedOption.trim().toUpperCase()

                    return (
                      <div
                        key={ans._id || ans.question_number}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : isSkipped
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : 'bg-rose-500/5 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs flex items-center justify-center">
                              {ans.question_number}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Part {ans.part_number}
                            </span>
                            {isAudioAnswer && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                Speaking Response
                              </span>
                            )}
                            {isWritingAnswer && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                Writing Response
                              </span>
                            )}
                          </div>

                          <div>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Làm đúng
                              </span>
                            ) : isSkipped ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                Chưa làm
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Chưa chính xác
                              </span>
                            )}
                          </div>
                        </div>

                        {qObj?.image_url && (
                          <div className="mt-3 max-w-md rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img
                              src={resolveMediaUrl(qObj.image_url)}
                              alt={`Question ${ans.question_number}`}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}

                        {(qObj?.audio_url || qObj?.media_url) && (
                          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                              <span>Audio câu hỏi (Listening / Speaking Prompt):</span>
                            </div>
                            <audio controls className="w-full h-8" src={resolveMediaUrl(qObj.audio_url || qObj.media_url)} />
                          </div>
                        )}

                        {qObj?.question_text_en && (
                          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                            {qObj.question_text_en}
                          </p>
                        )}

                        {qObj?.question_text_vi && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">
                            ({qObj.question_text_vi})
                          </p>
                        )}

                        {isAudioAnswer ? (
                          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-pink-50/40 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                  <Mic className="w-4 h-4 animate-pulse" />
                                </div>
                                <div>
                                  <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Bản Ghi Âm Bài Nói Của Học Viên (Speaking Voice Response)
                                  </span>
                                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                    File thu âm trực tiếp khi làm bài thi
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                  Audio Recording
                                </span>
                                <a
                                  href={getAudioSrc(rawSelectedOption)}
                                  download={`speaking_q${ans.question_number}_${attempt?.exam_code || 'placement'}.webm`}
                                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Tải Audio
                                </a>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900/40">
                              <audio
                                controls
                                className="w-full h-10 rounded-lg"
                                src={getAudioSrc(rawSelectedOption)}
                                preload="auto"
                              />
                            </div>
                          </div>
                        ) : isWritingAnswer ? (
                          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <PenTool className="w-4 h-4 text-purple-600" />
                                <span>Bài Viết / Câu Trả Lời Của Học Viên:</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-normal">
                                {rawSelectedOption.split(/\s+/).filter(Boolean).length} từ
                              </span>
                            </div>
                            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              {rawSelectedOption}
                            </div>
                          </div>
                        ) : qObj?.options && qObj.options.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                            {qObj.options.map((opt) => {
                              const optKey = (opt.key || '').toUpperCase()
                              const isUserChosen = userSelectedKey === optKey
                              const isOptionCorrect = correctKey === optKey

                              let boxStyle = 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              if (isUserChosen && isOptionCorrect) {
                                boxStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 font-bold'
                              } else if (isUserChosen && !isOptionCorrect) {
                                boxStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-200 font-bold'
                              } else if (isOptionCorrect) {
                                boxStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                              }

                              return (
                                <div
                                  key={optKey}
                                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${boxStyle}`}
                                >
                                  <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-[11px] flex items-center justify-center shrink-0">
                                    {optKey}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <span>{opt.text_en}</span>
                                    {isUserChosen && (
                                      <span className="block text-[10px] mt-1 text-slate-500 dark:text-slate-400 font-normal">
                                        👉 Học viên đã chọn
                                      </span>
                                    )}
                                  </div>
                                  {isOptionCorrect && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4">
                            <div>
                              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-2">Đáp án học viên:</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100">{rawSelectedOption || 'Chưa làm'}</span>
                            </div>
                            {correctKey && (
                              <div>
                                <span className="font-semibold text-slate-500 dark:text-slate-400 mr-2">Đáp án chính xác:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{correctKey}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {(ans.whisper_transcript || ans.ai_score !== undefined || ans.ai_feedback) && (
                          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/20 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
                                <Bot className="w-4 h-4 text-violet-600" />
                                <span>Kết Quả Đánh Giá & Chấm Điểm AI (Whisper STT + AI Evaluator)</span>
                              </div>
                              {ans.ai_score !== undefined && (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-violet-600 text-white shadow-xs">
                                  Điểm AI: {ans.ai_score}/100
                                </span>
                              )}
                            </div>

                            {ans.whisper_transcript && (
                              <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-violet-200/60 dark:border-violet-800/40 space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Văn bản nhận diện từ giọng nói học viên (Whisper STT):</span>
                                </div>
                                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium italic pl-1">
                                  "{ans.whisper_transcript}"
                                </p>
                              </div>
                            )}

                            {ans.ai_feedback && (
                              <div className="space-y-2.5">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {ans.ai_feedback.pronunciation_score !== undefined && (
                                    <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Phát âm</span>
                                      <span className="text-xs font-black text-violet-600 dark:text-violet-400">{ans.ai_feedback.pronunciation_score}/100</span>
                                    </div>
                                  )}
                                  {ans.ai_feedback.fluency_score !== undefined && (
                                    <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Trôi chảy</span>
                                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{ans.ai_feedback.fluency_score}/100</span>
                                    </div>
                                  )}
                                  {ans.ai_feedback.grammar_score !== undefined && (
                                    <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Ngữ pháp</span>
                                      <span className="text-xs font-black text-blue-600 dark:text-blue-400">{ans.ai_feedback.grammar_score}/100</span>
                                    </div>
                                  )}
                                  {ans.ai_feedback.vocabulary_score !== undefined && (
                                    <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-violet-100 dark:border-violet-900/40 text-center">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Từ vựng</span>
                                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{ans.ai_feedback.vocabulary_score}/100</span>
                                    </div>
                                  )}
                                </div>

                                {ans.ai_feedback.detailed_comment && (
                                  <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-violet-200/60 dark:border-violet-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                    <span className="font-bold text-violet-700 dark:text-violet-300 block">Nhận xét chi tiết từ AI:</span>
                                    <p className="leading-relaxed whitespace-pre-wrap">{ans.ai_feedback.detailed_comment}</p>
                                  </div>
                                )}

                                {ans.ai_feedback.improvement_tips && ans.ai_feedback.improvement_tips.length > 0 && (
                                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                                    <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                                      <Lightbulb className="w-3.5 h-3.5" />
                                      <span>Gợi ý cải thiện:</span>
                                    </span>
                                    <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                                      {ans.ai_feedback.improvement_tips.map((tip, tIdx) => (
                                        <li key={tIdx}>{tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {qObj?.explanation_en && (
                          <div className="mt-4 p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Giải thích chi tiết & Transcript:</span>
                            </div>
                            <p className="leading-relaxed">{qObj.explanation_en}</p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  )
}
