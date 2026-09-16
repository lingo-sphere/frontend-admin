// Tien ich phan tich giai nen goi zip va rar de thi va tai len media len he thong luu tru.

import type { ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'
import { mediaAdminService } from '@/features/media/services/media.service'
import { toast } from '@/store/toast.store'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { extractRarExamArchive } from '@/features/exams/helpers/rar.exam.helper'

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/đ/g, 'd')
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
    case 'aac':
      return 'audio/aac'
    case 'flac':
      return 'audio/flac'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

function createSampleAudioBytes(durationSec = 2, freq = 440): Uint8Array {
  const sampleRate = 8000
  const numSamples = sampleRate * durationSec
  const buffer = new ArrayBuffer(44 + numSamples)
  const view = new DataView(buffer)

  view.setUint32(0, 0x52494646, false)
  view.setUint32(4, 36 + numSamples, true)
  view.setUint32(8, 0x57415645, false)

  view.setUint32(12, 0x666d7420, false)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate, true)
  view.setUint16(32, 1, true)
  view.setUint16(34, 8, true)

  view.setUint32(36, 0x64617461, false)
  view.setUint32(40, numSamples, true)

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const envelope = Math.min(1, Math.min(i / 800, (numSamples - i) / 800))
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 60 + 128
    view.setUint8(44 + i, Math.floor(sample))
  }
  return new Uint8Array(buffer)
}

export interface ParseZipResult {
  questions: ExamQuestionItem[]
  globalAudioUrl?: string
  totalQuestions: number
  audioCount: number
  imageCount: number
}

function classifySkill(strVal: string): 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' | 'UNKNOWN' {
  const norm = normalizeKey(strVal)
  const lower = strVal.toLowerCase().trim()

  if (
    norm.includes('noi') ||
    lower.includes('speaking') ||
    lower.includes('speak') ||
    norm === 's'
  ) {
    return 'SPEAKING'
  }
  if (
    norm.includes('viet') ||
    lower.includes('writing') ||
    lower.includes('write') ||
    norm === 'w'
  ) {
    return 'WRITING'
  }
  if (
    norm.includes('nghe') ||
    lower.includes('listen') ||
    norm === 'l' ||
    lower.includes('part 1') ||
    lower.includes('part 2') ||
    lower.includes('part 3') ||
    lower.includes('part 4') ||
    lower.includes('part1') ||
    lower.includes('part2') ||
    lower.includes('part3') ||
    lower.includes('part4') ||
    ['1', '2', '3', '4'].includes(lower)
  ) {
    return 'LISTENING'
  }
  if (
    norm.includes('doc') ||
    lower.includes('read') ||
    norm === 'r' ||
    lower.includes('part 5') ||
    lower.includes('part 6') ||
    lower.includes('part 7') ||
    lower.includes('part5') ||
    lower.includes('part6') ||
    lower.includes('part7') ||
    ['5', '6', '7'].includes(lower)
  ) {
    return 'READING'
  }

  return 'UNKNOWN'
}

