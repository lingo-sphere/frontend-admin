// Trang chi tiết xem bài làm và xử lý chấm điểm, phúc khảo bài luyện tập.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Image, Spin, Tooltip } from 'antd'
import {
  ChevronLeft,
  RotateCcw,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileText,
  Volume2,
  Mic,
  PenTool,
  Award,
  Layers,
  History,
  Info,
} from 'lucide-react'
import { api } from '@/services/api.client'
import { toast } from '@/store/toast.store'
import { resolveMediaUrl, IMAGE_FALLBACK_PLACEHOLDER } from '@/features/media/utils/media.utils'
import {
  practiceReviewService,
  type PracticeSkill,
  type PracticeSubmission,
} from '@/features/submissions/services/practice.review.service'
import {
  practiceScoreLabel,
  practiceDateLabel,
  practiceExerciseLabels,
} from '@/features/submissions/helpers/practice.submission.display'

function PracticeMediaRenderer({
  value,
  image = false,
}: {
  value: string
  image?: boolean
}) {
  const isId = /^[a-f\d]{24}$/i.test(value)
  const query = useQuery({
    queryKey: ['practice-review-media', value],
    enabled: isId,
    queryFn: () =>
      api.get<{ storage_key?: string; file_path?: string }>(`/media/files/${value}`),
  })
  const key = isId
    ? query.data?.storage_key || query.data?.file_path || ''
    : value
  const source = /^data:(audio|image)\//.test(key) ? key : resolveMediaUrl(key)

  if (isId && query.isPending) {
    return <span className="text-xs text-slate-400">Đang tải tệp đối chiếu…</span>
  }
  if (!source || query.isError) {
    return <span className="text-xs text-rose-500">Không tải được tệp gốc để đối chiếu.</span>
  }

  return image ? (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 inline-block">
      <Image
        src={source}
        fallback={IMAGE_FALLBACK_PLACEHOLDER}
        alt="Hình ảnh của đề bài gốc"
        className="max-h-80 max-w-full rounded-lg object-contain"
        preview={{ mask: 'Nhấp để xem ảnh lớn' }}
      />
    </div>
  ) : (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
      <audio controls src={source} className="w-full h-8" preload="metadata" />
    </div>
  )
}

interface PracticeSubmissionReviewPageProps {
  skill: PracticeSkill
  id: string
}

