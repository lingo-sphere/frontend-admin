// Modal nhap nhanh khoa hoc tu thu muc chua file Excel va video bai giang cung tai lieu PDF.

import { useState, useRef, forwardRef, useImperativeHandle, type DragEvent, type ChangeEvent } from 'react'
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
  Headphones,
  ImageIcon,
  RotateCcw,
} from 'lucide-react'

interface FileSystemHandleLike {
  kind: 'file' | 'directory'
  name: string
}

interface FileSystemFileHandleLike extends FileSystemHandleLike {
  kind: 'file'
  getFile: () => Promise<File>
}

interface FileSystemDirectoryHandleLike extends FileSystemHandleLike {
  kind: 'directory'
  values: () => AsyncIterable<FileSystemHandleLike>
}
import {
  parseCourseFolder,
  type ParsedFolderResult,
} from '@/features/courses/helpers/course.folder.import.helper'
import {
  uploadFolderResourcesToR2,
  type PendingFolderUploads,
} from '@/features/courses/helpers/course.folder.upload.helper'
import { generateCourseR2Folder } from '@/features/courses/helpers/course.helper'
import type { CourseFormData, CourseModule } from '@/features/courses/components/course.basic.info.tab'
import { toast } from '@/store/toast.store'

export type { PendingFolderUploads }

export interface CourseFolderImportModalRef {
  openPicker: () => void
}

interface CourseFolderImportModalProps {
  isOpen: boolean
  onOpen?: () => void
  onClose: () => void
  onApply: (
    courseInfo: Partial<CourseFormData>,
    modules: CourseModule[],
    pendingUploads?: PendingFolderUploads
  ) => void
  isVi: boolean
  courseFolder?: string
}

export const CourseFolderImportModal = forwardRef<
  CourseFolderImportModalRef,
  CourseFolderImportModalProps