export async function downloadSampleZip(
  isVi = true,
  is4Skills = false,
  isLessonMode = false
): Promise<void> {
  try {
    const zip = new JSZip()

    const allSampleQuestions = [
      {
        STT: 1,
        'Kỹ năng': 'Nghe',
        'Câu hỏi': 'Look at the picture and listen to the statements. Select the one that best describes what you see.',
        'Lựa chọn A': 'The woman is reading a document at the library.',
        'Lựa chọn B': 'The woman is typing on a laptop computer.',
        'Lựa chọn C': 'The woman is pouring a cup of coffee.',
        'Lựa chọn D': 'The woman is leaving the conference room.',
        'Đáp án đúng': 'B',
        'File Audio': 'audio_q1.wav',
        'File Ảnh': 'image_q1.jpg',
        'Lời giải': 'Trong hình ảnh người phụ nữ đang thao tác gõ bàn phím trên laptop (typing on a laptop).',
      },
      {
        STT: 2,
        'Kỹ năng': 'Nghe',
        'Câu hỏi': 'Where should I submit the monthly expense report?',
        'Lựa chọn A': 'To Ms. Johnson in the accounting department on the 4th floor.',
        'Lựa chọn B': 'At about 4:30 PM yesterday afternoon.',
        'Lựa chọn C': 'Yes, I received your email already.',
        'Lựa chọn D': '',
        'Đáp án đúng': 'A',
        'File Audio': 'audio_q2.wav',
        'File Ảnh': '',
        'Lời giải': 'Câu hỏi "Where" (Ở đâu), câu trả lời A chỉ rõ người và phòng ban nhận báo cáo.',
      },
      {
        STT: 3,
        'Kỹ năng': 'Đọc',
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
        'Kỹ năng': 'Đọc',
        'Câu hỏi': 'What is the primary topic of this internal announcement?',
        'Lựa chọn A': 'The upcoming office maintenance schedule next Monday.',
        'Lựa chọn B': 'The introduction of a new marketing manager.',
        'Lựa chọn C': 'The guidelines for remote work application.',
        'Lựa chọn D': 'The annual company banquet ticket registration.',
        'Đáp án đúng': 'A',
        'File Audio': '',
        'File Ảnh': 'image_q4.png',
        'Lời giải': 'Đoạn đầu thông báo ghi rõ mục đích: "Please be advised that the main elevator will undergo maintenance on Monday."',
      },
      {
        STT: 5,
        'Kỹ năng': 'Nói',
        'Câu hỏi': 'Describe a time you solved a difficult problem at work or school in detail.',
        'Lựa chọn A': '',
        'Lựa chọn B': '',
        'Lựa chọn C': '',
        'Lựa chọn D': '',
        'Đáp án đúng': '',
        'File Audio': '',
        'File Ảnh': '',
        'Lời giải': 'Tiêu chí đánh giá: Phát âm rõ ràng, độ lưu loát, ngữ pháp quá khứ.',
      },
      {
        STT: 6,
        'Kỹ năng': 'Viết',
        'Câu hỏi': 'Write an email (at least 100 words) requesting a 3-day extension on your project deadline.',
        'Lựa chọn A': '',
        'Lựa chọn B': '',
        'Lựa chọn C': '',
        'Lựa chọn D': '',
        'Đáp án đúng': '',
        'File Audio': '',
        'File Ảnh': '',
        'Lời giải': 'Tiêu chí đánh giá: Cấu trúc thư trang trọng, lý do rõ ràng, số từ đạt yêu cầu.',
      },
    ]

    const sampleQuestions = isLessonMode
      ? allSampleQuestions.slice(0, 3).map((q, idx) => ({
          STT: idx + 1,
          'Câu hỏi': q['Câu hỏi'],
          'Lựa chọn A': q['Lựa chọn A'],
          'Lựa chọn B': q['Lựa chọn B'],
          'Lựa chọn C': q['Lựa chọn C'],
          'Lựa chọn D': q['Lựa chọn D'],
          'Đáp án đúng': q['Đáp án đúng'],
          'File Audio': idx === 0 ? 'audio_q1.wav' : '',
          'File Ảnh': idx === 0 ? 'image_q1.jpg' : '',
          'Lời giải': q['Lời giải'],
        }))
      : is4Skills
        ? allSampleQuestions
        : allSampleQuestions.slice(0, 4)

    const worksheet = XLSX.utils.json_to_sheet(sampleQuestions)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    zip.file('questions.xlsx', excelBuffer)

    const skillGuideline = isLessonMode
      ? ''
      : is4Skills
        ? '   - Cot "Ky nang": Nghe, Doc, Noi, hoac Viet (Listening, Reading, Speaking, Writing)\n'
        : '   - Cot "Ky nang": Nghe hoac Doc (Listening hoac Reading)\n   - LUU Y: De thi 2 ky nang TUYET DOI KHONG chua ky nang Noi (Speaking) va Viet (Writing)!\n'

    const readmeText = isLessonMode
      ? `=== HUONG DAN SOAN BO CAU HOI ON TAP BAI HOC CHO LINGOSPHERE ===
1. File questions.xlsx:
   - Cot "STT": So thu tu cau hoi (1, 2, 3...)
   - Cot "Cau hoi": Noi dung cau hoi on tap
   - Cot "Lua chon A/B/C/D": Cac phuong an trac nghiem
   - Cot "Dap an dung": A, B, C hoac D
   - Cot "File Audio": (Tuy chon) Ten file audio rieng cho cau hoi
   - Cot "File Anh": (Tuy chon) Ten file hinh anh minh hoa
   - Cot "Loi giai": Giai thich dap an chi tiet

2. Thu muc media:
   - Dat cac file audio (mp3, wav, m4a) va hinh anh (jpg, png, webp) vao thu muc "audios/" va "images/" hoac ngay thu muc goc.
`
      : `=== HUONG DAN SOAN DE THI GOI ZIP CHO LINGOSPHERE ===
1. File questions.xlsx:
   - Cot "STT": So thu tu cau hoi (1, 2, 3...)
${skillGuideline}   - Cot "Cau hoi": Noi dung cau hoi hoac de bai
   - Cot "Lua chon A/B/C/D": Cac phuong an trac nghiem
   - Cot "Dap an dung": A, B, C hoac D
   - Cot "File Audio": Ten file audio trong goi zip (audio_q1.wav, audio_q2.wav...)
   - Cot "File Anh": Ten file hinh anh trong goi zip (image_q1.jpg, image_q4.png...)
   - Cot "Loi giai": Giai thich chi tiet dap an

2. Thu muc media:
   - Dat cac file audio (mp3, wav, m4a, ogg) va hinh anh (jpg, png, webp) vao thu muc "audios/" va "images/" hoac ngay thu muc goc.
   - File nghe chung toan bai co the dat ten: "full_exam.wav", "full_exam.mp3", "exam_audio.mp3", "audio.mp3" hoac chi can 1 file audio duy nhat trong goi zip.
`
    zip.file('HUONG_DAN_SU_DUNG.txt', readmeText)

    const dummyPngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    zip.file('images/image_q1.jpg', dummyPngBase64, { base64: true })
    if (!isLessonMode) {
      zip.file('images/image_q4.png', dummyPngBase64, { base64: true })
    }

    const sampleQ1Audio = createSampleAudioBytes(2, 440)
    zip.file('audios/audio_q1.wav', sampleQ1Audio)
    if (!isLessonMode) {
      const sampleQ2Audio = createSampleAudioBytes(2, 554)
      zip.file('audios/audio_q2.wav', sampleQ2Audio)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const downloadUrl = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = isLessonMode
      ? 'GOI_CAU_HOI_ON_TAP_BAI_HOC_MAU.zip'
      : is4Skills
        ? 'GOI_DE_THI_MAU_TOEIC_4_KY_NANG.zip'
        : 'GOI_DE_THI_MAU_TOEIC_2_KY_NANG.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(downloadUrl)

    toast.success(isVi ? 'Đã tải xuống gói ZIP mẫu thành công!' : 'Sample ZIP package downloaded!')
  } catch {
    toast.error(isVi ? 'Lỗi khi tạo file ZIP mẫu.' : 'Failed to generate sample ZIP.')
  }
}

export async function parseAndUploadZipExam(
  file: File,
  isVi: boolean,
  onProgress?: (status: string, current?: number, total?: number) => void,
  is4Skills = false,
  isLessonMode = false
): Promise<ParseZipResult> {
  const isDirectExcel = /\.(xlsx|xls|csv)$/i.test(file.name)
  const isZip = /\.(zip)$/i.test(file.name)
  const isRar = /\.(rar)$/i.test(file.name)

  if (!isZip && !isRar && !isDirectExcel) {
    throw new Error(
      isVi
        ? 'Vui lòng chọn file nén định dạng .zip, .rar hoặc file bảng tính .xlsx'
        : 'Please select a .zip, .rar archive or .xlsx spreadsheet file'
    )
  }

  if (file.size > 200 * 1024 * 1024) {
    throw new Error(
      isVi ? 'Dung lượng file không được vượt quá 200MB' : 'File size must not exceed 200MB'
    )
  }

  let rawRows: Record<string, unknown>[] = []
  let getMediaBuffer: (name: string) => Promise<ArrayBuffer | null> = async () => null
  let distinctMediaNames: string[] = []

  if (isDirectExcel) {
    onProgress?.(isVi ? 'Đang phân tích bảng câu hỏi Excel...' : 'Parsing question spreadsheet...')
    const excelBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(excelBuffer, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' })
  } else if (isRar) {
    const rarData = await extractRarExamArchive(file, isVi, (status) => onProgress?.(status))
    onProgress?.(isVi ? 'Đang phân tích bảng câu hỏi Excel...' : 'Parsing question spreadsheet...')
    const workbook = XLSX.read(rarData.excelBuffer, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' })
    distinctMediaNames = rarData.distinctMediaNames
    getMediaBuffer = async (name: string) => rarData.mediaBuffers.get(name) || null
  } else {
    onProgress?.(isVi ? 'Đang giải nén file ZIP...' : 'Extracting ZIP archive...')
    const zip = await JSZip.loadAsync(file)

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

    onProgress?.(isVi ? 'Đang phân tích bảng câu hỏi Excel...' : 'Parsing question spreadsheet...')
    const excelBuffer = await excelEntry.async('arraybuffer')
    const workbook = XLSX.read(excelBuffer, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' })

    const zipMediaEntries: Record<string, JSZip.JSZipObject> = {}
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir || path.includes('__MACOSX')) continue
      const cleanPath = path.replace(/\\/g, '/')
      const filename = cleanPath.split('/').pop() || cleanPath
      const lowerName = filename.toLowerCase().trim()

      if (/\.(mp3|wav|m4a|ogg|aac|flac|jpg|jpeg|png|webp|gif|svg)$/i.test(lowerName)) {
        zipMediaEntries[cleanPath.toLowerCase()] = entry
        zipMediaEntries[lowerName] = entry
        if (!distinctMediaNames.includes(lowerName)) {
          distinctMediaNames.push(lowerName)
        }
      }
    }
    getMediaBuffer = async (name: string) => {
      const entry = zipMediaEntries[name]
      if (!entry) return null
      return entry.async('arraybuffer')
    }
  }

  if (!rawRows || rawRows.length === 0) {
    throw new Error(isVi ? 'File Excel câu hỏi không có dòng dữ liệu nào!' : 'Question sheet is empty!')
  }

  if (!isLessonMode) {
    onProgress?.(isVi ? 'Đang kiểm tra tính tương thích cột kỹ năng...' : 'Validating skills compatibility...')

    const invalidSkillDetails: string[] = []

    for (let idx = 0; idx < rawRows.length; idx++) {
      const row = rawRows[idx]
      let rowStt: string | number = idx + 1
      let explicitSkillStr = ''
      let explicitPartStr = ''

      for (const [colName, val] of Object.entries(row)) {
        const norm = normalizeKey(colName)
        const strVal = String(val ?? '').trim()
        if (!strVal) continue

        if (norm.includes('stt') || norm === 'no' || norm === 'number') {
          rowStt = strVal
        } else if (norm.includes('kynang') || norm.includes('skill')) {
          explicitSkillStr = strVal
        } else if (norm.includes('part') || norm.includes('phan') || norm.includes('loai') || norm.includes('type')) {
          explicitPartStr = strVal
        }
      }

      const testValues = [explicitSkillStr, explicitPartStr].filter(Boolean)
      for (const val of testValues) {
        const classified = classifySkill(val)
        if (!is4Skills) {
          if (classified === 'SPEAKING' || classified === 'WRITING' || classified === 'UNKNOWN') {
            const excelLine = idx + 2
            invalidSkillDetails.push(
              isVi
                ? `Dòng ${excelLine} (STT ${rowStt}: "${val}")`
                : `Row ${excelLine} (No. ${rowStt}: "${val}")`
            )
            break
          }
        } else {
          if (classified === 'UNKNOWN') {
            const excelLine = idx + 2
            invalidSkillDetails.push(
              isVi
                ? `Dòng ${excelLine} (STT ${rowStt}: "${val}")`
                : `Row ${excelLine} (No. ${rowStt}: "${val}")`
            )
            break
          }
        }
      }
    }

    if (invalidSkillDetails.length > 0) {
      const errorMsg = !is4Skills
        ? isVi
          ? `Khóa học / Đề thi này áp dụng TOEIC 2 Kỹ năng (Chỉ bao gồm Nghe và Đọc). File tải lên chứa kỹ năng không hợp lệ: ${invalidSkillDetails.join(', ')}. Hệ thống đã từ chối tải lên và không lưu media lên hệ thống lưu trữ R2. Vui lòng chỉnh sửa file chỉ gồm kỹ năng Nghe và Đọc!`
          : `This course / exam is configured for TOEIC 2 Skills (Listening & Reading only). Uploaded file contains unsupported skills: ${invalidSkillDetails.join(', ')}. No media was uploaded to R2. Please ensure the file only contains Listening and Reading!`
        : isVi
          ? `File tải lên chứa kỹ năng không hợp lệ: ${invalidSkillDetails.join(', ')}. Đề thi 4 Kỹ năng chỉ hỗ trợ các kỹ năng: Nghe, Đọc, Nói, Viết!`
          : `Uploaded file contains invalid skills: ${invalidSkillDetails.join(', ')}. Only Listening, Reading, Speaking, and Writing are supported!`

      throw new Error(errorMsg)
    }
  }

  const uploadedMap: Record<string, string> = {}
  let detectedGlobalAudioUrl: string | undefined = undefined

  if (distinctMediaNames.length > 0) {
    let lastUploadError: string | null = null

    for (let i = 0; i < distinctMediaNames.length; i++) {
      const name = distinctMediaNames[i]

      onProgress?.(
        isVi
          ? `Đang tải lên media (${i + 1}/${distinctMediaNames.length}): ${name}...`
          : `Uploading asset (${i + 1}/${distinctMediaNames.length}): ${name}...`,
        i + 1,
        distinctMediaNames.length
      )

      try {
        const arrayBuffer = await getMediaBuffer(name)
        if (!arrayBuffer) continue
        const mimeType = getMimeType(name)
        const isAudio = mimeType.startsWith('audio/')
        const cleanExt = name.split('.').pop() || (isAudio ? 'mp3' : 'jpg')
        const uploadFileObj = new File([arrayBuffer], `exam_asset_${Date.now()}_${i}.${cleanExt}`, {
          type: mimeType,
        })
        const folder = isAudio ? 'exam-question-audio' : 'exam-question-image'

        const uploadRes = await mediaAdminService.uploadFile(uploadFileObj, folder)
        const publicUrl = uploadRes.file_url || uploadRes.url || uploadRes.public_url

        if (publicUrl) {
          uploadedMap[name.toLowerCase()] = publicUrl
          const baseNameNoExt = name.replace(/\.[^.]+$/, '').toLowerCase()
          uploadedMap[baseNameNoExt] = publicUrl
          uploadedMap[normalizeKey(name)] = publicUrl
          uploadedMap[normalizeKey(baseNameNoExt)] = publicUrl

          if (
            !isLessonMode &&
            isAudio &&
            !detectedGlobalAudioUrl &&
            (name.includes('full') ||
              name.includes('global') ||
              name.includes('all') ||
              name.includes('exam') ||
              distinctMediaNames.filter((n) => getMimeType(n).startsWith('audio/')).length === 1)
          ) {
            detectedGlobalAudioUrl = publicUrl
          }
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        lastUploadError = errorMsg
      }
    }

    if (Object.keys(uploadedMap).length === 0 && distinctMediaNames.length > 0) {
      throw new Error(
        isVi
          ? `Không thể tải lên bất kỳ file media nào lên hệ thống lưu trữ R2! Chi tiết lỗi: ${lastUploadError || 'Lỗi mạng hoặc giới hạn hạn mức'}`
          : `Failed to upload any media files to R2 storage! Details: ${lastUploadError || 'Network or quota error'}`
      )
    }
  }

  const findMatchedMediaUrl = (inputVal: string): string => {
    if (!inputVal) return ''
    const cleanVal = inputVal.trim()
    if (!cleanVal) return ''
    if (cleanVal.startsWith('http://') || cleanVal.startsWith('https://')) {
      return cleanVal
    }
    const lowerVal = cleanVal.toLowerCase()
    const cleanPath = lowerVal.replace(/\\/g, '/')
    const basename = cleanPath.split('/').pop() || lowerVal
    const noExt = basename.replace(/\.[^.]+$/, '')

    return (
      uploadedMap[lowerVal] ||
      uploadedMap[cleanPath] ||
      uploadedMap[basename] ||
      uploadedMap[normalizeKey(cleanVal)] ||
      uploadedMap[normalizeKey(basename)] ||
      uploadedMap[noExt] ||
      uploadedMap[normalizeKey(noExt)] ||
      ''
    )
  }

  onProgress?.(isVi ? 'Đang tổng hợp câu hỏi và hoàn tất nạp...' : 'Compiling questions...')
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
    let skillType: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' = 'READING'
    let explicitPart: number | undefined = undefined
    let audioFileName = ''
    let imageFileName = ''

    for (const [colName, val] of Object.entries(row)) {
      const norm = normalizeKey(colName)
      const strVal = String(val ?? '').trim()

      if (norm.includes('cauhoi') || norm.includes('question') || norm.includes('debai') || norm.includes('prompt')) {
        questionText = strVal
      } else if (norm.includes('kynang') || norm.includes('skill')) {
        const c = classifySkill(strVal)
        if (c !== 'UNKNOWN') skillType = c
      } else if (norm.includes('part') || norm.includes('phan')) {
        const c = classifySkill(strVal)
        if (c === 'SPEAKING') {
          skillType = 'SPEAKING'
        } else if (c === 'WRITING') {
          skillType = 'WRITING'
        } else {
          const numMatch = strVal.match(/\d+/)
          if (numMatch) {
            const p = parseInt(numMatch[0], 10)
            if (p >= 1 && p <= 7) {
              explicitPart = p
              if (p <= 4) skillType = 'LISTENING'
              else skillType = 'READING'
            }
          }
        }
      } else if (
        norm.includes('dapandung') ||
        norm.includes('correct') ||
        norm.includes('key') ||
        norm === 'dapan' ||
        (norm.includes('answer') &&
          !norm.includes('answera') &&
          !norm.includes('answerb') &&
          !norm.includes('answerc') &&
          !norm.includes('answerd'))
      ) {
        const cleaned = strVal.toUpperCase().replace(/[^ABCD]/g, '')
        if (cleaned) correctLetter = cleaned[0]
      } else if (norm.includes('luachona') || norm.includes('optiona') || norm === 'a' || norm === 'dapana') {
        optA = strVal
      } else if (norm.includes('luachonb') || norm.includes('optionb') || norm === 'b' || norm === 'dapanb') {
        optB = strVal
      } else if (norm.includes('luachonc') || norm.includes('optionc') || norm === 'c' || norm === 'dapanc') {
        optC = strVal
      } else if (
        norm.includes('luachond') ||
        norm.includes('optiond') ||
        norm === 'd' ||
        (norm.includes('dapand') && !norm.includes('dung'))
      ) {
        optD = strVal
      } else if (norm.includes('loigiai') || norm.includes('giaithich') || norm.includes('explain')) {
        explanation = strVal
      } else if (
        norm.includes('audio') ||
        norm.includes('mp3') ||
        norm.includes('sound') ||
        norm.includes('voice') ||
        norm === 'fileaudio'
      ) {
        audioFileName = strVal
      } else if (
        norm.includes('image') ||
        norm.includes('img') ||
        norm.includes('anh') ||
        norm.includes('hinh') ||
        norm.includes('photo') ||
        norm === 'fileanh'
      ) {
        imageFileName = strVal
      }
    }

    let matchedAudioUrl = findMatchedMediaUrl(audioFileName)
    const matchedImageUrl = findMatchedMediaUrl(imageFileName)

    if (matchedAudioUrl) {
      audioLinkedCount++
      if (skillType === 'READING') {
        skillType = 'LISTENING'
      }
    }
    if (matchedImageUrl) {
      imageLinkedCount++
    }

    const areOptionsEmpty = !optA.trim() && !optB.trim() && !optC.trim() && !optD.trim()
    const isSpeakingPrompt = /describe\s+a\s+time|speak\s+about|pronounce/i.test(questionText)
    const isWritingPrompt = /write\s+an?\s+(email|essay|letter|paragraph)|at\s+least\s+\d+\s+words/i.test(questionText)

    const isSpeaking = skillType === 'SPEAKING' || (areOptionsEmpty && isSpeakingPrompt)
    const isWriting = skillType === 'WRITING' || (areOptionsEmpty && isWritingPrompt)
    const isListening = skillType === 'LISTENING' || (explicitPart !== undefined && explicitPart <= 4)
    const finalSkill: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' =
      isSpeaking ? 'SPEAKING' : isWriting ? 'WRITING' : isListening ? 'LISTENING' : 'READING'

    return {
      id: `q_zip_${Date.now()}_${idx}`,
      skill_type: finalSkill,
      part_number: isSpeaking ? 'speaking' : isWriting ? 'writing' : explicitPart,
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

  return {
    questions: parsedQuestions,
    globalAudioUrl: detectedGlobalAudioUrl,
    totalQuestions: parsedQuestions.length,
    audioCount: audioLinkedCount,
    imageCount: imageLinkedCount,
  }
}
