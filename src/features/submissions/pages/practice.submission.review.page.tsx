// Trang chi tiết xem bài làm và xử lý chấm điểm, phúc khảo bài luyện tập hỗ trợ đa ngôn ngữ.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Image, Spin } from 'antd'
import {
  ChevronLeft,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileText,
  Mic,
  PenTool,
  Award,
  History,
  Info,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  practiceHistoryScoreLabel,
  practiceDateLabel,
  practiceExerciseLabels,
} from '@/features/submissions/helpers/practice.submission.display'
import { WritingTaskAssessmentSummary } from '@/features/submissions/components/writing.task.assessment'
import { useTeacherGrade } from '@/features/submissions/hooks/use.teacher.grade'
import { TeacherRubricEditor } from '@/features/submissions/components/teacher.rubric.editor'
import { emptyTeacherDraft } from '@/features/submissions/helpers/teacher.grading'

function PracticeMediaRenderer({
  value,
  image = false,
  onUnavailable,
}: {
  value: string
  image?: boolean
  onUnavailable?: () => void
}) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const [mediaError, setMediaError] = useState(false)
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

  useEffect(() => { if (query.isError) onUnavailable?.() }, [query.isError, onUnavailable])

  if (isId && query.isPending) {
    return <span className="text-xs text-slate-400">{isVi ? 'Đang tải tệp đối chiếu…' : 'Loading reference file…'}</span>
  }
  if (!source || query.isError) {
    return <span className="text-xs text-rose-500">{isVi ? 'Không tải được tệp gốc để đối chiếu.' : 'Unable to load original reference file.'}</span>
  }

  if (image) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 inline-block">
        <Image
          src={source}
          fallback={IMAGE_FALLBACK_PLACEHOLDER}
          alt={isVi ? 'Hình ảnh của đề bài gốc' : 'Original prompt image'}
          className="max-h-80 max-w-full rounded-lg object-contain"
          preview={{ mask: isVi ? 'Nhấp để xem ảnh lớn' : 'Click to preview' }}
        />
      </div>
    )
  }

  if (mediaError) {
    return (
      <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-800 dark:text-amber-300">
          <p className="font-semibold">{isVi ? 'Không thể tải hoặc phát tệp ghi âm.' : 'Cannot load or play recording file.'}</p>
          <p className="text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
            {isVi
              ? 'Tệp ghi âm này không tồn tại trên kho lưu trữ đám mây hoặc đã hết hạn lưu trữ tạm. Không dùng transcript thay audio để chấm phát âm hoặc độ trôi chảy. Cần khôi phục bản ghi âm gốc trước khi chấm.'
              : 'This recording file does not exist on cloud storage or temporary storage expired. Do not use transcript instead of audio to grade pronunciation or fluency.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
      <audio
        key={source}
        controls
        src={source}
        className="w-full h-8"
        preload="metadata"
        onError={() => { setMediaError(true); onUnavailable?.() }}
      />
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
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

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
            <span>{isVi ? 'Quay lại danh sách' : 'Back to list'}</span>
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {isVi ? 'Chi tiết bài nộp & Chấm điểm — Luyện tập ' : 'Submission Details & Grading — Practice '}{skill === 'SPEAKING' ? 'Speaking' : 'Writing'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {item ? (item.title || `${isVi ? 'Bài luyện tập' : 'Practice exercise'} ${item.skill}`) : (isVi ? 'Đang tải thông tin bài nộp…' : 'Loading submission…')}
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
            {isVi ? 'Tải lại' : 'Reload'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Spin size="large" />
          <p className="mt-3 text-xs text-slate-500">
            {isVi ? 'Đang tải bài làm và dữ liệu chấm điểm…' : 'Loading submission and grading data…'}
          </p>
        </div>
      )}

      {isError && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400">
          <p className="font-semibold text-sm">{isVi ? 'Không thể tải chi tiết bài làm.' : 'Unable to load submission details.'}</p>
          <p className="text-xs mt-1">{error instanceof Error ? error.message : (isVi ? 'Lỗi không xác định.' : 'Unknown error.')}</p>
          <Button
            type="primary"
            danger
            size="small"
            className="mt-3 rounded-lg text-xs"
            onClick={() => { void refetch() }}
          >
            {isVi ? 'Thử lại' : 'Retry'}
          </Button>
        </div>
      )}

      {item && (
        <PracticeReviewContent
          key={`${item.id}:${item.revision}`}
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
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const manual = item.record_type === 'GRADING_REQUEST'
  const [decision, setDecision] = useState<'KEEP' | 'ADJUST'>(manual ? 'ADJUST' : 'KEEP')
  const [teacherDraft, setTeacherDraft] = useState(emptyTeacherDraft)
  const preview = useTeacherGrade(item.teacher_rubric, teacherDraft, item.task_snapshot || {}, item.content || '')
  const teacherGrade = preview.pending ? null : preview.grade
  const [score, setScore] = useState(
    String(item.grading_standard === 'TOEIC' ? item.raw_score ?? 0 : item.overall_score ?? 0)
  )
  const [feedback, setFeedback] = useState('')
  const [audioUnavailable, setAudioUnavailable] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      practiceReviewService.decide(item.skill, item.id, {
        expected_revision: item.revision,
        decision,
        ...(decision === 'ADJUST' ? teacherGrade ? { teacher_grading: teacherGrade.input, score: teacherGrade.raw } : { score: Number(score) } : {}),
        feedback: feedback.trim(),
      }),
    onSuccess: () => {
      toast.success(isVi ? 'Đã lưu đánh giá và thông báo cho học viên' : 'Evaluation saved and learner notified')
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
    (skill !== 'WRITING' || Boolean(item.content?.trim())) &&
    (!manual || item.status === 'FAILED') &&
    (decision === 'KEEP' ? item.overall_score != null : item.teacher_rubric ? Boolean(teacherGrade) : !manual &&
      (score.trim() !== '' &&
        Number.isFinite(Number(score)) &&
        Number(score) >= 0 &&
        Number(score) <= max &&
        (item.grading_standard !== 'TOEIC' || Number.isInteger(Number(score)))))

  return (
    <div className="space-y-6">
      <WritingTaskAssessmentSummary evaluation={item.ai_evaluation} title={isVi ? 'Đánh giá AI ban đầu' : 'Initial AI Evaluation'} />
      <WritingTaskAssessmentSummary evaluation={item.review?.teacher_grading as unknown as Record<string, unknown>} title={isVi ? 'Đánh giá giáo viên hiện tại' : 'Current Teacher Grading'} />
      {manual && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          {isVi
            ? 'Bài AI chưa chấm được. Giáo viên chấm từ bài làm và đề gốc; điểm giáo viên được lưu riêng, điểm AI vẫn là chưa có. Chỉ lưu khi yêu cầu đã ở trạng thái lỗi.'
            : 'AI evaluation failed. Teacher grades directly from prompt and submission; teacher score saved separately.'}
        </div>
      )}
      {item.review?.teacher_grading && (
        <div className="rounded-xl border border-indigo-200 p-4 text-sm">
          <p className="font-semibold">{isVi ? 'Phiếu giáo viên đã lưu' : 'Saved Teacher Rubric Score'}</p>
          <p>{item.review.teacher_grading.raw_score}/{item.review.teacher_grading.max_score} · {item.review.feedback}</p>
          <ul>{Object.entries(item.review.teacher_grading.criteria_scores).map(([key, value]) => <li key={key}>{item.review!.teacher_grading!.rubric_snapshot.criteria.find(c => c.key === key)?.label || key}: {value == null ? (isVi ? 'Không áp dụng' : 'N/A') : `${value}/100`}</li>)}</ul>
        </div>
      )}
      {item.review?.reason && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-700 dark:text-amber-300">
                {isVi ? 'Yêu cầu phúc khảo từ học viên' : 'Review request from learner'}
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
              <span>{isVi ? 'Đề bài tại thời điểm nộp' : 'Prompt Snapshot at Submission'}</span>
            </div>

            {!item.task_snapshot && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900">
                {isVi ? 'Bài cũ chưa lưu snapshot; không dùng đề hiện tại để thay thế đề gốc.' : 'No task snapshot available for older submission.'}
              </p>
            )}

            <div className="space-y-3 text-xs">
              {typeof task.title === 'string' && task.title && (
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{isVi ? 'Tiêu đề: ' : 'Title: '}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{task.title}</span>
                </div>
              )}

              {typeof task.task_prompt === 'string' && task.task_prompt && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">{isVi ? 'Đề bài:' : 'Prompt:'}</span>
                  <p className="text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {task.task_prompt}
                  </p>
                </div>
              )}

              {typeof task.prompt_text_en === 'string' && task.prompt_text_en && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">{isVi ? 'Nội dung tiếng Anh:' : 'English Prompt Content:'}</span>
                  <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
                    {task.prompt_text_en}
                  </p>
                </div>
              )}

              {typeof task.instruction === 'string' && task.instruction && (
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{isVi ? 'Hướng dẫn: ' : 'Instructions: '}</span>
                  <span className="text-slate-700 dark:text-slate-300">{task.instruction}</span>
                </div>
              )}

              {typeof task.prompt_image_id === 'string' && task.prompt_image_id && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-2">{isVi ? 'Hình ảnh kèm theo:' : 'Attached Image:'}</span>
                  <PracticeMediaRenderer value={task.prompt_image_id} image />
                </div>
              )}

              {Array.isArray(task.task_requirements) && task.task_requirements.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">{isVi ? 'Yêu cầu cần đạt:' : 'Requirements:'}</span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                    {task.task_requirements.map((req, idx) => (
                      <li key={idx}>{String(req)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {typeof task.reference_answer === 'string' && task.reference_answer && (
                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 block mb-1">{isVi ? 'Đáp án tham khảo:' : 'Sample Answer:'}</span>
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
                <span>{isVi ? 'Bài làm của học viên' : 'Learner Submission'}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {skill === 'WRITING' ? `${isVi ? 'Số từ: ' : 'Word count: '}${item.word_count ?? '—'}` : `${isVi ? 'Ghi âm: ' : 'Recording: '}${item.recording_duration_seconds != null ? `${item.recording_duration_seconds}s` : '—'}`}
              </span>
            </div>

            {item.audio_url && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{isVi ? 'Bản ghi âm hoàn chỉnh:' : 'Complete Audio Recording:'}</span>
                <PracticeMediaRenderer value={item.audio_url} onUnavailable={() => setAudioUnavailable(true)} />
              </div>
            )}

            {skill === 'SPEAKING' && !item.audio_url && !item.dialogue_turns_results?.length && (
              <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
                {isVi ? 'Thiếu bản ghi âm: không đủ căn cứ để đánh giá lại phát âm.' : 'Missing audio recording: insufficient evidence to re-evaluate pronunciation.'}
              </p>
            )}

            {(item.content || item.transcription) && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {skill === 'SPEAKING' ? (isVi ? 'Bản nhận diện giọng nói (Transcription):' : 'Speech Transcription:') : (isVi ? 'Nội dung bài viết:' : 'Written Content:')}
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap font-sans">
                  {item.content || item.transcription}
                </div>
              </div>
            )}

            {Array.isArray(item.dialogue_turns_results) && item.dialogue_turns_results.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  {isVi ? 'Các lượt thoại (Dialogue Turns):' : 'Dialogue Turns:'}
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
                          {isVi ? 'Lượt ' : 'Turn '}{turn.turn_number}
                        </span>
                      </div>
                      {turn.user_transcription && (
                        <p className="text-slate-700 dark:text-slate-300 italic">
                          "{turn.user_transcription}"
                        </p>
                      )}
                      {mediaSource && <PracticeMediaRenderer value={mediaSource} onUnavailable={() => setAudioUnavailable(true)} />}
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
                <span>{isVi ? 'Đánh giá từ AI hệ thống' : 'System AI Evaluation'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{isVi ? 'Điểm AI gốc:' : 'Original AI score:'}</span>
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {practiceScoreLabel(item, true)}
                </span>
              </div>
            </div>

            {Boolean(ai.detailed_feedback || ai.score_reason) && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">{isVi ? 'Nhận xét chung:' : 'General feedback:'}</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {String(ai.detailed_feedback || ai.score_reason)}
                </p>
              </div>
            )}

            {criteria && Object.keys(criteria).length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                  {isVi ? 'Điểm theo từng tiêu chí đánh giá:' : 'Scores by evaluation criteria:'}
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
              <span>{isVi ? 'Thông tin bài nộp' : 'Submission Information'}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Học viên:' : 'Learner:'}</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]" title={item.user_email || item.user_id}>
                  {item.user_email || item.user_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Loại bài:' : 'Exercise Type:'}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {practiceExerciseLabels[item.exercise_type || ''] || item.exercise_type || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Thang điểm:' : 'Scale:'}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.grading_standard === 'TOEIC' ? `TOEIC (${isVi ? 'Tối đa ' : 'Max '}${item.max_score ?? '—'})` : (isVi ? 'Thực hành (/100)' : 'Practice (/100)')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Điểm hiện tại:' : 'Current Score:'}</span>
                <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {practiceScoreLabel(item)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Lượt làm:' : 'Attempt:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  #{item.attempt_number ?? item.version_number ?? '1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Thời gian nộp:' : 'Submitted at:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {practiceDateLabel(item.submitted_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Trạng thái phúc khảo:' : 'Review Status:'}</span>
                <span className="font-medium">
                  {item.review?.status === 'REQUESTED' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{isVi ? 'Chờ xem xét' : 'Pending'}</span>
                  ) : item.review?.status === 'RESOLVED' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isVi ? 'Đã kiểm tra' : 'Reviewed'}</span>
                  ) : (
                    <span className="text-slate-500">{isVi ? 'Chưa yêu cầu' : 'None'}</span>
                  )}
                </span>
              </div>
              {item.review?.reviewed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Đã chấm lúc:' : 'Reviewed at:'}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {practiceDateLabel(item.review.reviewed_at)}
                  </span>
                </div>
              )}
              {item.review?.reviewer_name && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isVi ? 'Người chấm:' : 'Reviewer:'}</span>
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
              <span>{isVi ? 'Quyết định của giáo viên' : 'Teacher Evaluation Decision'}</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  {isVi ? 'Quyết định điểm số' : 'Score Decision'}
                </label>
                <select
                  aria-label={isVi ? 'Quyết định phúc khảo' : 'Grading decision'}
                  value={decision}
                  onChange={(event) => setDecision(event.target.value as 'KEEP' | 'ADJUST')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  {!manual && <option value="KEEP">{isVi ? 'Giữ nguyên điểm số hiện tại' : 'Keep current score'}</option>}
                  <option value="ADJUST">{isVi ? 'Điều chỉnh sang điểm mới' : 'Adjust to new score'}</option>
                </select>
              </div>

              {decision === 'ADJUST' && item.teacher_rubric && <TeacherRubricEditor rubric={item.teacher_rubric} value={teacherDraft} onChange={setTeacherDraft} calculated={preview.grade} pending={preview.pending} error={preview.error} />}
              {decision === 'ADJUST' && !item.teacher_rubric && <p className="text-sm text-amber-700">{isVi ? `Không có đủ rubric/đề gốc đã lưu. ${manual ? 'Chưa thể chấm thủ công; cần khôi phục dữ liệu gốc.' : 'Bài cũ chỉ hỗ trợ điều chỉnh điểm tổng và phải ghi rõ căn cứ.'}` : 'Insufficient rubric/prompt snapshot saved.'}</p>}
              {decision === 'ADJUST' && !item.teacher_rubric && !manual && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {isVi ? `Điểm số sau điều chỉnh (0–${max})` : `Adjusted Score (0–${max})`}
                  </label>
                  <input
                    aria-label={isVi ? 'Điểm sau phúc khảo' : 'Adjusted score'}
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
                    {isVi ? 'Nhận xét & Phản hồi cho học viên' : 'Feedback for Learner'}
                  </label>
                  <span className={`text-[11px] ${feedback.trim().length < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {feedback.trim().length}/5000 ({isVi ? 'tối thiểu 10 ký tự' : 'min 10 chars'})
                  </span>
                </div>
                <textarea
                  aria-label={isVi ? 'Nhận xét phúc khảo' : 'Review feedback'}
                  placeholder={isVi ? 'Giải thích quyết định, dẫn chứng cụ thể từ bài làm của học viên...' : 'Explain grading decision with evidence from submission...'}
                  value={feedback}
                  maxLength={5000}
                  onChange={(event) => setFeedback(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-slate-900 dark:text-white leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-y"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {isVi
                  ? 'Điểm AI gốc và phiếu giáo viên được lưu riêng trong lịch sử. Quyết định không cộng thêm lượt làm hoặc điểm thưởng, không thay đổi kết quả ôn tập đã ghi nhận.'
                  : 'Original AI score and teacher rubric evaluation are kept separately in history.'}
              </div>

              <button
                type="button"
                disabled={
                  !valid ||
                  audioUnavailable ||
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
                    <span>{isVi ? 'Đang lưu quyết định…' : 'Saving decision…'}</span>
                  </>
                ) : (
                  <span>{isVi ? 'Lưu quyết định chấm điểm' : 'Save Grading Decision'}</span>
                )}
              </button>
            </div>
          </div>

          {Array.isArray(item.review_history) && item.review_history.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <History className="w-4 h-4 text-slate-500" />
                <span>{isVi ? 'Lịch sử đánh giá' : 'Evaluation History'} ({item.review_history.length})</span>
              </div>
              <div className="space-y-2.5">
                {item.review_history.map((entry) => (
                  <div
                    key={entry.revision}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {entry.reviewer_name || (isVi ? 'Giáo viên' : 'Teacher')}
                      </span>
                      <span className="font-mono text-[11px]">
                        {practiceDateLabel(entry.reviewed_at)}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {practiceHistoryScoreLabel(entry, item)}
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
