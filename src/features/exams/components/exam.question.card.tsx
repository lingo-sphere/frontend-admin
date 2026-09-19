// Card hiển thị và chỉnh sửa chi tiết câu hỏi đề thi trong quản trị.

import { Copy, Trash2, Volume2, Image as ImageIcon, Loader2, X, Maximize2 } from 'lucide-react'
import { Popconfirm } from '@/components/popconfirm'
import { CustomSelect, type SelectOption } from '@/components/custom.select'
import { NumberInput } from '@/components/number.input'
import { Image } from 'antd'
import type { ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'

const SKILL_OPTIONS_2: SelectOption[] = [
  { value: 'LISTENING', label: 'Nghe (Listening)' },
  { value: 'READING', label: 'Đọc (Reading)' },
]

const SKILL_OPTIONS_4: SelectOption[] = [
  { value: 'LISTENING', label: 'Nghe (Listening)' },
  { value: 'READING', label: 'Đọc (Reading)' },
  { value: 'SPEAKING', label: 'Nói (Speaking)' },
  { value: 'WRITING', label: 'Viết (Writing)' },
]

const LETTERS = ['A', 'B', 'C', 'D']

interface ExamQuestionCardProps {
  question: ExamQuestionItem
  index: number
  isVi: boolean
  skillsMode?: '2SKILLS' | '4SKILLS'
  isUploadingAudio: boolean
  isUploadingImage: boolean
  onUpdate: (updates: Partial<ExamQuestionItem>) => void
  onOptionChange: (optionIdx: number, val: string) => void
  onDuplicate: () => void
  onDelete: () => void
  onRequestUploadAudio: () => void
  onRequestUploadImage: () => void
}

export function ExamQuestionCard({
  question: q,
  index: qIndex,
  isVi,
  skillsMode = '2SKILLS',
  isUploadingAudio,
  isUploadingImage,
  onUpdate,
  onOptionChange,
  onDuplicate,
  onDelete,
  onRequestUploadAudio,
  onRequestUploadImage,
}: ExamQuestionCardProps) {
  const currentSkill: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' =
    q.skill_type ||
    (q.question_type === 'SPEAKING' || q.part_number === 'speaking'
      ? 'SPEAKING'
      : q.question_type === 'WRITING' || q.part_number === 'writing'
        ? 'WRITING'
        : typeof q.part_number === 'number' && q.part_number <= 4
          ? 'LISTENING'
          : 'READING')

  const isSpeaking = currentSkill === 'SPEAKING'
  const isWriting = currentSkill === 'WRITING'
  const isListening = currentSkill === 'LISTENING'
  const isReading = currentSkill === 'READING'

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            {qIndex + 1}
          </span>

          <div className="w-56 max-w-full">
            <CustomSelect
              value={currentSkill}
              onChange={(val) => {
                const skill = val as 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'
                const isSp = skill === 'SPEAKING'
                const isWr = skill === 'WRITING'
                onUpdate({
                  skill_type: skill,
                  part_number: isSp ? 'speaking' : isWr ? 'writing' : undefined,
                  question_type: isSp ? 'SPEAKING' : isWr ? 'WRITING' : 'MULTIPLE_CHOICE',
                  options: isSp || isWr ? [] : q.options.length ? q.options : ['', '', '', ''],
                })
              }}
              options={skillsMode === '4SKILLS' ? SKILL_OPTIONS_4 : SKILL_OPTIONS_2}
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
            title={isVi ? 'Nhân bản câu này' : 'Duplicate question'}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <Popconfirm
            title={isVi ? 'Xóa câu hỏi này?' : 'Delete this question?'}
            onConfirm={onDelete}
          >
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              title={isVi ? 'Xóa câu hỏi' : 'Delete question'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Popconfirm>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {isSpeaking
            ? 'Đề bài / Yêu cầu phần thi Nói (Prompt):'
            : isWriting
            ? 'Đề bài / Yêu cầu phần thi Viết (Prompt):'
            : isListening
            ? 'Nội dung câu hỏi phần Nghe:'
            : 'Nội dung câu hỏi phần Đọc:'}
        </label>
        <textarea
          rows={2}
          value={q.question_text}
          onChange={(e) => onUpdate({ question_text: e.target.value })}
          placeholder={
            isSpeaking
              ? 'Ví dụ: Describe what you see in the photo in as much detail as possible...'
              : isWriting
              ? 'Ví dụ: You received an email from your manager. Write a response addressing two points...'
              : isListening
              ? 'Nhập nội dung câu hỏi nghe hoặc câu hỏi dẫn...'
              : 'Nhập câu hỏi (ví dụ: Mr. Henderson requested that the quarterly report _____ by Friday.)...'
          }
          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {(() => {
        const isAudioUrl = (url?: string | null) => {
          if (!url) return false
          return /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(url) || url.includes('audio')
        }
        const isImageUrl = (url?: string | null) => {
          if (!url) return false
          return /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(url) || url.includes('image')
        }

        const audioSrc = q.audio_url || (isAudioUrl(q.media_url) ? q.media_url : undefined)
        const imageSrc = q.image_url || (isImageUrl(q.media_url) ? q.media_url : undefined)
        const hasAudio = Boolean(audioSrc)
        const hasImage = Boolean(imageSrc)

        return (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {(isListening || hasAudio) && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploadingAudio}
                  onClick={onRequestUploadAudio}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {isUploadingAudio ? (
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-indigo-500" />
                  )}
                  <span>{hasAudio ? 'Đổi Audio câu' : 'Thêm Audio câu'}</span>
                </button>
                {hasAudio && audioSrc && (
                  <div className="flex items-center gap-1">
                    <audio controls src={audioSrc} className="h-6 max-w-[180px]" />
                    <button
                      type="button"
                      onClick={() => onUpdate({ media_url: undefined, audio_url: undefined })}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Xóa audio"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {(isListening || isReading || hasImage) && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={onRequestUploadImage}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                  ) : (
                    <ImageIcon className="w-3 h-3 text-amber-500" />
                  )}
                  <span>{hasImage ? 'Đổi ảnh câu' : 'Thêm Ảnh câu'}</span>
                </button>
                {hasImage && imageSrc && (
                  <div className="flex items-center gap-1.5">
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs leading-none">
                      <Image
                        src={imageSrc}
                        alt={isVi ? `Ảnh câu hỏi ${qIndex + 1}` : `Question ${qIndex + 1}`}
                        width={56}
                        height={32}
                        className="object-cover rounded-md"
                        preview={{
                          mask: (
                            <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold text-white">
                              <Maximize2 className="w-2.5 h-2.5" />
                              <span>{isVi ? 'Xem' : 'View'}</span>
                            </div>
                          ),
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => onUpdate({ image_url: undefined, ...(q.media_url && isImageUrl(q.media_url) ? { media_url: undefined } : {}) })}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title={isVi ? 'Xóa ảnh' : 'Remove image'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {!isSpeaking && !isWriting ? (
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {isVi ? 'Các lựa chọn đáp án (Chọn nút tròn ở đáp án ĐÚNG):' : 'Options (Mark the correct answer):'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LETTERS.map((letter, optIdx) => {
              const isCorrect = (q.correct_answer || 'A').toUpperCase() === letter
              return (
                <div
                  key={letter}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-400/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onUpdate({ correct_answer: letter })}
                    className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                      isCorrect
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                    title={`Đặt ${letter} làm đáp án đúng`}
                  >
                    {letter}
                  </button>
                  <input
                    type="text"
                    value={q.options[optIdx] || ''}
                    onChange={(e) => onOptionChange(optIdx, e.target.value)}
                    placeholder={`Lựa chọn ${letter}...`}
                    className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          {isSpeaking && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Thời gian chuẩn bị (giây):
                </label>
                <NumberInput
                  min={10}
                  max={120}
                  fallbackValue={45}
                  value={q.prep_time_seconds || 45}
                  onChange={(val) => onUpdate({ prep_time_seconds: val })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Thời gian trả lời / nói (giây):
                </label>
                <NumberInput
                  min={15}
                  max={180}
                  fallbackValue={60}
                  value={q.response_time_seconds || 60}
                  onChange={(val) => onUpdate({ response_time_seconds: val })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            </>
          )}
          {isWriting && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Số từ tối thiểu (words):
              </label>
              <NumberInput
                min={30}
                max={600}
                fallbackValue={100}
                value={q.min_words || 100}
                onChange={(val) => onUpdate({ min_words: val })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-1 pt-1">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isVi ? 'Lời giải thích chi tiết đáp án:' : 'Answer explanation / key notes:'}
        </label>
        <input
          type="text"
          value={q.explanation || ''}
          onChange={(e) => onUpdate({ explanation: e.target.value })}
          placeholder={isVi ? 'Giải thích vì sao chọn đáp án này, ngữ pháp / từ vựng áp dụng...' : 'Explain why this answer is correct...'}
          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
    </div>
  )
}
