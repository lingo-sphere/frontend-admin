// Modal nhap nhanh khoa hoc tu thu muc chua file Excel va video bai giang cung tai lieu PDF.

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
  FileText,
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

    const readAllDirectoryEntries = async (dirReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
      const allEntries: FileSystemEntry[] = []
      const readBatch = (): Promise<FileSystemEntry[]> => {
        return new Promise((resolve) => {
          dirReader.readEntries(
            (entries) => resolve(entries || []),
            () => resolve([])
          )
        })
      }
      let batch = await readBatch()
      while (batch.length > 0) {
        allEntries.push(...batch)
        batch = await readBatch()
      }
      return allEntries
    }

    const readEntry = async (entry: FileSystemEntry) => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry
        await new Promise<void>((resolve) => {
          fileEntry.file(
            (file) => {
              files.push(file)
              resolve()
            },
            () => resolve()
          )
        })
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry
        const reader = dirEntry.createReader()
        const entries = await readAllDirectoryEntries(reader)
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
    const updatedCourseInfo: Partial<CourseFormData> = { ...parsedResult.courseInfo }
    const videoFiles = parsedResult.videoFilesToUpload
    const moduleTheoryFiles = parsedResult.theoryFilesToUpload || []
    const lessonTheoryFiles = parsedResult.lessonTheoryFilesToUpload || []
    const courseDocFile = parsedResult.courseDocumentFileToUpload
    const courseThumbFile = parsedResult.courseThumbnailFileToUpload
    const totalFiles =
      videoFiles.length +
      moduleTheoryFiles.length +
      lessonTheoryFiles.length +
      (courseDocFile ? 1 : 0) +
      (courseThumbFile ? 1 : 0)

    let totalBytes = 0
    videoFiles.forEach((v) => { totalBytes += v.file.size })
    moduleTheoryFiles.forEach((m) => { totalBytes += m.file.size })
    lessonTheoryFiles.forEach((l) => { totalBytes += l.file.size })
    if (courseDocFile) { totalBytes += courseDocFile.size }
    if (courseThumbFile) { totalBytes += courseThumbFile.size }

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

    if (courseThumbFile) {
      const fIdx = globalFileIndex++
      tasks.push(async () => {
        updateCumulativeProgress(fIdx, 0, courseThumbFile.name)
        const uploadRes = await mediaAdminService.uploadDirectR2(
          courseThumbFile,
          courseFolder,
          (_percent, loaded) => {
            updateCumulativeProgress(fIdx, loaded, courseThumbFile.name)
          }
        )
        updateCumulativeProgress(fIdx, courseThumbFile.size, courseThumbFile.name)
        const uploadedUrl = uploadRes?.file_url || uploadRes?.url
        if (uploadedUrl) {
          updatedCourseInfo.thumbnail_url = uploadedUrl
        }
      })
    }

    if (courseDocFile) {
      const fIdx = globalFileIndex++
      tasks.push(async () => {
        updateCumulativeProgress(fIdx, 0, courseDocFile.name)
        const uploadRes = await mediaAdminService.uploadDirectR2(
          courseDocFile,
          courseFolder,
          (_percent, loaded) => {
            updateCumulativeProgress(fIdx, loaded, courseDocFile.name)
          }
        )
        updateCumulativeProgress(fIdx, courseDocFile.size, courseDocFile.name)
        const uploadedUrl = uploadRes?.file_url || uploadRes?.url
        if (uploadedUrl) {
          updatedCourseInfo.document_url = uploadedUrl
          updatedCourseInfo.document_name = courseDocFile.name
        }
      })
    }

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

      onApply(updatedCourseInfo, updatedModules)
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

  const totalFilesToUploadCount = parsedResult
    ? parsedResult.videoFilesToUpload.length +
      parsedResult.theoryFilesToUpload.length +
      parsedResult.lessonTheoryFilesToUpload.length +
      (parsedResult.courseDocumentFileToUpload ? 1 : 0) +
      (parsedResult.courseThumbnailFileToUpload ? 1 : 0)
    : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {isVi ? 'Nhập khóa học nhanh từ Thư mục' : 'Import Course from Folder'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi
                  ? 'Quét file Excel cấu hình, tự động khớp video & upload trực tiếp lên Cloudflare R2'
                  : 'Parse Excel config, auto match videos and upload directly to Cloudflare R2'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
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
              onClick={() => !isParsing && folderInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-950/30'
              }`}
            >
              <input
                ref={folderInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
                {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/10">
                {isParsing ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <FolderUp className="w-8 h-8" />
                )}
              </div>

              <div className="space-y-1.5 max-w-md">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {isParsing
                    ? isVi
                      ? 'Đang đọc và phân tích cấu trúc khóa học...'
                      : 'Analyzing folder and files...'
                    : isVi
                    ? 'Kéo thả thư mục khóa học hoặc bấm để chọn'
                    : 'Drag and drop course folder or click to choose'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isVi
                    ? 'Thư mục cần chứa file Excel (.xlsx) cấu hình khóa học cùng toàn bộ video bài giảng (.mp4) và tài liệu (.pdf).'
                    : 'Folder must contain course Excel file (.xlsx) along with video files (.mp4) and documents (.pdf).'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500 pt-2">
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
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  <span>Tài liệu PDF bài học & chương</span>
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>{parsedResult.matchedPdfsCount} {isVi ? 'tài liệu PDF khớp' : 'PDF documents'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                    <span>{parsedResult.totalChapterQuestionsCount} {isVi ? 'câu hỏi đề thi chương' : 'exam questions'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>{parsedResult.totalLessonQuizzesCount} {isVi ? 'câu hỏi ôn tập bài học' : 'lesson quizzes'}</span>
                  </span>
                  {parsedResult.courseThumbnailFileToUpload && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isVi ? 'Ảnh Thumbnail' : 'Thumbnail image'}</span>
                    </span>
                  )}
                  {parsedResult.totalFinalQuestionsCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{parsedResult.totalFinalQuestionsCount} {isVi ? 'câu hỏi tốt nghiệp Final Test' : 'final test questions'}</span>
                    </span>
                  )}
                </div>
              </div>

              {isUploading && (
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                      <span>
                        {isVi
                          ? `Đang tải lên tài nguyên ${uploadIndex}/${totalFilesToUploadCount}: ${currentUploadName}`
                          : `Uploading resource ${uploadIndex}/${totalFilesToUploadCount}: ${currentUploadName}`}
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
                  {isVi ? 'Danh sách bài học & tài liệu kiểm tra' : 'Curriculum Lessons & Documents Preview'}
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
                          <p className="text-[11px] text-slate-400 truncate">
                            {les.videoFilename}
                            {les.lessonTheoryFile ? ` • Tài liệu: ${les.lessonTheoryFile}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {les.lessonTheoryFile && (
                          les.matchedTheoryFile ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 text-[10.5px] font-semibold border border-sky-200/60 dark:border-sky-800/60" title={les.matchedTheoryFile.name}>
                              <FileText className="w-3 h-3 text-sky-600" />
                              <span>PDF</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-[10.5px] font-semibold border border-amber-200/60 dark:border-amber-800/60" title={`Thiếu file: ${les.lessonTheoryFile}`}>
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Thiếu PDF</span>
                            </span>
                          )
                        )}

                        {les.matchedVideoFile ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isVi ? 'Khớp video' : 'Matched video'}</span>
                          </span>
                        ) : les.videoFilename ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-[11px] font-semibold border border-amber-200/60 dark:border-amber-800/60">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>{isVi ? 'Chưa thấy video' : 'Missing video'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[11px] font-semibold">
                            <span>{isVi ? 'Bài đọc' : 'Reading'}</span>
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
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>{isVi ? 'Sẵn sàng tải lên: ' : 'Ready to upload: '}</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                {parsedResult.videoFilesToUpload.length} video, {parsedResult.theoryFilesToUpload.length + parsedResult.lessonTheoryFilesToUpload.length + (parsedResult.courseDocumentFileToUpload ? 1 : 0)} tài liệu PDF{parsedResult.courseThumbnailFileToUpload ? `, 1 ảnh thumbnail` : ''}
              </strong>
            </div>

            <div className="flex items-center gap-3">
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
                disabled={isUploading || totalFilesToUploadCount === 0}
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
                        ? `Tải lên ${totalFilesToUploadCount} tệp (video & tài liệu) & Lưu`
                        : `Upload ${totalFilesToUploadCount} files & Apply`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
