// Modal nhap nhanh khoa hoc tu thu muc chua file Excel va video bai giang.

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import {
  X,
  FolderUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Film,
  Layers,
  HelpCircle,
  UploadCloud,
  Loader2,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import {
  parseCourseFolder,
  readVideoDuration,
  type ParsedFolderResult,
} from '@/features/courses/helpers/course.folder.import.helper'
import type { CourseFormData, CourseModule } from '@/features/courses/components/course.basic.info.tab'
import { mediaAdminService } from '@/features/media/services/media.service'
import { toast } from '@/store/toast.store'

interface CourseFolderImportModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (courseInfo: Partial<CourseFormData>, modules: CourseModule[]) => void
  isVi: boolean
  courseFolder?: string
}

export function CourseFolderImportModal({
  isOpen,
  onClose,
  onApply,
  isVi,
  courseFolder = 'courses',
}: CourseFolderImportModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadIndex, setUploadIndex] = useState(0)
  const [uploadPercent, setUploadPercent] = useState(0)
  const [currentUploadName, setCurrentUploadName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [parsedResult, setParsedResult] = useState<ParsedFolderResult | null>(null)

  const folderInputRef = useRef<HTMLInputElement | null>(null)

  if (!isOpen) return null

  const collectFilesFromDataTransfer = async (items: DataTransferItemList): Promise<File[]> => {
    const files: File[] = []

    const readEntry = async (entry: FileSystemEntry) => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry
        await new Promise<void>((resolve) => {
          fileEntry.file((file) => {
            files.push(file)
            resolve()
          }, () => resolve())
        })
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry
        const reader = dirEntry.createReader()
        const entries = await new Promise<FileSystemEntry[]>((resolve) => {
          reader.readEntries((ents) => resolve(ents), () => resolve([]))
        })
        for (const child of entries) {
          await readEntry(child)
        }
      }
    }

    const promises: Promise<void>[] = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const entry = item.webkitGetAsEntry?.()
      if (entry) {
        promises.push(readEntry(entry))
      } else {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }
    await Promise.all(promises)
    return files
  }

  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return
    setIsParsing(true)
    setError(null)

    try {
      const result = await parseCourseFolder(files)
      setParsedResult(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể phân tích thư mục khóa học'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsParsing(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer?.items) {
      const files = await collectFilesFromDataTransfer(e.dataTransfer.items)
      await processFiles(files)
    } else if (e.dataTransfer?.files) {
      await processFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(Array.from(e.target.files))
    }
  }

  const handleApplyWithoutUpload = () => {
    if (!parsedResult) return
    onApply(parsedResult.courseInfo, parsedResult.modules)
    toast.success(isVi ? 'Đã nạp toàn bộ cấu trúc khóa học vào Form thành công!' : 'Curriculum loaded successfully!')
    onClose()
  }

  const handleUploadAndApply = async () => {
    if (!parsedResult) return
    setIsUploading(true)
    setError(null)

    const updatedModules = JSON.parse(JSON.stringify(parsedResult.modules)) as CourseModule[]
    const videoFiles = parsedResult.videoFilesToUpload
    const moduleTheoryFiles = parsedResult.theoryFilesToUpload || []
    const lessonTheoryFiles = parsedResult.lessonTheoryFilesToUpload || []
    const totalFiles = videoFiles.length + moduleTheoryFiles.length + lessonTheoryFiles.length

    let totalBytes = 0
    videoFiles.forEach((v) => { totalBytes += v.file.size })
    moduleTheoryFiles.forEach((m) => { totalBytes += m.file.size })
    lessonTheoryFiles.forEach((l) => { totalBytes += l.file.size })

    const loadedBytesMap: Record<number, number> = {}
    let completedFiles = 0
    const poolLimit = 3
    const tasks: (() => Promise<void>)[] = []

    const updateCumulativeProgress = (fileIdx: number, loaded: number, name: string) => {
      loadedBytesMap[fileIdx] = loaded
      let currentTotalLoaded = 0
      Object.values(loadedBytesMap).forEach((val) => {
        currentTotalLoaded += val
      })
      const pct = totalBytes > 0 ? Math.min(100, Math.round((currentTotalLoaded * 100) / totalBytes)) : 100
      setUploadPercent(pct)
      setCurrentUploadName(name)
    }

    let globalFileIndex = 0

    videoFiles.forEach((item) => {
      const fIdx = globalFileIndex++
      tasks.push(async () => {
        updateCumulativeProgress(fIdx, 0, item.file.name)
        const [mStr, lStr] = item.lessonKey.split('-')
        const mOrder = parseInt(mStr.replace('m', ''), 10)
        const lOrder = parseInt(lStr.replace('l', ''), 10)

        const durSec = await readVideoDuration(item.file)
        const durMin = durSec >= 60 ? Math.round(durSec / 60) : Number((durSec / 60).toFixed(2))

        const uploadRes = await mediaAdminService.uploadDirectR2(
          item.file,
          courseFolder,
          (_percent, loaded) => {
            updateCumulativeProgress(fIdx, loaded, item.file.name)
          }
        )

        updateCumulativeProgress(fIdx, item.file.size, item.file.name)

        const uploadedUrl = uploadRes?.file_url || uploadRes?.url
        const targetMod = updatedModules.find((m) => m.module_order === mOrder)
        if (targetMod) {
          const targetLes = targetMod.lessons.find((l) => l.lesson_order === lOrder)
          if (targetLes) {
            targetLes.video_url = uploadedUrl || ''
            targetLes.duration_seconds = durSec
            targetLes.duration_minutes = durMin
          }
        }
      })
    })

    moduleTheoryFiles.forEach((item) => {
      const fIdx = globalFileIndex++
      tasks.push(async () => {
        updateCumulativeProgress(fIdx, 0, item.file.name)
        const uploadRes = await mediaAdminService.uploadDirectR2(
          item.file,
          courseFolder,
          (_percent, loaded) => {
            updateCumulativeProgress(fIdx, loaded, item.file.name)
          }
        )
        updateCumulativeProgress(fIdx, item.file.size, item.file.name)
        const uploadedUrl = uploadRes?.file_url || uploadRes?.url
        const targetMod = updatedModules.find((m) => m.module_order === item.moduleOrder)
        if (targetMod && uploadedUrl) {
          targetMod.theory_file_url = uploadedUrl
          targetMod.theory_file_name = item.file.name
        }
      })
    })

    lessonTheoryFiles.forEach((item) => {
      const fIdx = globalFileIndex++
      tasks.push(async () => {
        updateCumulativeProgress(fIdx, 0, item.file.name)
        const [mStr, lStr] = item.lessonKey.split('-')
        const mOrder = parseInt(mStr.replace('m', ''), 10)
        const lOrder = parseInt(lStr.replace('l', ''), 10)

        const uploadRes = await mediaAdminService.uploadDirectR2(
          item.file,
          courseFolder,
          (_percent, loaded) => {
            updateCumulativeProgress(fIdx, loaded, item.file.name)
          }
        )
        updateCumulativeProgress(fIdx, item.file.size, item.file.name)
        const uploadedUrl = uploadRes?.file_url || uploadRes?.url
        const targetMod = updatedModules.find((m) => m.module_order === mOrder)
        if (targetMod) {
          const targetLes = targetMod.lessons.find((l) => l.lesson_order === lOrder)
          if (targetLes && uploadedUrl) {
            targetLes.theory_file_url = uploadedUrl
            targetLes.theory_file_name = item.file.name
          }
        }
      })
    })

    try {
      setUploadIndex(1)
      const executing: Promise<void>[] = []
      for (const task of tasks) {
        const p: Promise<void> = Promise.resolve()
          .then(() => task())
          .then(() => {
            completedFiles++
            setUploadIndex(Math.min(completedFiles + 1, totalFiles))
            const idx = executing.indexOf(p)
            if (idx !== -1) executing.splice(idx, 1)
          })
        executing.push(p)
        if (executing.length >= poolLimit) {
          await Promise.race(executing)
        }
      }
      await Promise.all(executing)
      setUploadPercent(100)

      onApply(parsedResult.courseInfo, updatedModules)
      toast.success(isVi ? `Đã tải lên toàn bộ ${totalFiles} tài nguyên trực tiếp lên R2 thành công!` : `Successfully uploaded ${totalFiles} files to R2!`)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải lên tài nguyên thất bại'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isVi ? 'Nhập Nhanh Khóa Học Từ Thư Mục' : 'Fast Course Import From Folder'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi
                  ? 'Kéo thả thư mục chứa file Excel và các video MP4 để tự động điền Form'
                  : 'Drop course directory containing Excel and MP4 videos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!parsedResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => folderInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-10 sm:p-14 border-2 border-dashed rounded-3xl transition-all cursor-pointer text-center ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-indigo-950/20'
              }`}
            >
              <input
                ref={folderInputRef}
                type="file"
                multiple
                {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement> & {
                  webkitdirectory?: string
                  directory?: string
                })}
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-8 ring-indigo-500/5 mb-4">
                {isParsing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <FolderUp className="w-8 h-8" />
                )}
              </div>

              <div className="max-w-md space-y-1.5">
                <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {isParsing
                    ? isVi
                      ? 'Đang phân tích cấu trúc Excel & Video...'
                      : 'Parsing Excel and video files...'
                    : isVi
                    ? 'Kéo thả thư mục khóa học vào đây'
                    : 'Drop course folder here'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isVi
                    ? 'Hoặc bấm vào để duyệt chọn thư mục từ máy tính (Ví dụ thư mục D:\\data_doan\\phatam chứa file Excel và các video MP4).'
                    : 'Or click to browse folder from your device containing Excel and MP4 videos.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>File Excel 4 sheet (.xlsx)</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Video bài giảng (.mp4, .webm)</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Đề thi & câu hỏi ôn tập</span>
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {parsedResult && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {isVi ? 'Thông tin khóa học nhận diện' : 'Detected Course Information'}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span>{parsedResult.courseInfo.title}</span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedResult(null)
                      setError(null)
                    }}
                    disabled={isUploading}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline cursor-pointer"
                  >
                    {isVi ? 'Chọn thư mục khác' : 'Change folder'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[11px] block">{isVi ? 'Thể loại' : 'Category'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{parsedResult.courseInfo.category}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[11px] block">{isVi ? 'Mục tiêu TOEIC' : 'Target'}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{parsedResult.courseInfo.target_score} điểm</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[11px] block">{isVi ? 'Học phí' : 'Price'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {Number(parsedResult.courseInfo.price || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-slate-400 text-[11px] block">{isVi ? 'Giảng viên' : 'Instructor'}</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                      {parsedResult.courseInfo.author_name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{parsedResult.totalModulesCount} {isVi ? 'chương học' : 'modules'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{parsedResult.matchedVideosCount}/{parsedResult.totalLessonsCount} {isVi ? 'video khớp sẵn' : 'matched videos'}</span>
                  </span>
                  {parsedResult.missingVideosCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{parsedResult.missingVideosCount} {isVi ? 'video chưa có trong thư mục' : 'missing files'}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>{parsedResult.totalChapterQuestionsCount} {isVi ? 'câu hỏi đề thi chương' : 'exam questions'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                    <span>{parsedResult.matchedPdfsCount} {isVi ? 'tài liệu PDF (bài học & chương)' : 'PDF documents'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>{parsedResult.totalLessonQuizzesCount} {isVi ? 'câu hỏi ôn tập bài học' : 'lesson quizzes'}</span>
                  </span>
                </div>
              </div>

              {isUploading && (
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span>
                        {isVi
                          ? `Đang tải lên tài nguyên ${uploadIndex}/${parsedResult.videoFilesToUpload.length + (parsedResult.theoryFilesToUpload?.length || 0) + (parsedResult.lessonTheoryFilesToUpload?.length || 0)}: ${currentUploadName}`
                          : `Uploading resource ${uploadIndex}/${parsedResult.videoFilesToUpload.length + (parsedResult.theoryFilesToUpload?.length || 0) + (parsedResult.lessonTheoryFilesToUpload?.length || 0)}: ${currentUploadName}`}
                      </span>
                    </span>
                    <span>{uploadPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-indigo-200 dark:bg-indigo-900 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${uploadPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isVi
                      ? 'Vui lòng giữ nguyên cửa sổ này trong khi hệ thống tải các video và tài liệu PDF lên Cloudflare R2.'
                      : 'Please keep this dialog open while media and PDFs are being uploaded to Cloudflare R2.'}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h5 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {isVi ? 'Danh sách bài học & kiểm tra video' : 'Curriculum Lessons Preview'}
                </h5>
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedResult.lessons.map((les, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[11px] shrink-0">
                          {les.moduleOrder}.{les.lessonOrder}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{les.lessonTitle}</p>
                          <p className="text-[11px] text-slate-400 truncate">{les.videoFilename}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {les.matchedVideoFile ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isVi ? 'Khớp file' : 'Matched'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-[11px] font-semibold border border-amber-200/60 dark:border-amber-800/60">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{isVi ? 'Chưa thấy file' : 'Missing'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {parsedResult && (
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <span>{isVi ? 'Đóng' : 'Cancel'}</span>
            </button>

            <button
              type="button"
              onClick={handleApplyWithoutUpload}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <span>{isVi ? 'Chỉ nạp cấu trúc vào Form' : 'Apply structure only'}</span>
            </button>

            <button
              type="button"
              onClick={handleUploadAndApply}
              disabled={isUploading || parsedResult.videoFilesToUpload.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isVi ? 'Đang tải lên R2...' : 'Uploading to R2...'}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {isVi
                      ? `Tải lên ${parsedResult.videoFilesToUpload.length} video & Lưu vào Form`
                      : `Upload ${parsedResult.videoFilesToUpload.length} videos & Apply`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
