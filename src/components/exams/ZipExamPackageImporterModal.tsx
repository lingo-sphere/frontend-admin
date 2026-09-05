/**
 * @file ZipExamPackageImporterModal.tsx
 * @description Modal chuyên sâu cho Quản trị viên nhập nhanh toàn bộ đề thi (gồm câu hỏi, đáp án, ảnh và audio)
 * bằng 1 file ZIP duy nhất. Tự động giải nén, upload media hàng loạt, map dữ liệu và cho phép nghe/xem trước.
 */

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Archive,
  Download,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Image as ImageIcon,
  Loader2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Eye,
  Check,
  RefreshCw,
  FolderArchive,
  Info,
} from 'lucide-react'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { mediaAdminService } from '@/services/media.service'
import type { ExamQuestionItem } from '@/components/exams/ExamQuestionEditorModal'
import { toast } from '@/store/toast-store'

interface ZipExamPackageImporterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyQuestions: (
    questions: ExamQuestionItem[],
    mode: 'append' | 'replace',
    globalAudioUrl?: string
  ) => void
  examTitle: string
  existingCount?: number
}

interface ParsedZipResult {
  questions: ExamQuestionItem[]
  globalAudioUrl?: string
  totalQuestions: number
  audioCount: number
  imageCount: number
  missingMediaList: string[]
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'mp3':
      return 'audio/mpeg'
    case 'wav':
      return 'audio/wav'
    case 'm4a':
      return 'audio/mp4'
    case 'ogg':
      return 'audio/ogg'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

export function ZipExamPackageImporterModal({
  isOpen,
  onClose,
  onApplyQuestions,
  examTitle,
  existingCount = 0,
}: ZipExamPackageImporterModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const [zipFile, setZipFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingStatus, setProcessingStatus] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 })
  const [parsedResult, setParsedResult] = useState<ParsedZipResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [importMode, setImportMode] = useState<'replace' | 'append'>(existingCount > 0 ? 'replace' : 'replace')
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setZipFile(null)
      setIsProcessing(false)
      setProcessingStatus('')
      setParsedResult(null)
      setErrorMsg(null)
      setPreviewAudioUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Generate and Download Sample ZIP package
  const handleDownloadSampleZip = async () => {
    try {
      const zip = new JSZip()

      // 1. Create sample Excel file with realistic TOEIC questions
      const sampleQuestions = [
        {
          STT: 1,
          Part: 1,
          'Câu hỏi': 'Look at the picture and listen to the four statements. Select the one that best describes what you see.',
          'Lựa chọn A': 'The woman is reading a document at the library.',
          'Lựa chọn B': 'The woman is typing on a laptop computer.',
          'Lựa chọn C': 'The woman is pouring a cup of coffee.',
          'Lựa chọn D': 'The woman is leaving the conference room.',
          'Đáp án đúng': 'B',
          'File Audio': 'part1_q1.mp3',
          'File Ảnh': 'part1_q1.jpg',
          'Lời giải': 'Trong hình ảnh người phụ nữ đang thao tác gõ bàn phím trên laptop (typing on a laptop).',
        },
        {
          STT: 2,
          Part: 2,
          'Câu hỏi': 'Where should I submit the monthly expense report?',
          'Lựa chọn A': 'To Ms. Johnson in the accounting department on the 4th floor.',
          'Lựa chọn B': 'At about 4:30 PM yesterday afternoon.',
          'Lựa chọn C': 'Yes, I received your email already.',
          'Lựa chọn D': '',
          'Đáp án đúng': 'A',
          'File Audio': 'part2_q2.mp3',
          'File Ảnh': '',
          'Lời giải': 'Câu hỏi "Where" (Ở đâu), câu trả lời A chỉ rõ người và phòng ban nhận báo cáo.',
        },
        {
          STT: 3,
          Part: 5,
          'Câu hỏi': 'All international passengers must _____ their boarding pass and passport at Gate 12.',
          'Lựa chọn A': 'present',
          'Lựa chọn B': 'presents',
          'Lựa chọn C': 'presented',
          'Lựa chọn D': 'presentation',
          'Đáp án đúng': 'A',
          'File Audio': '',
          'File Ảnh': '',
          'Lời giải': 'Sau động từ khuyết thiếu "must" cần động từ nguyên mẫu không to (V-bare) -> chọn "present".',
        },
        {
          STT: 4,
          Part: 5,
          'Câu hỏi': 'The engineering team completed the software upgrade much _____ than scheduled.',
          'Lựa chọn A': 'quick',
          'Lựa chọn B': 'more quickly',
          'Lựa chọn C': 'quickest',
          'Lựa chọn D': 'quicker',
          'Đáp án đúng': 'B',
          'File Audio': '',
          'File Ảnh': '',
          'Lời giải': 'Bổ nghĩa cho động từ "completed" với cấu trúc so sánh hơn "than" -> dùng trạng từ "more quickly".',
        },
        {
          STT: 5,
          Part: 7,
          'Câu hỏi': 'What is the primary topic of this internal announcement?',
          'Lựa chọn A': 'The upcoming office maintenance schedule next Monday.',
          'Lựa chọn B': 'The introduction of a new marketing manager.',
          'Lựa chọn C': 'The guidelines for remote work application.',
          'Lựa chọn D': 'The annual company banquet ticket registration.',
          'Đáp án đúng': 'A',
          'File Audio': '',
          'File Ảnh': 'part7_email.png',
          'Lời giải': 'Đoạn đầu thông báo ghi rõ mục đích: "Please be advised that the main elevator will undergo maintenance on Monday."',
        },
      ]

      const worksheet = XLSX.utils.json_to_sheet(sampleQuestions)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions')
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      zip.file('questions.xlsx', excelBuffer)

      // 2. Add Readme guide inside zip
      const readmeText = `=== HƯỚNG DẪN SOẠN ĐỀ THI GÓI ZIP CHO LINGOSPHERE ===
1. File questions.xlsx:
   - Cột "STT": Số thứ tự câu hỏi (1, 2, 3...)
   - Cột "Part": Số Part tương ứng (1, 2, 3, 4, 5, 6, 7, hoặc speaking, writing)
   - Cột "Câu hỏi": Nội dung câu hỏi / Prompt
   - Cột "Lựa chọn A/B/C/D": Các phương án trắc nghiệm
   - Cột "Đáp án đúng": A, B, C hoặc D
   - Cột "File Audio": Tên file audio (ví dụ: part1_q1.mp3)
   - Cột "File Ảnh": Tên file hình ảnh (ví dụ: part1_q1.jpg)
   - Cột "Lời giải": Giải thích chi tiết đáp án

2. Thư mục hoặc file Media:
   - Bạn có thể để các file mp3 và jpg/png vào thư mục "audios/" và "images/" hoặc để trực tiếp trong file zip.
   - Nếu có 1 file audio dài cho cả bài thi, đặt tên là "full_exam.mp3".
`
      zip.file('HUONG_DAN_SU_DUNG.txt', readmeText)

      // 3. Create sample small placeholder audio & image
      // 1x1 transparent png
      const dummyPngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      zip.file('images/part1_q1.jpg', dummyPngBase64, { base64: true })
      zip.file('images/part7_email.png', dummyPngBase64, { base64: true })

      // Dummy minimal valid mp3 header
      const dummyMp3Bytes = new Uint8Array([
        0xff, 0xfb, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      ])
      zip.file('audios/part1_q1.mp3', dummyMp3Bytes)
      zip.file('audios/part2_q2.mp3', dummyMp3Bytes)

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const downloadUrl = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = 'GOI_DE_THI_MAU_TOEIC_LINGOSPHERE.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)

      toast.success(isVi ? 'Đã tải xuống gói ZIP mẫu thành công!' : 'Sample ZIP package downloaded!')
    } catch {
      toast.error('Lỗi khi tạo file ZIP mẫu.')
    }
  }

  // Handle User Selecting ZIP File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!/\.(zip)$/i.test(file.name)) {
      setErrorMsg(isVi ? 'Vui lòng chọn file nén định dạng .zip' : 'Please select a .zip archive file')
      return
    }

    if (file.size > 200 * 1024 * 1024) {
      setErrorMsg(isVi ? 'Dung lượng file ZIP không được vượt quá 200MB' : 'ZIP file must not exceed 200MB')
      return
    }

    setZipFile(file)
    setErrorMsg(null)
    setParsedResult(null)
    processZipFile(file)
  }

  // Process and parse ZIP archive
  const processZipFile = async (file: File) => {
    setIsProcessing(true)
    setProcessingStatus(isVi ? 'Đang giải nén file ZIP...' : 'Extracting ZIP archive...')
    setErrorMsg(null)

    try {
      const zip = await JSZip.loadAsync(file)

      // 1. Locate Excel or CSV file
      let excelEntry: JSZip.JSZipObject | null = null
      for (const [path, entry] of Object.entries(zip.files)) {
        if (!entry.dir && /\.(xlsx|xls|csv)$/i.test(path) && !path.includes('__MACOSX')) {
          excelEntry = entry
          break
        }
      }

      if (!excelEntry) {
        throw new Error(
          isVi
            ? 'Không tìm thấy file Excel (.xlsx / .csv) bên trong file ZIP! Vui lòng đảm bảo trong ZIP có chứa file questions.xlsx.'
            : 'No Excel (.xlsx / .csv) question file found in this ZIP archive.'
        )
      }

      setProcessingStatus(isVi ? 'Đang phân tích bảng câu hỏi Excel...' : 'Parsing question spreadsheet...')
      const excelBuffer = await excelEntry.async('arraybuffer')
      const workbook = XLSX.read(excelBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' })

      if (!rawRows || rawRows.length === 0) {
        throw new Error(isVi ? 'File Excel câu hỏi không có dòng dữ liệu nào!' : 'Question sheet is empty!')
      }

      // 2. Discover all Audio and Image entries in ZIP
      const mediaEntries: Record<string, JSZip.JSZipObject> = {}
      let detectedGlobalAudioUrl: string | undefined = undefined

      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir || path.includes('__MACOSX')) continue
        const filename = path.split('/').pop() || path
        const lowerName = filename.toLowerCase().trim()

        if (/\.(mp3|wav|m4a|ogg|jpg|jpeg|png|webp|gif)$/i.test(lowerName)) {
          mediaEntries[lowerName] = entry
          // Check if this is full exam audio
          if (lowerName.includes('full') || lowerName.includes('exam_audio') || lowerName.includes('toan_bai')) {
            // will be uploaded and assigned
          }
        }
      }

      // 3. Find which media files are actually referenced by Excel rows
      const neededMediaNames = new Set<string>()
      rawRows.forEach((row) => {
        Object.entries(row).forEach(([k, v]) => {
          const norm = normalizeKey(k)
          if ((norm.includes('audio') || norm.includes('mp3') || norm.includes('anh') || norm.includes('image')) && typeof v === 'string') {
            const clean = v.trim().toLowerCase()
            if (clean) neededMediaNames.add(clean)
          }
        })
      })

      // Also include any full_exam audio if exists
      for (const name of Object.keys(mediaEntries)) {
        if (name.includes('full') || name.includes('exam_audio')) {
          neededMediaNames.add(name)
        }
      }

      // 4. Upload needed media files to Media Service
      const filesToUpload = Array.from(neededMediaNames).filter((name) => mediaEntries[name])
      const uploadedMap: Record<string, string> = {}
      const missingMediaList: string[] = []

      Array.from(neededMediaNames).forEach((name) => {
        if (!mediaEntries[name]) {
          missingMediaList.push(name)
        }
      })

      if (filesToUpload.length > 0) {
        setUploadProgress({ current: 0, total: filesToUpload.length })
        for (let i = 0; i < filesToUpload.length; i++) {
          const name = filesToUpload[i]
          const entry = mediaEntries[name]
          setProcessingStatus(
            isVi
              ? `Đang tải lên media (${i + 1}/${filesToUpload.length}): ${name}...`
              : `Uploading asset (${i + 1}/${filesToUpload.length}): ${name}...`
          )

          try {
            const blob = await entry.async('blob')
            const fileObj = new File([blob], name, { type: getMimeType(name) })
            const uploadRes = await mediaAdminService.uploadFile(fileObj, 'exam-package')
            const url = uploadRes.file_url || uploadRes.url || uploadRes.public_url || ''
            if (url) {
              uploadedMap[name] = url
              if (name.includes('full') || name.includes('exam_audio')) {
                detectedGlobalAudioUrl = url
              }
            }
          } catch (uploadErr) {
            console.warn(`Failed to upload ${name}:`, uploadErr)
          }
          setUploadProgress({ current: i + 1, total: filesToUpload.length })
        }
      }

      // 5. Map Excel rows to ExamQuestionItem[]
      setProcessingStatus(isVi ? 'Đang tổng hợp câu hỏi và liên kết tư liệu...' : 'Linking assets to questions...')
      let audioLinkedCount = 0
      let imageLinkedCount = 0

      const parsedQuestions: ExamQuestionItem[] = rawRows.map((row, idx) => {
        let questionText = ''
        let optA = ''
        let optB = ''
        let optC = ''
        let optD = ''
        let correctLetter = 'A'
        let explanation = ''
        let partNum: number | string = 5
        let audioFileName = ''
        let imageFileName = ''

        for (const [colName, val] of Object.entries(row)) {
          const norm = normalizeKey(colName)
          const strVal = String(val || '').trim()

          if (norm.includes('cauhoi') || norm.includes('question') || norm.includes('debai') || norm.includes('prompt')) {
            questionText = strVal
          } else if (norm === 'part' || norm === 'phan' || norm.includes('partnumber')) {
            const parsedPart = parseInt(strVal, 10)
            if (!isNaN(parsedPart)) partNum = parsedPart
            else if (strVal.toLowerCase().includes('speaking')) partNum = 'speaking'
            else if (strVal.toLowerCase().includes('writing')) partNum = 'writing'
          } else if (norm.includes('luachona') || norm.includes('optiona') || norm === 'a' || norm.includes('dapana')) {
            optA = strVal
          } else if (norm.includes('luachonb') || norm.includes('optionb') || norm === 'b' || norm.includes('dapanb')) {
            optB = strVal
          } else if (norm.includes('luachonc') || norm.includes('optionc') || norm === 'c' || norm.includes('dapanc')) {
            optC = strVal
          } else if (norm.includes('luachond') || norm.includes('optiond') || norm === 'd' || norm.includes('dapand')) {
            optD = strVal
          } else if (norm.includes('dapandung') || norm.includes('correct') || norm.includes('answer') || norm === 'key') {
            const cleaned = strVal.toUpperCase().replace(/[^ABCD]/g, '')
            if (cleaned) correctLetter = cleaned[0]
          } else if (norm.includes('loigiai') || norm.includes('giaithich') || norm.includes('explain')) {
            explanation = strVal
          } else if (norm.includes('audio') || norm.includes('mp3') || norm.includes('nghe')) {
            audioFileName = strVal.toLowerCase()
          } else if (norm.includes('anh') || norm.includes('image') || norm.includes('hinh') || norm.includes('picture')) {
            imageFileName = strVal.toLowerCase()
          }
        }

        const matchedAudioUrl = uploadedMap[audioFileName] || ''
        const matchedImageUrl = uploadedMap[imageFileName] || ''

        if (matchedAudioUrl) audioLinkedCount++
        if (matchedImageUrl) imageLinkedCount++

        const isSpeaking = String(partNum).toLowerCase() === 'speaking'
        const isWriting = String(partNum).toLowerCase() === 'writing'

        return {
          id: `q_zip_${Date.now()}_${idx}`,
          part_number: partNum,
          question_type: isSpeaking ? 'SPEAKING' : isWriting ? 'WRITING' : 'MULTIPLE_CHOICE',
          question_text: questionText || `Question ${idx + 1}`,
          options: isSpeaking || isWriting ? [] : [optA, optB, optC, optD],
          correct_answer: correctLetter,
          explanation,
          media_url: matchedAudioUrl,
          image_url: matchedImageUrl,
          prep_time_seconds: isSpeaking ? 45 : undefined,
          response_time_seconds: isSpeaking ? 60 : undefined,
          min_words: isWriting ? 100 : undefined,
        }
      })

      setParsedResult({
        questions: parsedQuestions,
        globalAudioUrl: detectedGlobalAudioUrl,
        totalQuestions: parsedQuestions.length,
        audioCount: audioLinkedCount,
        imageCount: imageLinkedCount,
        missingMediaList,
      })

      toast.success(
        isVi
          ? `Giải nén thành công ${parsedQuestions.length} câu hỏi, ${audioLinkedCount} audio và ${imageLinkedCount} ảnh!`
          : `Extracted ${parsedQuestions.length} questions, ${audioLinkedCount} audios and ${imageLinkedCount} images!`
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xử lý file ZIP.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setIsProcessing(false)
      setProcessingStatus('')
    }
  }

  // Apply to Exam
  const handleApply = () => {
    if (!parsedResult || parsedResult.questions.length === 0) return
    onApplyQuestions(parsedResult.questions, importMode, parsedResult.globalAudioUrl)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/50">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {isVi ? 'Import Trọn Gói Đề Thi Bằng File ZIP' : 'Import Exam Package via ZIP'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Excel + Audio + Ảnh
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {examTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40 dark:bg-slate-950/30">
          {/* Quick Guide Card with Download Sample Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/70 dark:border-purple-800/50">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{isVi ? 'Quy chuẩn cấu trúc file ZIP nạp đề thi:' : 'ZIP Package Standard Structure:'}</span>
              </h4>
              <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 leading-relaxed">
                {isVi
                  ? 'Gói ZIP gồm file questions.xlsx + thư mục chứa file âm thanh (.mp3) và hình ảnh (.jpg/.png). Tên file trong cột Excel sẽ tự động được gán chính xác vào từng câu!'
                  : 'ZIP contains questions.xlsx + media folder with .mp3 and .jpg/.png files matching the filenames listed in Excel.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleZip}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 hover:border-purple-400 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-xs hover:shadow-purple-500/10 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{isVi ? 'Tải Gói ZIP Mẫu Chuẩn' : 'Download Sample ZIP'}</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          {!parsedResult && (
            <div
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer ${
                isProcessing
                  ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 cursor-wait'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/20'
              }`}
            >
              {isProcessing ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-spin">
                    <Loader2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{processingStatus}</p>
                    {uploadProgress.total > 0 && (
                      <div className="w-64 max-w-full mx-auto space-y-1">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-150"
                            style={{ width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {uploadProgress.current} / {uploadProgress.total} files
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <FolderArchive className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {zipFile ? zipFile.name : (isVi ? 'Nhấp để chọn hoặc kéo thả file ZIP vào đây' : 'Click or drop your ZIP file here')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isVi ? 'Hỗ trợ định dạng .zip (Dung lượng tối đa 200MB)' : 'Supports .zip files up to 200MB'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs"
                  >
                    {isVi ? 'Chọn file ZIP' : 'Browse ZIP file'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Results Overview & Preview */}
          {parsedResult && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Tổng số câu</span>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">{parsedResult.totalQuestions}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Audio câu hỏi</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{parsedResult.audioCount}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Ảnh minh họa</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">{parsedResult.imageCount}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Trạng thái</span>
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Sẵn sàng nạp</span>
                  </div>
                </div>
              </div>

              {/* Import Mode Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isVi ? 'Chọn phương thức nạp câu hỏi:' : 'Select import mode:'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {existingCount > 0
                      ? isVi
                        ? `Đề thi hiện đang có ${existingCount} câu hỏi.`
                        : `This exam currently has ${existingCount} questions.`
                      : isVi
                      ? 'Đề thi hiện đang trống.'
                      : 'Exam is currently empty.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isVi ? 'Ghi đè toàn bộ' : 'Replace All'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      importMode === 'append'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isVi ? 'Thêm nối tiếp vào sau' : 'Append to Existing'}
                  </button>
                </div>
              </div>

              {/* Warning for missing media (if any) */}
              {parsedResult.missingMediaList.length > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Có {parsedResult.missingMediaList.length} file media ghi trong Excel nhưng thiếu trong ZIP:</span>
                  </div>
                  <p className="text-[11px] text-amber-700/80 line-clamp-2">
                    {parsedResult.missingMediaList.join(', ')}
                  </p>
                </div>
              )}

              {/* Questions Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isVi ? 'Bản xem trước câu hỏi:' : 'Question preview:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedResult(null)
                      setZipFile(null)
                    }}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isVi ? 'Chọn file ZIP khác' : 'Change ZIP file'}</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedResult.questions.map((q, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                            #{idx + 1}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Part {q.part_number}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                            Key: {q.correct_answer}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">
                          {q.question_text}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            A: {q.options[0]} | B: {q.options[1]} | C: {q.options[2]} | D: {q.options[3]}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {q.media_url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewAudioUrl(q.media_url || null)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold cursor-pointer"
                            title="Nghe thử audio"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Audio</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No audio</span>
                        )}

                        {q.image_url ? (
                          <img
                            src={q.image_url}
                            alt="preview"
                            className="w-7 h-7 object-cover rounded-md border border-slate-200"
                            title="Có ảnh minh họa"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No img</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio preview player */}
              {previewAudioUrl && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe thử audio câu hỏi:</span>
                    <audio controls autoPlay src={previewAudioUrl} className="h-7 max-w-xs" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewAudioUrl(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isVi ? 'Hủy' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={!parsedResult || parsedResult.questions.length === 0}
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs hover:shadow-purple-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>
              {isVi
                ? `Áp dụng ${parsedResult?.questions.length || 0} câu hỏi vào đề thi`
                : `Apply ${parsedResult?.questions.length || 0} Questions`}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
