// Quản lý bài kiểm tra đánh giá kết thúc từng chương học.

import { useState, useRef } from 'react'
import { Award, Clock } from 'lucide-react'
import { NumberInput } from '@/components/common/number.input'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast.store'
import type { CourseModule } from './course.basic.info.tab'
import { ChapterSpeakingWritingCard } from './chapter.speaking.writing.card'
import { ChapterAssessmentSummary } from './chapter.assessment.summary'

interface ChapterAssessmentCardProps {
  module: CourseModule
  chapterIndex?: number
  isVi: boolean
  is4Skills?: boolean
  onUpdateModule: (updated: Partial<CourseModule>) => void
  onOpenStudio: () => void
}

export function ChapterAssessmentCard({
  module,
  chapterIndex = 0,
  isVi,
  is4Skills = false,
  onUpdateModule,
  onOpenStudio,
}: ChapterAssessmentCardProps) {
  const speakingFileInputRef = useRef<HTMLInputElement>(null)
  const writingFileInputRef = useRef<HTMLInputElement>(null)

  const [isUploadingSpeakingFile, setIsUploadingSpeakingFile] = useState(false)
  const [isUploadingWritingFile, setIsUploadingWritingFile] = useState(false)

  const questionsList =
    module.test_questions ||
    module.post_mini_questions ||
    module.challenge_questions ||
    []
  const questionCount = questionsList.length
  const passingScore =
    module.passing_score ??
    module.post_mini_passing_score ??
    module.challenge_passing_score ??
    70

  const handleSpeakingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(pdf|doc|docx|txt|mp3|wav|png|jpg|jpeg)$/i.test(file.name)) {
      toast.error('Định dạng file không được hỗ trợ')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file không được vượt quá 50MB')
      return
    }

    setIsUploadingSpeakingFile(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'chapter-speaking')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        onUpdateModule({ speaking_file_url: uploadedUrl })
        toast.success(
          isVi
            ? `Đã tải lên file đề Speaking: ${file.name}`
            : `Uploaded speaking file: ${file.name}`
        )
      } else {
        toast.error('Không nhận được đường dẫn file tải lên.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file lên máy chủ.'
      toast.error(msg)
    } finally {
      setIsUploadingSpeakingFile(false)
      if (speakingFileInputRef.current) speakingFileInputRef.current.value = ''
    }
  }

  const handleWritingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(pdf|doc|docx|txt|png|jpg|jpeg)$/i.test(file.name)) {
      toast.error('Định dạng file không được hỗ trợ')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dung lượng file không được vượt quá 50MB')
      return
    }

    setIsUploadingWritingFile(true)
    try {
      const res = await mediaAdminService.uploadFile(file, 'chapter-writing')
      const uploadedUrl = res.file_url || res.url || res.public_url
      if (uploadedUrl) {
        onUpdateModule({ writing_file_url: uploadedUrl })
        toast.success(
          isVi
            ? `Đã tải lên file tài liệu Writing: ${file.name}`
            : `Uploaded writing file: ${file.name}`
        )
      } else {
        toast.error('Không nhận được đường dẫn file tải lên.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải file lên máy chủ.'
      toast.error(msg)
    } finally {
      setIsUploadingWritingFile(false)
      if (writingFileInputRef.current) writingFileInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-4 sm:p-5 dark:border-indigo-500/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-200/60 dark:border-indigo-900/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm ring-4 ring-indigo-500/20 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase">
                {isVi ? `Bài Test Chương ${chapterIndex + 1}` : `Chapter ${chapterIndex + 1} Test`}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                {isVi ? 'Đánh Giá Tiến Độ & Mở Khóa' : 'Assessment & Unlock Exam'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isVi
                ? 'Học viên cần đạt ngưỡng điểm để hoàn thành chương này và được mở khóa chương tiếp theo'
                : 'Students must meet passing score to complete this chapter and unlock the next'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {isVi ? 'Thời lượng:' : 'Duration:'}
            </span>
            <div className="flex items-center gap-1">
              <NumberInput
                min={5}
                max={180}
                fallbackValue={15}
                value={module.challenge_duration_minutes ?? module.duration_minutes ?? 15}
                onChange={(val) => {
                  onUpdateModule({
                    challenge_duration_minutes: val,
                    duration_minutes: val,
                  })
                }}
                className="w-12 h-7 text-center rounded-lg border border-indigo-200 bg-indigo-50/50 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:border-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {isVi ? 'phút' : 'min'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {isVi ? 'Điểm đạt tối thiểu:' : 'Passing score:'}
            </span>
            <div className="flex items-center gap-1">
              <NumberInput
                min={10}
                max={100}
                fallbackValue={70}
                value={passingScore}
                onChange={(val) => {
                  onUpdateModule({
                    passing_score: val,
                    challenge_passing_score: val,
                    post_mini_passing_score: val,
                  })
                }}
                className="w-12 h-7 text-center rounded-lg border border-indigo-200 bg-indigo-50/50 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:border-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">%</span>
            </div>
          </div>
        </div>
      </div>

      <ChapterAssessmentSummary
        questionCount={questionCount}
        isVi={isVi}
        onOpenStudio={onOpenStudio}
      />

      {is4Skills && (
        <ChapterSpeakingWritingCard
          module={module}
          chapterIndex={chapterIndex}
          isVi={isVi}
          isUploadingSpeakingFile={isUploadingSpeakingFile}
          isUploadingWritingFile={isUploadingWritingFile}
          speakingFileInputRef={speakingFileInputRef}
          writingFileInputRef={writingFileInputRef}
          onUpdateModule={onUpdateModule}
        />
      )}

      <input
        ref={speakingFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,audio/*,image/*,.mp3,.wav,.png,.jpg,.jpeg"
        onChange={handleSpeakingFileUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />

      <input
        ref={writingFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,image/*,.png,.jpg,.jpeg"
        onChange={handleWritingFileUpload}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        className="hidden"
      />
    </div>
  )
}