>(function CourseFolderImportModal(
  {
    isOpen,
    onOpen,
    onClose,
    onApply,
    isVi,
    courseFolder = 'courses',
  },
  ref
) {
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadIndex, setUploadIndex] = useState(0)
  const [uploadPercent, setUploadPercent] = useState(0)
  const [currentUploadName, setCurrentUploadName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [parsedResult, setParsedResult] = useState<ParsedFolderResult | null>(null)

  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const collectFilesFromDirectoryHandle = async (
    dirHandle: FileSystemDirectoryHandleLike,
    path = ''
  ): Promise<File[]> => {
    const files: File[] = []
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const file = await (entry as FileSystemFileHandleLike).getFile()
        const relativePath = path ? `${path}/${file.name}` : file.name
        try {
          Object.defineProperty(file, 'webkitRelativePath', {
            value: relativePath,
            writable: true,
            configurable: true,
          })
        } catch {}
        files.push(file)
      } else if (entry.kind === 'directory') {
        const subFiles = await collectFilesFromDirectoryHandle(
          entry as FileSystemDirectoryHandleLike,
          path ? `${path}/${entry.name}` : entry.name
        )
        files.push(...subFiles)
      }
    }
    return files
  }

  const handleClose = () => {
    if (isUploading) return
    setParsedResult(null)
    setError(null)
    setIsParsing(false)
    onClose()
  }

  const handlePickFolder = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (isParsing || isUploading) return

    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const picker = (window as unknown as {
          showDirectoryPicker: (options?: { id?: string; mode?: 'read' }) => Promise<FileSystemDirectoryHandleLike>
        }).showDirectoryPicker
        const dirHandle = await picker({ mode: 'read' })
        onOpen?.()
        setIsParsing(true)
        setError(null)
        const files = await collectFilesFromDirectoryHandle(dirHandle)
        await processFiles(files)
        return
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setIsParsing(false)
        const msg = err instanceof Error ? err.message : 'Không thể đọc thư mục'
        setError(msg)
        toast.error(msg)
        return
      }
    }

    folderInputRef.current?.click()
  }

  useImperativeHandle(ref, () => ({
    openPicker: () => {
      handlePickFolder()
    },
  }))

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
      onOpen?.()
      await processFiles(files)
    } else if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onOpen?.()
      await processFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onOpen?.()
      await processFiles(Array.from(e.target.files))
    }
    e.target.value = ''
  }

  const totalFilesToUploadCount = parsedResult
    ? parsedResult.videoFilesToUpload.length +
      parsedResult.theoryFilesToUpload.length +
      parsedResult.lessonTheoryFilesToUpload.length +
      (parsedResult.courseDocumentFileToUpload ? 1 : 0) +
      (parsedResult.courseThumbnailFileToUpload ? 1 : 0) +
      (parsedResult.finalTestAudioFileToUpload ? 1 : 0) +
      (parsedResult.finalTestSpeakingFileToUpload ? 1 : 0) +
      (parsedResult.moduleAudioFilesToUpload?.length || 0) +
      (parsedResult.moduleSpeakingFilesToUpload?.length || 0) +
      (parsedResult.questionMediaFilesToUpload?.length || 0)
    : 0

  const handleApplyWithoutUpload = () => {
    if (!parsedResult) return
    const pendingUploads: PendingFolderUploads = {
      videoFiles: parsedResult.videoFilesToUpload,
      moduleTheoryFiles: parsedResult.theoryFilesToUpload || [],
      lessonTheoryFiles: parsedResult.lessonTheoryFilesToUpload || [],
      courseDocumentFile: parsedResult.courseDocumentFileToUpload,
      courseThumbnailFile: parsedResult.courseThumbnailFileToUpload,
      finalTestAudioFile: parsedResult.finalTestAudioFileToUpload,
      finalTestSpeakingFile: parsedResult.finalTestSpeakingFileToUpload,
      moduleAudioFiles: parsedResult.moduleAudioFilesToUpload || [],
      moduleSpeakingFiles: parsedResult.moduleSpeakingFilesToUpload || [],
      questionMediaFiles: parsedResult.questionMediaFilesToUpload || [],
    }
    onApply(parsedResult.courseInfo, parsedResult.modules, pendingUploads)
    toast.success(
      isVi
        ? `Đã nạp toàn bộ cấu trúc vào Form! ${totalFilesToUploadCount} tệp (video & tài liệu) sẽ được tự động tải lên R2 khi bạn nhấn "Lưu Khóa Học".`
        : `Curriculum loaded into Form! ${totalFilesToUploadCount} files will be automatically uploaded to R2 when saving.`
    )
    handleClose()
  }

  const handleUploadAndApply = async () => {
    if (!parsedResult) return
    setIsUploading(true)
    setError(null)
    setUploadIndex(1)
    setUploadPercent(0)

    const pendingUploads: PendingFolderUploads = {
      videoFiles: parsedResult.videoFilesToUpload,
      moduleTheoryFiles: parsedResult.theoryFilesToUpload || [],
      lessonTheoryFiles: parsedResult.lessonTheoryFilesToUpload || [],
      courseDocumentFile: parsedResult.courseDocumentFileToUpload,
      courseThumbnailFile: parsedResult.courseThumbnailFileToUpload,
      finalTestAudioFile: parsedResult.finalTestAudioFileToUpload,
      finalTestSpeakingFile: parsedResult.finalTestSpeakingFileToUpload,
      moduleAudioFiles: parsedResult.moduleAudioFilesToUpload || [],
      moduleSpeakingFiles: parsedResult.moduleSpeakingFilesToUpload || [],
      questionMediaFiles: parsedResult.questionMediaFilesToUpload || [],
    }

    const targetFolder = parsedResult
      ? generateCourseR2Folder(
          parsedResult.courseInfo.title,
          parsedResult.courseInfo.slug
        )
      : courseFolder

    try {
      const res = await uploadFolderResourcesToR2(
        pendingUploads,
        targetFolder,
        parsedResult.courseInfo,
        parsedResult.modules,
        (progress) => {
          setUploadIndex(Math.min(progress.completedFiles + 1, progress.totalFiles))
          setUploadPercent(progress.percent)
          setCurrentUploadName(progress.currentFileName)
        }
      )

      onApply(res.courseInfo, res.modules, undefined)
      if (res.failedCount > 0) {
        toast.warning(
          isVi
            ? `Đã nạp khóa học vào Form (${totalFilesToUploadCount - res.failedCount}/${totalFilesToUploadCount} file tải lên thành công, ${res.failedCount} file bị gián đoạn).`
            : `Course imported with ${totalFilesToUploadCount - res.failedCount}/${totalFilesToUploadCount} files uploaded.`
        )
      } else {
        toast.success(
          isVi
            ? `Đã tải lên toàn bộ ${totalFilesToUploadCount} tài nguyên lên R2 và nạp vào Form thành công! Nhấn "Lưu Khóa Học" để hoàn tất.`
            : `Successfully uploaded ${totalFilesToUploadCount} files to R2! Click Save Course to complete.`
        )
      }
      handleClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải lên tài nguyên thất bại'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isUploading) {
              handleClose()
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
                onClick={handleClose}
                disabled={isUploading}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isParsing && (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/10">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      {isVi
                        ? 'Đang đọc và phân tích cấu trúc khóa học...'
                        : 'Analyzing folder and files...'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {isVi
                        ? 'Hệ thống đang đọc file Excel và khớp nối video, tài liệu PDF...'
                        : 'Scanning Excel configuration and matching course media...'}
                    </p>
                  </div>
                </div>
              )}

              {!isParsing && error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {!isParsing && !parsedResult && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handlePickFolder}
                  className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-950/30'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/10">
                    <FolderUp className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      {isVi
                        ? 'Kéo thả thư mục khóa học hoặc bấm để chọn'
                        : 'Drag and drop course folder or click to choose'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {isVi
                        ? 'Thư mục cần chứa file Excel (.xlsx) cấu hình khóa học cùng toàn bộ video bài giảng (.mp4) và tài liệu (.pdf).'
                        : 'Folder must contain course Excel file (.xlsx) along with video files (.mp4) and documents (.pdf).'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={handlePickFolder}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <FolderUp className="w-4 h-4" />
                      <span>{isVi ? 'Chọn thư mục khóa học' : 'Select Course Folder'}</span>
                    </button>
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

              {!isParsing && parsedResult && (
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
                        onClick={handlePickFolder}
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
                  {((parsedResult.moduleAudioFilesToUpload?.length || 0) + (parsedResult.finalTestAudioFileToUpload ? 1 : 0)) > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                      <Headphones className="w-3.5 h-3.5 text-violet-600" />
                      <span>
                        {(parsedResult.moduleAudioFilesToUpload?.length || 0) + (parsedResult.finalTestAudioFileToUpload ? 1 : 0)} {isVi ? 'file âm thanh test' : 'test audio files'}
                      </span>
                    </span>
                  )}
                  {(parsedResult.questionMediaFilesToUpload?.length || 0) > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300">
                      <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
                      <span>
                        {parsedResult.questionMediaFilesToUpload.length} {isVi ? 'ảnh/audio câu hỏi' : 'question media'}
                      </span>
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
                onClick={handlePickFolder}
                disabled={isUploading}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isVi ? 'Chọn lại thư mục' : 'Re-select'}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
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
                <span>
                  {isVi
                    ? 'Nạp cấu trúc vào Form (Tự động tải lên R2 khi ấn Lưu)'
                    : 'Apply to Form (Auto-upload to R2 on Save)'}
                </span>
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
                        ? `Tải lên ${totalFilesToUploadCount} tệp lên R2 ngay & Nạp vào Form`
                        : `Upload ${totalFilesToUploadCount} files to R2 now & Apply`}
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
  )}
</>
)
})
