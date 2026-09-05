/**
 * @file zip.exam.helper.ts
 * @description Tiện ích xử lý hỗ trợ cho zip.exam.helper.ts
 */

import type { ExamQuestionItem } from '@/components/exams/exam.question.editor.modal'
import { mediaAdminService } from '@/services/media.service'
import { toast } from '@/store/toast.store'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'

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

export interface ParseZipResult {
  questions: ExamQuestionItem[]
  globalAudioUrl?: string
  totalQuestions: number
  audioCount: number
  imageCount: number
}

/**
 * Generate and download standard sample ZIP package
 */
export async function downloadSampleZip(isVi = true): Promise<void> {
  try {
    const zip = new JSZip()

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

    const dummyPngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    zip.file('images/part1_q1.jpg', dummyPngBase64, { base64: true })
    zip.file('images/part7_email.png', dummyPngBase64, { base64: true })

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
    toast.error(isVi ? 'Lỗi khi tạo file ZIP mẫu.' : 'Failed to generate sample ZIP.')
  }
}

/**
 * Unpack, parse questions spreadsheet and upload media assets from a ZIP file
 */
export async function parseAndUploadZipExam(
  file: File,
  isVi: boolean,
  onProgress?: (status: string, current?: number, total?: number) => void
): Promise<ParseZipResult> {
  if (!/\.(zip)$/i.test(file.name)) {
    throw new Error(isVi ? 'Vui lòng chọn file nén định dạng .zip' : 'Please select a .zip archive file')
  }

  if (file.size > 200 * 1024 * 1024) {
    throw new Error(isVi ? 'Dung lượng file ZIP không được vượt quá 200MB' : 'ZIP file must not exceed 200MB')
  }

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
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' })

  if (!rawRows || rawRows.length === 0) {
    throw new Error(isVi ? 'File Excel câu hỏi không có dòng dữ liệu nào!' : 'Question sheet is empty!')
  }

  const mediaEntries: Record<string, JSZip.JSZipObject> = {}
  let detectedGlobalAudioUrl: string | undefined = undefined

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || path.includes('__MACOSX')) continue
    const filename = path.split('/').pop() || path
    const lowerName = filename.toLowerCase().trim()

    if (/\.(mp3|wav|m4a|ogg|jpg|jpeg|png|webp|gif)$/i.test(lowerName)) {
      mediaEntries[lowerName] = entry
    }
  }

  const neededMediaNames = new Set<string>()
  rawRows.forEach((row) => {
    Object.entries(row).forEach(([k, v]) => {
      const norm = normalizeKey(k)
      if (
        (norm.includes('audio') || norm.includes('mp3') || norm.includes('anh') || norm.includes('image')) &&
        typeof v === 'string'
      ) {
        const clean = v.trim().toLowerCase()
        if (clean) neededMediaNames.add(clean)
      }
    })
  })

  for (const name of Object.keys(mediaEntries)) {
    if (name.includes('full') || name.includes('exam_audio') || name.includes('toan_bai')) {
      neededMediaNames.add(name)
    }
  }

  const filesToUpload = Array.from(neededMediaNames).filter((name) => mediaEntries[name])
  const uploadedMap: Record<string, string> = {}

  if (filesToUpload.length > 0) {
    for (let i = 0; i < filesToUpload.length; i++) {
      const name = filesToUpload[i]
      const entry = mediaEntries[name]
      onProgress?.(
        isVi
          ? `Đang tải lên media (${i + 1}/${filesToUpload.length}): ${name}...`
          : `Uploading asset (${i + 1}/${filesToUpload.length}): ${name}...`,
        i + 1,
        filesToUpload.length
      )

      try {
        const blob = await entry.async('blob')
        const fileObj = new File([blob], name, { type: getMimeType(name) })
        const uploadRes = await mediaAdminService.uploadFile(fileObj, 'exam-package')
        const url = uploadRes.file_url || uploadRes.url || uploadRes.public_url || ''
        if (url) {
          uploadedMap[name] = url
          if (name.includes('full') || name.includes('exam_audio') || name.includes('toan_bai')) {
            detectedGlobalAudioUrl = url
          }
        }
      } catch (uploadErr) {
        console.warn(`Failed to upload ${name}:`, uploadErr)
      }
    }
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

  return {
    questions: parsedQuestions,
    globalAudioUrl: detectedGlobalAudioUrl,
    totalQuestions: parsedQuestions.length,
    audioCount: audioLinkedCount,
    imageCount: imageLinkedCount,
  }
}