export function PracticeSubmissionReviewPage({
  skill,
  id,
}: PracticeSubmissionReviewPageProps) {
  const navigate = useNavigate()
  const client = useQueryClient()

  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['practice-submission-detail', skill, id],
    queryFn: () => practiceReviewService.detail(skill, id),
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/submissions/practice/${skill.toLowerCase()}`)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại danh sách</span>
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Chi tiết bài nộp & Chấm điểm — Luyện tập {skill === 'SPEAKING' ? 'Speaking' : 'Writing'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {item ? (item.title || `Bài luyện tập ${item.skill}`) : 'Đang tải thông tin bài nộp…'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="small"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => { void refetch() }}
            className="rounded-xl text-xs font-semibold"
          >
            Tải lại
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Spin size="large" />
          <p className="mt-3 text-xs text-slate-500">Đang tải bài làm và dữ liệu chấm điểm…</p>
        </div>
      )}

      {isError && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400">
          <p className="font-semibold text-sm">Không thể tải chi tiết bài làm.</p>
          <p className="text-xs mt-1">{error instanceof Error ? error.message : 'Lỗi không xác định.'}</p>
          <Button
            type="primary"
            danger
            size="small"
            className="mt-3 rounded-lg text-xs"
            onClick={() => { void refetch() }}
          >
            Thử lại
          </Button>
        </div>
      )}

      {item && (
        <PracticeReviewContent
          item={item}
          skill={skill}
          onDecisionSuccess={() => {
            void client.invalidateQueries({ queryKey: ['practice-submissions'] })
            void client.invalidateQueries({ queryKey: ['practice-submission-detail', skill, id] })
          }}
        />
      )}
    </div>
  )
}

function PracticeReviewContent({
  item,
  skill,
  onDecisionSuccess,
}: {
  item: PracticeSubmission
  skill: PracticeSkill
  onDecisionSuccess: () => void
}) {
  const [decision, setDecision] = useState<'KEEP' | 'ADJUST'>('KEEP')
  const [score, setScore] = useState(
    String(item.grading_standard === 'TOEIC' ? item.raw_score ?? 0 : item.overall_score ?? 0)
  )
  const [feedback, setFeedback] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      practiceReviewService.decide(item.skill, item.id, {
        expected_revision: item.revision,
        decision,
        ...(decision === 'ADJUST' ? { score: Number(score) } : {}),
        feedback: feedback.trim(),
      }),
    onSuccess: () => {
      toast.success('Đã lưu đánh giá và thông báo cho học viên')
      onDecisionSuccess()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const task = item.task_snapshot || {}
  const ai = item.ai_evaluation || {}
  const criteria = ai.criteria_scores as Record<string, number | null> | undefined
  const criteriaFeedback = ai.criteria_feedback as
    | Record<string, { comment?: string; evidence?: string[] }>
    | undefined
  const max = item.grading_standard === 'TOEIC' ? item.max_score || 5 : 100

  const valid =
    feedback.trim().length >= 10 &&
    feedback.trim().length <= 5000 &&
    (decision === 'KEEP' ||
      (score.trim() !== '' &&
        Number.isFinite(Number(score)) &&
        Number(score) >= 0 &&
        Number(score) <= max &&
        (item.grading_standard !== 'TOEIC' || Number.isInteger(Number(score)))))

  return (
    <div className="space-y-6">
      {item.review?.reason && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-700 dark:text-amber-300">
                Yêu cầu phúc khảo từ học viên
              </span>
              <span className="text-amber-600/80 dark:text-amber-400/80">
                · {practiceDateLabel(item.review.requested_at)}
              </span>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed">{item.review.reason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Đề bài tại thời điểm nộp</span>
            </div>

            {!item.task_snapshot && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                Bài cũ chưa lưu snapshot; không dùng đề hiện tại để thay thế đề gốc.
              </p>
            )}

            <div className="space-y-3 text-xs">
              {typeof task.title === 'string' && task.title && (
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Tiêu đề: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{task.title}</span>
                </div>
              )}

              {typeof task.task_prompt === 'string' && task.task_prompt && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Đề bài:</span>
                  <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {task.task_prompt}
                  </p>
                </div>
              )}

              {typeof task.prompt_text_en === 'string' && task.prompt_text_en && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Nội dung tiếng Anh:</span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                    {task.prompt_text_en}
                  </p>
                </div>
              )}

              {typeof task.instruction === 'string' && task.instruction && (
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Hướng dẫn: </span>
                  <span className="text-slate-700 dark:text-slate-300">{task.instruction}</span>
                </div>
              )}

              {typeof task.prompt_image_id === 'string' && task.prompt_image_id && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-2">Hình ảnh kèm theo:</span>
                  <PracticeMediaRenderer value={task.prompt_image_id} image />
                </div>
              )}

              {Array.isArray(task.task_requirements) && task.task_requirements.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Yêu cầu cần đạt:</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {task.task_requirements.map((req, idx) => (
                      <li key={idx}>{String(req)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {typeof task.reference_answer === 'string' && task.reference_answer && (
                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 block mb-1">Đáp án tham khảo:</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {task.reference_answer}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                {skill === 'SPEAKING' ? <Mic className="w-4 h-4 text-emerald-500" /> : <PenTool className="w-4 h-4 text-purple-500" />}
                <span>Bài làm của học viên</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {skill === 'WRITING' ? `Số từ: ${item.word_count ?? '—'}` : `Ghi âm: ${item.recording_duration_seconds != null ? `${item.recording_duration_seconds}s` : '—'}`}
              </span>
            </div>

            {item.audio_url && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Bản ghi âm hoàn chỉnh:</span>
                <PracticeMediaRenderer value={item.audio_url} />
              </div>
            )}

            {skill === 'SPEAKING' && !item.audio_url && !item.dialogue_turns_results?.length && (
              <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
                Thiếu bản ghi âm: không đủ căn cứ để đánh giá lại phát âm.
              </p>
            )}

            {(item.content || item.transcription) && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {skill === 'SPEAKING' ? 'Bản nhận diện giọng nói (Transcription):' : 'Nội dung bài viết:'}
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                  {item.content || item.transcription}
                </div>
              </div>
            )}

            {Array.isArray(item.dialogue_turns_results) && item.dialogue_turns_results.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  Các lượt thoại (Dialogue Turns):
                </span>
                {item.dialogue_turns_results.map((turn) => {
                  const mediaSource =
                    turn.audio_url ||
                    (turn.audio_data
                      ? turn.audio_data.startsWith('data:')
                        ? turn.audio_data
                        : `data:audio/webm;base64,${turn.audio_data}`
                      : turn.recording_media_id || '')
                  return (
                    <div
                      key={turn.turn_number}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          Lượt {turn.turn_number}
                        </span>
                      </div>
                      {turn.user_transcription && (
                        <p className="text-slate-700 dark:text-slate-300 italic">
                          "{turn.user_transcription}"
                        </p>
                      )}
                      {mediaSource && <PracticeMediaRenderer value={mediaSource} />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Đánh giá từ AI hệ thống</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Điểm AI gốc:</span>
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {practiceScoreLabel(item, true)}
                </span>
              </div>
            </div>

            {Boolean(ai.detailed_feedback || ai.score_reason) && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Nhận xét chung:</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {String(ai.detailed_feedback || ai.score_reason)}
                </p>
              </div>
            )}

            {criteria && Object.keys(criteria).length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  Điểm theo từng tiêu chí đánh giá:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(criteria).map(([criterionKey, val]) => {
                    const fb = criteriaFeedback?.[criterionKey]
                    return (
                      <div
                        key={criterionKey}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider">
                            {criterionKey}
                          </span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {val === null ? 'N/A' : `${val}/100`}
                          </span>
                        </div>
                        {fb?.comment && (
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {fb.comment}
                          </p>
                        )}
                        {Array.isArray(fb?.evidence) && fb.evidence.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {fb.evidence.map((ev, evIdx) => (
                              <blockquote
                                key={evIdx}
                                className="pl-2 border-l-2 border-indigo-400 text-slate-500 dark:text-slate-400 italic"
                              >
                                {ev}
                              </blockquote>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Thông tin bài nộp</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Học viên:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]" title={item.user_email || item.user_id}>
                  {item.user_email || item.user_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Loại bài:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {practiceExerciseLabels[item.exercise_type || ''] || item.exercise_type || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Thang điểm:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.grading_standard === 'TOEIC' ? `TOEIC (Tối đa ${item.max_score ?? '—'})` : 'Thực hành (/100)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Điểm hiện tại:</span>
                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {practiceScoreLabel(item)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Lượt làm:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  #{item.attempt_number ?? item.version_number ?? '1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Thời gian nộp:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {practiceDateLabel(item.submitted_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Trạng thái phúc khảo:</span>
                <span className="font-medium">
                  {item.review?.status === 'REQUESTED' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Chờ xem xét</span>
                  ) : item.review?.status === 'RESOLVED' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đã kiểm tra</span>
                  ) : (
                    <span className="text-slate-500">Chưa yêu cầu</span>
                  )}
                </span>
              </div>
              {item.review?.reviewed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Đã chấm lúc:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {practiceDateLabel(item.review.reviewed_at)}
                  </span>
                </div>
              )}
              {item.review?.reviewer_name && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Người chấm:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.review.reviewer_name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Quyết định của giáo viên</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Quyết định điểm số
                </label>
                <select
                  aria-label="Quyết định phúc khảo"
                  value={decision}
                  onChange={(event) => setDecision(event.target.value as 'KEEP' | 'ADJUST')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="KEEP">Giữ nguyên điểm số hiện tại</option>
                  <option value="ADJUST">Điều chỉnh sang điểm mới</option>
                </select>
              </div>

              {decision === 'ADJUST' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Điểm số sau điều chỉnh (0–{max})
                  </label>
                  <input
                    aria-label="Điểm sau phúc khảo"
                    type="number"
                    min={0}
                    max={max}
                    step={item.grading_standard === 'TOEIC' ? 1 : 0.1}
                    value={score}
                    onChange={(event) => setScore(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Nhận xét & Phản hồi cho học viên
                  </label>
                  <span className={`text-[11px] ${feedback.trim().length < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {feedback.trim().length}/5000 (tối thiểu 10 ký tự)
                  </span>
                </div>
                <textarea
                  aria-label="Nhận xét phúc khảo"
                  placeholder="Giải thích quyết định, dẫn chứng cụ thể từ bài làm của học viên..."
                  value={feedback}
                  maxLength={5000}
                  onChange={(event) => setFeedback(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-y"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Điểm AI gốc và tiêu chí được lưu vết. Quyết định cập nhật điểm luyện tập, không tạo lượt làm/XP mới và không thay đổi bằng chứng ôn tập SRS.
              </div>

              <button
                type="button"
                disabled={
                  !valid ||
                  mutation.isPending ||
                  (item.skill === 'SPEAKING' &&
                    !item.audio_url &&
                    !item.dialogue_turns_results?.some(
                      (turn) => turn.audio_url || turn.recording_media_id || turn.audio_data
                    ))
                }
                onClick={() => mutation.mutate()}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <Spin size="small" />
                    <span>Đang lưu quyết định…</span>
                  </>
                ) : (
                  <span>Lưu quyết định chấm điểm</span>
                )}
              </button>
            </div>
          </div>

          {Array.isArray(item.review_history) && item.review_history.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <History className="w-4 h-4 text-slate-500" />
                <span>Lịch sử đánh giá ({item.review_history.length})</span>
              </div>
              <div className="space-y-2.5">
                {item.review_history.map((entry) => (
                  <div
                    key={entry.revision}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {entry.reviewer_name || 'Giáo viên'}
                      </span>
                      <span className="font-mono text-[11px]">
                        {practiceDateLabel(entry.reviewed_at)}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {entry.previous_score} → {entry.score}/100
                    </div>
                    {entry.feedback && (
                      <p className="text-slate-600 dark:text-slate-400 italic pt-1">
                        "{entry.feedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
