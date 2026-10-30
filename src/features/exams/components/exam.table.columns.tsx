// Cấu hình các cột hiển thị chuẩn hóa cho bảng danh sách đề thi TOEIC.

import { useState, useRef, useEffect, useMemo } from 'react'
import { FileText, Clock, HelpCircle, Volume2, Pause, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { Button, Image, Tooltip } from 'antd'
import type { DataTableColumn } from '@/components/data.table'
import type { ToeicExamItem } from '@/features/exams/services/exam.service'
import { TableRowActions } from '@/components/table.row.actions'
import { TableStatusSwitch } from '@/components/table.status.switch'
import { resolveMediaUrl } from '@/lib/media.utils'

interface GetExamColumnsOptions {
  isVi: boolean
  onTogglePublish: (id: string, current: boolean) => void
  onDeleteExam: (id: string) => Promise<void> | void
  onManageQuestions?: (exam: ToeicExamItem) => void
}

function ExamMediaCell({ exam, isVi }: { exam: ToeicExamItem; isVi: boolean }) {
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

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false))
  }

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
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
            href={resolvedAudioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title={isVi ? 'Mở tab nghe riêng' : 'Open in new tab'}
          >
            <ExternalLink size={11} />
          </a>
        </div>
      ) : (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          {isVi ? 'Không có audio' : 'No audio'}
        </span>
      )}

      {imageUrls.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setShowImagePreview(true)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 transition-colors cursor-pointer"
            title={isVi ? `Xem trước ${imageUrls.length} ảnh câu hỏi` : `Preview ${imageUrls.length} images`}
          >
            <ImageIcon size={11} className="text-blue-600 dark:text-blue-400" />
            <span>{imageUrls.length} {isVi ? 'ảnh' : 'imgs'}</span>
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
  )
}

export function getExamColumns({
  isVi,
  onTogglePublish,
  onDeleteExam,
  onManageQuestions,
}: GetExamColumnsOptions): DataTableColumn<ToeicExamItem>[] {
  return [
    {
      key: 'title',
      title: isVi ? 'Tên đề thi' : 'Exam Title',
      align: 'left',
      minWidth: 260,
      sortable: true,
      render: (exam) => (
        <div className="flex items-center gap-2.5 min-w-0 w-full">
          <FileText size={16} className="text-indigo-500 shrink-0" />
          <Tooltip title={exam.title} placement="topLeft" mouseEnterDelay={0.3}>
            <button
              type="button"
              onClick={() => onManageQuestions && onManageQuestions(exam)}
              className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 hover:underline text-left cursor-pointer truncate flex-1 min-w-0"
            >
              {exam.title}
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      key: 'type',
      title: isVi ? 'Loại đề' : 'Type',
      sortable: true,
      width: 140,
      align: 'center',
      render: (exam) => (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
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
      ),
    },
    {
      key: 'duration',
      title: isVi ? 'Thời lượng' : 'Duration',
      width: 130,
      align: 'center',
      sortable: true,
      render: (exam) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          <Clock size={12} className="text-slate-400" />
          {exam.duration_minutes} {isVi ? 'phút' : 'mins'}
        </span>
      ),
    },
    {
      key: 'questions',
      title: isVi ? 'Số câu' : 'Questions',
      width: 120,
      align: 'center',
      sortable: true,
      render: (exam) =>
        exam.total_questions === 0 || (!exam.questions?.length && exam.total_questions === 0) ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            0 {isVi ? 'câu' : 'questions'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-indigo-600 dark:text-indigo-400">
            <HelpCircle size={13} className="text-slate-400" />
            {exam.questions?.length ?? exam.total_questions} {isVi ? 'câu' : 'questions'}
          </span>
        ),
    },
    {
      key: 'media',
      title: isVi ? 'Tài nguyên' : 'Media',
      width: 140,
      align: 'center',
      render: (exam) => <ExamMediaCell exam={exam} isVi={isVi} />,
    },
    {
      key: 'attempts',
      title: isVi ? 'Lượt thi' : 'Attempts',
      width: 110,
      align: 'center',
      sortable: true,
      render: (exam) => (
        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">
          {(exam.total_attempts || 0).toLocaleString(isVi ? 'vi-VN' : 'en-US')}
        </span>
      ),
    },
    {
      key: 'score',
      title: isVi ? 'Điểm TB' : 'Avg Score',
      width: 110,
      align: 'center',
      sortable: true,
      render: (exam) => (
        <span className="font-bold text-xs text-teal-600 dark:text-teal-400 font-mono">
          {exam.avg_score || 0} pts
        </span>
      ),
    },
    {
      key: 'status',
      title: isVi ? 'Trạng thái' : 'Status',
      sortable: true,
      width: 110,
      align: 'center',
      render: (exam) => (
        <TableStatusSwitch
          checked={Boolean(exam.is_published)}
          checkedChildren="Bật"
          unCheckedChildren="Ẩn"
          ariaLabel={`Xuất bản ${exam.title}`}
          onChange={() => onTogglePublish(exam._id || '', Boolean(exam.is_published))}
        />
      ),
    },
    {
      key: 'actions',
      title: isVi ? 'Thao tác' : 'Actions',
      width: 100,
      align: 'center',
      render: (exam) => (
        <TableRowActions
          isVi={isVi}
          onDelete={() => onDeleteExam(exam._id || '')}
          deleteTitle={isVi ? 'Xóa đề thi này?' : 'Delete this exam?'}
          deleteDescription={
            isVi
              ? 'Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu câu hỏi liên quan.'
              : 'This action cannot be undone and will delete all related questions.'
          }
          extraActions={
            onManageQuestions && (
              <Tooltip title={isVi ? 'Soạn / Quản lý câu hỏi' : 'Manage Questions'}>
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<HelpCircle size={14} />}
                  onClick={() => onManageQuestions(exam)}
                  className="!text-amber-600 !border-amber-200/80 !bg-amber-50/80 hover:!bg-amber-100 hover:!border-amber-300 dark:!bg-amber-950/60 dark:!border-amber-800 dark:!text-amber-400 dark:hover:!bg-amber-900/60 shadow-2xs"
                />
              </Tooltip>
            )
          }
        />
      ),
    },
  ]
}
