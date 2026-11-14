import { WritingTaskAssessmentSummary } from './writing.task.assessment';
import { useTeacherGrade } from '../hooks/use.teacher.grade';
// Dialog chấm điểm và viết nhận xét phúc khảo bài nộp của học viên.

import { useState } from "react";
import { TeacherRubricEditor } from "./teacher.rubric.editor";
import { emptyTeacherDraft, type TeacherRubric, type TeacherGrading } from "../helpers/teacher.grading";
import {
  X,
  Volume2,
  FileText,
  Sparkles,
  CheckCircle2,
  Edit3,
  Bot,
  Save,
  Headphones,
  PenLine,
  MessageSquare,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { NumberInput } from "@/components/number.input";
import type { SkillSubmissionItem } from "@/features/progress/services/progress.service";
import { resolveMediaUrl } from "@/features/media/utils/media.utils";

interface CourseSubmissionReviewDialogProps {
  submission: SkillSubmissionItem;
  editScore: number;
  editFeedback: string;
  isSubmitting: boolean;
  onScoreChange: (score: number) => void;
  onFeedbackChange: (feedback: string) => void;
  onClose: () => void;
  onSaveReview: (overrideScore?: number, teacherGrading?: TeacherGrading, keepAi?: boolean) => void;
}

export function CourseSubmissionReviewDialog({
  submission,
  editScore,
  editFeedback,
  isSubmitting,
  onScoreChange,
  onFeedbackChange,
  onClose,
  onSaveReview,
}: CourseSubmissionReviewDialogProps) {
  const [audioError, setAudioError] = useState(false);
  const isSpeaking = submission.skill === "SPEAKING";
  const rubric = submission.teacher_rubric as TeacherRubric | undefined;
  const [draft, setDraft] = useState(emptyTeacherDraft);
  const preview = useTeacherGrade(rubric, draft, (submission.task_snapshot || {}) as Record<string, unknown>, submission.essay_text || '');
  const grade = preview.pending ? null : preview.grade;
  const manual = submission.status === 'GRADING_FAILED';
  const hasEvidence = isSpeaking ? Boolean(submission.audio_url) && !audioError : Boolean(submission.essay_text?.trim());
  const canReview = hasEvidence && ['AI_GRADED', 'TEACHER_REVIEWED', 'GRADING_FAILED'].includes(submission.status);
  const originalEvaluation = submission.ai_evaluation as { raw_score?: number } | undefined;
  const aiLabel = submission.ai_score == null ? 'Chưa có điểm' : rubric?.standard === 'TOEIC' && typeof originalEvaluation?.raw_score === 'number' ? `${originalEvaluation.raw_score}/${rubric.max_score}` : `${submission.ai_score}/100${rubric?.standard === 'TOEIC' ? ' (tỷ lệ nội bộ)' : ''}`;
  const savedGrade = submission.teacher_grading as { raw_score: number; max_score: number; rubric_snapshot: TeacherRubric; criteria_scores: Record<string, number | null> } | undefined;
  const history = Array.isArray(submission.review_history) ? submission.review_history as Array<Record<string, unknown>> : [];
  const canSave = canReview && (rubric ? Boolean(grade) && editFeedback.trim().length >= 10 : !manual);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 dark:bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 space-y-5 ring-1 ring-black/5 dark:ring-white/10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isSpeaking
                  ? "Chấm Điểm & Đánh Giá Bài Nói (Speaking)"
                  : "Chấm Điểm & Đánh Giá Bài Luận (Writing)"}
              </h3>
              <div className="text-xs text-slate-400">
                Học viên:{" "}
                <strong className="text-slate-700 dark:text-slate-200">
                  {submission.user_name}
                </strong>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <WritingTaskAssessmentSummary evaluation={submission.ai_evaluation as Record<string, unknown> | undefined} title="Đánh giá AI ban đầu" />
        <WritingTaskAssessmentSummary evaluation={submission.teacher_grading as Record<string, unknown> | undefined} title="Đánh giá giáo viên đã lưu" />
        {manual && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">AI chưa chấm được bài này. Nhập đủ phiếu chấm và nhận xét để ghi điểm giáo viên; điểm AI vẫn được giữ là chưa có.</p>}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            {isSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>1. Nội dung bài nói của học viên</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>1. Nội dung bài viết của học viên</span>
              </>
            )}
          </span>

          {isSpeaking && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              {submission.audio_url ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Bản ghi âm bài nói:</span>
                    </span>
                  </div>
                  {audioError ? (
                    <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <span>Không thể tải hoặc phát tệp ghi âm do tệp không tồn tại hoặc đã hết hạn lưu trữ tạm.</span>
                    </div>
                  ) : (
                    <audio
                      key={submission.audio_url}
                      controls
                      className="w-full h-9 rounded-lg"
                      src={resolveMediaUrl(submission.audio_url)}
                      preload="metadata"
                      onError={() => setAudioError(true)}
                    />
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Không tìm thấy tệp ghi âm.
                </p>
              )}

              {submission.whisper_transcript ? (
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    <span>Bản bóc tách Whisper STT:</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 italic font-mono text-xs leading-relaxed">
                    &ldquo;{submission.whisper_transcript}&rdquo;
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Chưa có bản bóc tách Whisper.
                </p>
              )}
            </div>
          )}

          {!isSpeaking && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5 text-teal-600" />
                  <span>Toàn văn bài luận:</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {submission.essay_text?.trim().split(/\s+/).filter(Boolean)
                    .length || 0}{" "}
                  từ
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {submission.essay_text || "Chưa có nội dung bài viết."}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>2. Kết quả phân tích & Chấm điểm từ AI</span>
          </span>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Điểm AI đề xuất:
                </span>
                <span className="text-base font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-3 py-1 rounded-xl">
                  {aiLabel}
                </span>
              </div>

              {!rubric && <button
                type="button"
                disabled={!canReview || submission.ai_score == null}
                onClick={() => { if (submission.ai_score != null) onScoreChange(submission.ai_score); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 cursor-pointer shadow-2xs"
              >
                Áp dụng điểm AI ({aiLabel})
              </button>}
            </div>

            {submission.ai_feedback?.detailed_comment && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>Nhận xét chi tiết của AI:</span>
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {submission.ai_feedback.detailed_comment}
                </p>
              </div>
            )}

            {Array.isArray(submission.ai_feedback?.improvement_tips) &&
              submission.ai_feedback.improvement_tips.length > 0 && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                    <span>Gợi ý cải thiện:</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {submission.ai_feedback.improvement_tips.map(
                      (tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Edit3 className="w-4 h-4 text-indigo-500" />
            <span>3. Giáo viên Duyệt & Hiệu chỉnh điểm số</span>
          </span>

          <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 space-y-3.5">
            {rubric && <TeacherRubricEditor rubric={rubric} value={draft} onChange={setDraft} calculated={preview.grade} pending={preview.pending} error={preview.error} />}
            {!rubric && <p className="text-sm text-amber-700">Thiếu rubric/đề gốc. Bài cũ chỉ hỗ trợ điều chỉnh điểm tổng; bài AI lỗi chưa thể chấm thủ công.</p>}
            {!rubric && !manual && <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Điểm chính thức của Giáo Viên (Thang 0 - 100):
              </label>
              <div className="flex items-center gap-3">
                <NumberInput
                  min={0}
                  max={100}
                  fallbackValue={0}
                  value={editScore}
                  onChange={onScoreChange}
                  className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-base font-black text-indigo-600 dark:text-indigo-400 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[+5, +10, -5, -10].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() =>
                        onScoreChange(
                          Math.min(100, Math.max(0, editScore + delta))
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs transition-colors"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>
            </div>}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lời phê & Nhận xét của Giáo Viên gửi cho học viên:
              </label>
              <textarea
                rows={3}
                value={editFeedback}
                onChange={(e) => onFeedbackChange(e.target.value)}
                placeholder="Nhập nhận xét chi tiết: khen ngợi điểm mạnh, chỉ rõ lỗi ngữ pháp/phát âm cụ thể và hướng dẫn bài tập rèn luyện thêm..."
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed shadow-2xs"
              />
            </div>
          </div>
        </div>

        {savedGrade && <section className="rounded-xl border border-indigo-200 p-3 text-sm"><h4 className="font-semibold">Phiếu giáo viên đã lưu: {savedGrade.raw_score}/{savedGrade.max_score}</h4><ul>{Object.entries(savedGrade.criteria_scores).map(([key, value]) => <li key={key}>{savedGrade.rubric_snapshot.criteria.find(c => c.key === key)?.label || key}: {value == null ? 'Không áp dụng' : `${value}/100`}</li>)}</ul></section>}
        {history.length > 0 && <section className="rounded-xl border border-slate-200 p-3 text-sm"><h4 className="font-semibold">Lịch sử chấm của giáo viên</h4>{history.map((entry, i) => {
          const toeic = entry.grading_standard === 'TOEIC';
          const before = toeic ? entry.previous_raw_score : entry.previous_score;
          const after = toeic ? entry.raw_score : entry.score;
          return <div key={i} className="mt-2 border-t border-slate-100 pt-2"><p>{String(entry.reviewer_name || entry.teacher_id || 'Giáo viên')} · {entry.reviewed_at ? new Date(String(entry.reviewed_at)).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false }) : '—'} (UTC+7)</p><p>{entry.history_version === 1 ? `${typeof before === 'number' ? before : 'Chưa có điểm'} → ${typeof after === 'number' ? after : 'Chưa có điểm'}/${Number(entry.max_score || 100)}` : `Bản ghi cũ: ${String(entry.score ?? 'Chưa có điểm')}/100 (nội bộ)`}</p><p>{String(entry.feedback || '')}</p></div>
        })}</section>}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => { if (canReview && submission.ai_score != null) onSaveReview(submission.ai_score, undefined, true); }}
            disabled={isSubmitting || !canReview || submission.ai_score == null}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Duyệt điểm AI ({aiLabel})</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onSaveReview(grade?.overall, grade?.input)}
              disabled={isSubmitting || !canSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Lưu Điểm Mới</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
