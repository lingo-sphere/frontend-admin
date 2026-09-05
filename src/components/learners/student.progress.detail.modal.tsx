/**
 * @file student.progress.detail.modal.tsx
 * @description Modal hiển thị chi tiết tiến độ các chương học, bài kiểm tra chặng và bài nộp kỹ năng của học viên
 */

import { BarChart3, X, FileCheck2, Edit3 } from 'lucide-react'
import type { StudentProgressItem, SkillSubmissionItem } from '@/services/progress.service'
import { resolveMediaUrl } from '@/utils/media.utils'

interface StudentProgressDetailModalProps {
  student: StudentProgressItem | null
  submissions: SkillSubmissionItem[]
  onOpenReview: (submission: SkillSubmissionItem) => void
  onClose: () => void
}

export function StudentProgressDetailModal({
  student,
  submissions,
  onOpenReview,
  onClose,
}: StudentProgressDetailModalProps) {
  if (!student) return null

  const studentSubs = submissions.filter((s) => s.user_id === student.user_id)

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 space-y-5 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Chi Tiết Tiến Độ Các Chương Học
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>
                  Học viên: <strong className="text-slate-700 dark:text-slate-200">{student.full_name || student.user_id}</strong>
                </span>
                {student.course_title && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    • {student.course_title}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Hoàn thành</span>
              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                {Math.min(100, Math.max(0, student.progress_percentage || 0))}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Bài học</span>
              <span className="text-base font-black text-slate-800 dark:text-slate-200">
                {student.completed_lessons} / {student.total_lessons || student.completed_lessons || 1}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-semibold">Tăng trưởng</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                +{student.total_score_growth || 0} XP
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Cột mốc kiểm tra từng chương (Post-mini Tests & Challenge):
            </h4>
            {student.modules_progress && student.modules_progress.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {student.modules_progress.map((m, idx) => {
                  const modOrder = m.order_index || idx + 1
                  const challengeScore = typeof m.challenge_score === 'number' ? m.challenge_score : -1
                  const postMiniScore = typeof m.post_mini_score === 'number' ? m.post_mini_score : -1
                  const hasChallenge = m.challenge_taken || m.is_passed_by_challenge || challengeScore > 0
                  const hasPostMini = postMiniScore > 0 || (typeof m.post_mini_score === 'number' && m.post_mini_score >= 0 && !hasChallenge)
                  const isPassed = m.status === 'COMPLETED' || m.is_passed_by_challenge || (challengeScore >= 70) || (postMiniScore >= 70)

                  return (
                    <div
                      key={m.module_id || idx}
                      className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-bold flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300">
                          {modOrder}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {m.title || `Chương ${modOrder}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {hasChallenge ? (
                            <span className="text-slate-500">
                              Thử thách: <strong className="text-emerald-600">{challengeScore >= 0 ? `${challengeScore}đ` : '-'}</strong>
                            </span>
                          ) : null}
                          {hasPostMini ? (
                            <span className="text-slate-500">
                              Post-mini: <strong className="text-indigo-600">{postMiniScore >= 0 ? `${postMiniScore}đ` : '-'}</strong>
                            </span>
                          ) : null}
                          {!hasChallenge && !hasPostMini ? (
                            <span className="text-slate-400 italic">Chưa làm test</span>
                          ) : null}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isPassed ? 'Đã hoàn thành' : (m.status === 'LOCKED' ? 'Đang khóa' : 'Đang học')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Học viên chưa thực hiện bài kiểm tra chương nào.
              </p>
            )}

            {/* Student's Speaking & Writing Submissions */}
            {studentSubs.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-indigo-500" />
                    <span>Bài nộp kỹ năng Nói & Viết ({studentSubs.length}):</span>
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {studentSubs.map((sub) => {
                    const isReviewed = sub.is_teacher_reviewed || sub.status === 'TEACHER_REVIEWED'
                    return (
                      <div
                        key={sub._id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                sub.skill === 'SPEAKING'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {sub.skill === 'SPEAKING' ? '🎙️ Speaking' : '✍️ Writing'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Điểm AI: <span className="text-purple-600 dark:text-purple-400">{sub.ai_score}đ</span>
                              {sub.teacher_score !== undefined && (
                                <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                                  • GV: {sub.teacher_score}đ
                                </span>
                              )}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenReview(sub)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isReviewed ? 'Sửa điểm' : 'Chấm điểm'}</span>
                          </button>
                        </div>

                        {sub.skill === 'SPEAKING' && sub.audio_url && (
                          <audio
                            controls
                            className="w-full h-7"
                            src={resolveMediaUrl(sub.audio_url)}
                            preload="metadata"
                          />
                        )}

                        {sub.skill === 'SPEAKING' && sub.whisper_transcript && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                            Whisper: &ldquo;{sub.whisper_transcript}&rdquo;
                          </p>
                        )}

                        {sub.skill === 'WRITING' && sub.essay_text && (
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                            {sub.essay_text}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
