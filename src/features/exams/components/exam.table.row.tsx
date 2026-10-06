// Component dòng dữ liệu hiển thị thông tin từng đề thi TOEIC.

import { useState, useRef, useEffect, useMemo } from 'react'
import { FileText, Clock, HelpCircle, Trash2, Volume2, Pause, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { Image } from 'antd'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { Popconfirm } from '@/components/popconfirm'
import { resolveMediaUrl } from '@/lib/media.utils'

interface ExamTableRowProps {
  exam: ToeicExamItem
  isVi: boolean
  onTogglePublish: (id: string, current: boolean) => void
  onDeleteExam: (id: string) => Promise<void> | void
  onManageQuestions?: (exam: ToeicExamItem) => void
}

export function ExamTableRow({
  exam,
  isVi,
  onTogglePublish,
  onDeleteExam,
  onManageQuestions,
}: ExamTableRowProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const imageUrls = useMemo(() => {
    if (!exam.questions || !Array.isArray(exam.questions)) return []
    return exam.questions
      .map((q) => {
        const item = q as Record<string, unknown>
        const raw =
          typeof item.image_url === 'string' && item.image_url
            ? item.image_url
            : typeof item.media_url === 'string' && /\.(jpg|jpeg|png|webp)/i.test(item.media_url)
              ? item.media_url
              : undefined
        return raw ? resolveMediaUrl(raw) : undefined
      })
      .filter((url): url is string => Boolean(url))
  }, [exam.questions])

  const resolvedAudioUrl = useMemo(
    () => (exam.audio_url ? resolveMediaUrl(exam.audio_url) : ''),
    [exam.audio_url]
  )
  const hasAudio = Boolean(resolvedAudioUrl)

  const toggleAudio = () => {
    if (!resolvedAudioUrl) return

    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(resolvedAudioUrl)
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.onerror = () => setIsPlaying(false)
    }

    audioRef.current.play().then(() => {
      setIsPlaying(true)
    }).catch(() => {
      setIsPlaying(false)
    })
  }

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-[background-color] duration-100">
      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
        <div className="flex items-center gap-2.5">
          <FileText size={16} className="text-indigo-500 shrink-0" />
          <span>{exam.title}</span>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
            {exam.type}
          </span>
          {exam.skills_enabled === 'ALL' || exam.skills_enabled === '4SKILLS' || exam.skills_enabled === 'LRSW' ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
              4 Kỹ Năng
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
              2 Kỹ Năng
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className="flex items-center gap-1">
          <Clock size={13} className="text-slate-400" />
          {exam.duration_minutes} {isVi ? 'phút' : 'mins'}
        </span>
      </td>
      <td className="py-3.5 px-4">
        {exam.total_questions === 0 || (!exam.questions?.length && exam.total_questions === 0) ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            0 {isVi ? 'câu (Chưa có câu hỏi)' : 'questions (Empty)'}
          </span>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
            <HelpCircle size={13} className="text-slate-400" />
            {exam.questions?.length ?? exam.total_questions} {isVi ? 'câu' : 'questions'}
          </span>
        )}
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2 flex-wrap">
          {hasAudio ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleAudio}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs animate-pulse'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                }`}
                title={isVi ? (isPlaying ? 'Tạm dừng audio' : 'Nghe thử audio đề thi') : (isPlaying ? 'Pause audio' : 'Play audio preview')}
              >
                {isPlaying ? (
                  <>
                    <Pause size={10} className="fill-current" />
                    <span>{isVi ? 'Đang phát' : 'Playing'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={11} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Audio (LC)</span>
                  </>
                )}
              </button>
              <a
                href={resolvedAudioUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                title={isVi ? 'Mở liên kết audio trong tab mới' : 'Open audio link'}
              >
                <ExternalLink size={11} />
              </a>
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              {isVi ? 'Chưa có audio' : 'No audio'}
            </span>
          )}

          {imageUrls.length > 0 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowImagePreview(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                title={isVi ? 'Xem hình ảnh đề thi' : 'View exam pictures'}
              >
                <ImageIcon size={11} className="text-amber-500" />
                <span>{imageUrls.length} {isVi ? 'ảnh (Part 1)' : 'imgs'}</span>
              </button>
              <div className="hidden">
                <Image.PreviewGroup
                  preview={{
                    visible: showImagePreview,
                    onVisibleChange: (vis) => setShowImagePreview(vis),
                  }}
                  items={imageUrls}
                />
              </div>
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              {isVi ? 'Chưa có ảnh' : 'No image'}
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
        {(exam.total_attempts || 0).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
      </td>
      <td className="py-3.5 px-4 font-bold text-teal-600 dark:text-teal-400">
        {exam.avg_score || 0} pts
      </td>
      <td className="py-3.5 px-4">
        <button
          type="button"
          onClick={() =>
            onTogglePublish(exam._id || '', exam.is_published ?? true)
          }
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
            exam.is_published
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
              : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          }`}
        >
          {exam.is_published
            ? (isVi ? 'Xuất bản' : 'Published')
            : (isVi ? 'Bản nháp' : 'Draft')}
        </button>
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {onManageQuestions && (
            <button
              type="button"
              onClick={() => onManageQuestions(exam)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors cursor-pointer"
              title={isVi ? 'Soạn / Quản lý câu hỏi' : 'Manage Questions'}
            >
              <HelpCircle size={13} />
              <span className="hidden sm:inline">{isVi ? 'Soạn câu hỏi' : 'Questions'}</span>
            </button>
          )}
          <Popconfirm
            title={isVi ? 'Xóa đề thi này?' : 'Delete this exam?'}
            description={
              isVi
                ? 'Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu câu hỏi liên quan.'
                : 'This action cannot be undone and will delete all related questions.'
            }
            okText={isVi ? 'Xóa' : 'Delete'}
            cancelText={isVi ? 'Hủy' : 'Cancel'}
            okType="danger"
            placement="topRight"
            onConfirm={() => onDeleteExam(exam._id || '')}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title={isVi ? 'Xóa đề thi' : 'Delete exam'}
              type="button"
            >
              <Trash2 size={14} />
            </button>
          </Popconfirm>
        </div>
      </td>
    </tr>
  )
}
