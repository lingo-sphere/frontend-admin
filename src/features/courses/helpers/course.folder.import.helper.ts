// Helper xu ly doc file Excel va khop noi video cung tai lieu PDF va anh thumbnail phuc vu tao nhanh khoa hoc.

import * as XLSX from 'xlsx'
import type { CourseFormData, CourseModule, CourseLesson, LessonQuestion } from '@/features/courses/components/course.basic.info.tab'
import type { QuizQuestionItem } from '@/features/courses/schemas/course.schema'
import { generateSlug } from '@/features/courses/helpers/course.helper'
import { authStore } from '@/features/auth/store/auth.store'

export interface VideoUploadTaskItem {
  lessonId: string
  lessonKey: string
  moduleOrder: number
  lessonOrder: number
  file: File
  durationSeconds?: number
  durationMinutes?: number
}

export interface LessonTheoryUploadTaskItem {
  lessonId: string
  lessonKey: string
  moduleOrder: number
  lessonOrder: number
  file: File
}

export interface MatchedLessonItem {
  moduleOrder: number
  moduleTitle: string
  moduleDescription?: string
  moduleTheoryFile?: string
  modulePassingScore: number
  moduleDurationMinutes?: number
  moduleSpeakingPrompt?: string
  moduleWritingPrompt?: string
  lessonOrder: number
  lessonTitle: string
  videoFilename: string
  isFreePreview: boolean
  lessonTheoryFile?: string
  lessonTheoryText?: string
  matchedVideoFile?: File
  matchedTheoryFile?: File
  videoDurationSeconds?: number
  videoDurationMinutes?: number
}

export interface ParsedFolderResult {
  excelFileName: string
  courseInfo: Partial<CourseFormData>
  modules: CourseModule[]
  lessons: MatchedLessonItem[]
  totalModulesCount: number
  totalLessonsCount: number
  matchedVideosCount: number
  missingVideosCount: number
  matchedPdfsCount: number
  totalChapterQuestionsCount: number
  totalLessonQuizzesCount: number
  totalFinalQuestionsCount: number
  videoFilesToUpload: VideoUploadTaskItem[]
  theoryFilesToUpload: { moduleOrder: number; file: File }[]
  lessonTheoryFilesToUpload: LessonTheoryUploadTaskItem[]
  courseDocumentFileToUpload?: File
  courseThumbnailFileToUpload?: File
  finalTestAudioFileToUpload?: File
  finalTestSpeakingFileToUpload?: File
  moduleAudioFilesToUpload: { moduleOrder: number; file: File }[]
  moduleSpeakingFilesToUpload: { moduleOrder: number; file: File }[]
  questionMediaFilesToUpload: {
    questionId: string
    file: File
    isChapterTest: boolean
    isFinalTest: boolean
    moduleOrder?: number
  }[]
}

const findValue = (rows: Record<string, unknown>[], fieldKeywords: string[]): string | number | undefined => {
  for (const row of rows) {
    const rawKey = String(row['Trường thông tin (Field)'] || row['Field'] || row['Trường'] || Object.values(row)[0] || '').toLowerCase()
    for (const kw of fieldKeywords) {
      if (rawKey.includes(kw.toLowerCase())) {
        const val = row['Giá trị cấu hình (Value)'] ?? row['Value'] ?? row['Giá trị'] ?? Object.values(row)[1]
        if (val !== undefined && val !== null) return val as string | number
      }
    }
  }
  return undefined
}

const findRowString = (row: Record<string, unknown>, fieldKeywords: string[]): string => {
  for (const kw of fieldKeywords) {
    const lowerKw = kw.toLowerCase().trim()
    if (!lowerKw) continue

    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase().trim()
      if (
        lowerKey === lowerKw ||
        lowerKey.includes(`(${lowerKw})`) ||
        lowerKey.startsWith(`${lowerKw} `) ||
        lowerKey.endsWith(` ${lowerKw}`)
      ) {
        const val = row[key]
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim()
        }
      }
    }
  }

  for (const kw of fieldKeywords) {
    const lowerKw = kw.toLowerCase().trim()
    if (!lowerKw) continue

    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase().trim()
      if (lowerKey.includes(lowerKw)) {
        const val = row[key]
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim()
        }
      }
    }
  }

  return ''
}

const findMatchingFile = (targetName: string, files: File[]): File | undefined => {
  if (!targetName || !targetName.trim()) return undefined
  const cleanTarget = targetName.trim().toLowerCase()
  return files.find((f) => {
    const fName = f.name.trim().toLowerCase()
    const fRelPath = f.webkitRelativePath ? f.webkitRelativePath.toLowerCase().replace(/\\/g, '/') : ''
    return fName === cleanTarget || fRelPath.endsWith(`/${cleanTarget}`) || fRelPath === cleanTarget
  })
}

export const readVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true
      const objUrl = URL.createObjectURL(file)
      let isDone = false
      const finish = (dur: number) => {
        if (!isDone) {
          isDone = true
          try {
            URL.revokeObjectURL(objUrl)
          } catch {}
          resolve(dur && !isNaN(dur) && isFinite(dur) ? Math.round(dur) : 0)
        }
      }
      video.onloadedmetadata = () => finish(video.duration)
      video.onerror = () => finish(0)
      setTimeout(() => finish(video.duration || 0), 4000)
      video.src = objUrl
      video.load()
    } catch {
      resolve(0)
    }
  })
}

export async function parseCourseFolder(files: File[]): Promise<ParsedFolderResult> {
  const validExcelFiles = files.filter((f) => {
    const lower = f.name.toLowerCase()
    return (
      (lower.endsWith('.xlsx') || lower.endsWith('.xls')) &&
      !lower.startsWith('~$') &&
      !f.webkitRelativePath.includes('__MACOSX')
    )
  })

  const excelFile =
    validExcelFiles.find((f) => f.name.toLowerCase().includes('updated')) ||
    validExcelFiles.find((f) => f.name.toLowerCase() === 'course_info.xlsx') ||
    validExcelFiles[0]

  if (!excelFile) {
    throw new Error('Không tìm thấy file Excel (.xlsx) cấu hình khóa học trong thư mục được chọn.')
  }

  const arrayBuffer = await excelFile.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const sheetNames = workbook.SheetNames
  const infoSheetName = sheetNames.find((s) => /info|thong_tin|course/i.test(s)) || sheetNames[0]
  const lessonsSheetName = sheetNames.find((s) => /lesson|bai_hoc|curriculum/i.test(s)) || sheetNames[1]
  const testsSheetName = sheetNames.find((s) => /chapter_test|chapter|kiem_tra/i.test(s))
  const quizzesSheetName = sheetNames.find((s) => /quiz|on_tap/i.test(s))
  const finalTestsSheetName = sheetNames.find((s) => /final|tot_nghiep/i.test(s))

  const infoRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[infoSheetName] || {})
  const lessonsRaw = lessonsSheetName
    ? XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[lessonsSheetName] || {})
    : []
  const chapterTestsRaw = testsSheetName
    ? XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[testsSheetName] || {})
    : []
  const lessonQuizzesRaw = quizzesSheetName
    ? XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[quizzesSheetName] || {})
    : []
  const finalTestsRaw = finalTestsSheetName
    ? XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[finalTestsSheetName] || {})
    : []

  const rawTitle = findValue(infoRaw, ['title', 'tên khóa học'])
  const title = String(rawTitle || '').trim()
  if (!title) {
    throw new Error('File Excel thiếu thông tin "title" (Tên khóa học) trong sheet Course_Info.')
  }

  const rawSlug = String(findValue(infoRaw, ['slug', 'đường dẫn rút gọn']) || '').trim()
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(title)

  const rawCategory = String(findValue(infoRaw, ['category', 'thể loại']) || '').trim().toUpperCase()
  if (!rawCategory) {
    throw new Error('File Excel thiếu thông tin "category" (Thể loại) trong sheet Course_Info.')
  }
  if (rawCategory !== 'TOEIC_2_SKILLS' && rawCategory !== 'TOEIC_4_SKILLS') {
    throw new Error(
      `Thể loại khóa học (category) "${rawCategory}" không hợp lệ theo chuẩn Backend. Giá trị hợp lệ: TOEIC_2_SKILLS hoặc TOEIC_4_SKILLS.`
    )
  }
  const category: 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS' = rawCategory

  const rawTargetScore = findValue(infoRaw, ['target_score', 'mục tiêu'])
  if (rawTargetScore === undefined || rawTargetScore === null || String(rawTargetScore).trim() === '') {
    throw new Error('File Excel thiếu thông tin "target_score" (Điểm mục tiêu) trong sheet Course_Info.')
  }
  const target_score = Number(rawTargetScore)
  if (!Number.isInteger(target_score) || target_score < 0 || target_score > 990) {
    throw new Error(
      `Điểm mục tiêu (target_score) "${rawTargetScore}" không hợp lệ theo chuẩn Backend. Phải là số nguyên từ 0 đến 990.`
    )
  }

  const rawPrice = findValue(infoRaw, ['price', 'giá gốc'])
  if (rawPrice === undefined || rawPrice === null || String(rawPrice).trim() === '') {
    throw new Error('File Excel thiếu thông tin "price" (Giá gốc) trong sheet Course_Info.')
  }
  const price = Number(rawPrice)
  if (!Number.isInteger(price) || price < 0) {
    throw new Error(`Giá khóa học (price) "${rawPrice}" không hợp lệ theo chuẩn Backend. Phải là số nguyên không âm (>= 0).`)
  }

  const rawDiscountPrice = findValue(infoRaw, ['discount_price', 'giá khuyến mãi'])
  let discount_price = 0
  if (rawDiscountPrice !== undefined && rawDiscountPrice !== null && String(rawDiscountPrice).trim() !== '') {
    const numDiscount = Number(rawDiscountPrice)
    if (!Number.isInteger(numDiscount) || numDiscount < 0) {
      throw new Error(
        `Giá khuyến mãi (discount_price) "${rawDiscountPrice}" không hợp lệ theo chuẩn Backend. Phải là số nguyên không âm (>= 0).`
      )
    }
    if (price > 0 && numDiscount > price) {
      throw new Error(`Giá khuyến mãi (${numDiscount}) không được lớn hơn giá gốc (${price}).`)
    }
    discount_price = numDiscount
  }

  const authState = authStore.getState()
  const currentUser = authState.user
  const currentProfile = authState.profile
  const author_id = currentUser?.user_id || currentProfile?.user_id
  if (!author_id) {
    throw new Error('Không xác định được danh tính tác giả (author_id). Vui lòng đăng nhập lại.')
  }
  const author_name = currentUser?.full_name || currentProfile?.full_name || ''
  const author_email = currentUser?.email || currentProfile?.email || ''
  const author_avatar = currentUser?.avatar_url || currentProfile?.avatar_url || ''
  const authorRole = currentUser?.role || currentProfile?.role
  const author_title =
    authorRole === 'INSTRUCTOR' ? 'Giảng viên chuyên môn' : 'Quản trị viên học thuật'
  const author_bio = currentProfile?.bio || ''

  const description = String(
    findValue(infoRaw, ['description', 'mô tả']) || `Khóa học ${title} chất lượng cao chuẩn quốc tế trên LingoSphere.`
  ).trim()

  const rawFinalPassing = findValue(infoRaw, ['final_test_passing_score', 'điểm đạt kiểm tra cuối khóa', 'cuối khóa'])
  if (rawFinalPassing === undefined || rawFinalPassing === null || String(rawFinalPassing).trim() === '') {
    throw new Error(
      'File Excel thiếu thông tin "final_test_passing_score" (Điểm đạt bài thi cuối khóa) trong sheet Course_Info.'
    )
  }
  const final_test_passing_score = Number(rawFinalPassing)
  if (!Number.isInteger(final_test_passing_score) || final_test_passing_score < 0 || final_test_passing_score > 100) {
    throw new Error(
      `Điểm đạt bài thi cuối khóa (final_test_passing_score) "${rawFinalPassing}" không hợp lệ theo chuẩn Backend. Phải là số nguyên từ 0 đến 100.`
    )
  }

  const rawFinalDuration = findValue(infoRaw, [
    'final_test_duration_minutes',
    'thời lượng thi tốt nghiệp',
    'thời lượng kiểm tra cuối khóa',
  ])
  if (rawFinalDuration === undefined || rawFinalDuration === null || String(rawFinalDuration).trim() === '') {
    throw new Error(
      'File Excel thiếu thông tin "final_test_duration_minutes" (Thời lượng bài thi cuối khóa) trong sheet Course_Info.'
    )
  }
  const final_test_duration_minutes = Number(rawFinalDuration)
  if (!Number.isInteger(final_test_duration_minutes) || final_test_duration_minutes <= 0) {
    throw new Error(
      `Thời lượng bài thi cuối khóa (final_test_duration_minutes) "${rawFinalDuration}" không hợp lệ theo chuẩn Backend. Phải là số nguyên lớn hơn 0.`
    )
  }

  const final_test_speaking_prompt = String(findValue(infoRaw, ['final_test_speaking_prompt', 'đề thi nói cuối khóa']) || '').trim()
  const final_test_writing_prompt = String(findValue(infoRaw, ['final_test_writing_prompt', 'đề thi viết cuối khóa']) || '').trim()

  const rawIsPublished = findValue(infoRaw, ['is_published', 'xuất bản'])
  if (rawIsPublished === undefined || rawIsPublished === null || String(rawIsPublished).trim() === '') {
    throw new Error('File Excel thiếu thông tin "is_published" (Trạng thái xuất bản) trong sheet Course_Info.')
  }
  const strPub = String(rawIsPublished).trim().toUpperCase()
  let is_published = true
  if (strPub === 'TRUE' || strPub === '1') {
    is_published = true
  } else if (strPub === 'FALSE' || strPub === '0') {
    is_published = false
  } else {
    throw new Error(`Trạng thái xuất bản (is_published) "${rawIsPublished}" không hợp lệ theo chuẩn Backend. Giá trị hợp lệ: TRUE hoặc FALSE.`)
  }

  const rawThumbnailName = String(
    findValue(infoRaw, [
      'thumbnail_file',
      'thumbnail_image',
      'ảnh thumbnail',
      'ảnh đại diện',
      'thumbnail',
      'cover',
    ]) || 'thumbnail.png'
  ).trim()

  const matchedCourseThumbnailFile = rawThumbnailName ? findMatchingFile(rawThumbnailName, files) : undefined

  const rawDocumentName = String(
    findValue(infoRaw, [
      'document_file',
      'document_name',
      'document_url',
      'tài liệu tổng quan',
      'tài liệu khóa học',
      'giáo trình',
      'cẩm nang',
      'file tài liệu',
      'syllabus',
    ]) || ''
  ).trim()

  const matchedCourseDocumentFile = rawDocumentName ? findMatchingFile(rawDocumentName, files) : undefined
  const document_name = matchedCourseDocumentFile?.name || rawDocumentName || undefined

  const rawFinalAudio = String(
    findValue(infoRaw, [
      'final_test_audio_file',
      'final_test_audio',
      'âm thanh đề thi cuối khóa',
      'audio đề thi cuối khóa',
      'audio cuối khóa',
      'file âm thanh cuối khóa',
    ]) || ''
  ).trim()

  const matchedFinalTestAudioFile = rawFinalAudio ? findMatchingFile(rawFinalAudio, files) : undefined

  const rawFinalSpeaking = String(
    findValue(infoRaw, [
      'final_test_speaking_file',
      'speaking_sample_final',
      'âm thanh nói mẫu cuối khóa',
      'audio nói mẫu cuối khóa',
    ]) || ''
  ).trim()

  const matchedFinalTestSpeakingFile = rawFinalSpeaking ? findMatchingFile(rawFinalSpeaking, files) : undefined

  const questionMediaFilesToUpload: {
    questionId: string
    file: File
    isChapterTest: boolean
    isFinalTest: boolean
    moduleOrder?: number
  }[] = []

  const finalTestQuestions: QuizQuestionItem[] = []
  finalTestsRaw.forEach((row, ftIdx) => {
    const qText = String(row['Câu hỏi trắc nghiệm (question_text)'] ?? row['question_text'] ?? row['Câu hỏi'] ?? '').trim()
    if (!qText) return
    const optA = String(row['Đáp án A (option_a)'] ?? row['option_a'] ?? row['A'] ?? '').trim()
    const optB = String(row['Đáp án B (option_b)'] ?? row['option_b'] ?? row['B'] ?? '').trim()
    const optC = String(row['Đáp án C (option_c)'] ?? row['option_c'] ?? row['C'] ?? '').trim()
    const optD = String(row['Đáp án D (option_d)'] ?? row['option_d'] ?? row['D'] ?? '').trim()
    const options = [optA, optB, optC, optD].filter(Boolean)
    const rawAnswer = String(row['Đáp án đúng (correct_answer)'] ?? row['correct_answer'] ?? row['Đáp án'] ?? '').trim().toUpperCase()
    if (rawAnswer && !['A', 'B', 'C', 'D'].includes(rawAnswer)) {
      throw new Error(`Đáp án đúng "${rawAnswer}" tại câu hỏi tốt nghiệp số ${ftIdx + 1} không hợp lệ theo chuẩn Backend (chỉ chấp nhận A, B, C hoặc D).`)
    }
    const correct_answer = rawAnswer || 'A'
    const explanation = String(row['Lời giải thích chi tiết (explanation)'] ?? row['explanation'] ?? row['Giải thích'] ?? '').trim()
    const mediaFilename = String(
      row['File hình ảnh / âm thanh (media_filename)'] ??
      row['media_filename'] ??
      row['media_file'] ??
      row['image_file'] ??
      row['audio_file'] ??
      ''
    ).trim()

    const qId = `final-q${ftIdx + 1}`
    const matchedMedia = mediaFilename ? findMatchingFile(mediaFilename, files) : undefined
    if (matchedMedia) {
      questionMediaFilesToUpload.push({
        questionId: qId,
        file: matchedMedia,
        isChapterTest: false,
        isFinalTest: true,
      })
    }

    const isImageFile = /\.(jpe?g|png|webp|gif|svg)$/i.test(mediaFilename)
    const isAudioFile = /\.(mp3|wav|ogg|m4a|aac)$/i.test(mediaFilename)

    finalTestQuestions.push({
      id: qId,
      question_text: qText,
      options,
      correct_answer,
      explanation,
      order_index: ftIdx + 1,
      media_url: isAudioFile ? mediaFilename : undefined,
      audio_url: isAudioFile ? mediaFilename : undefined,
      image_url: isImageFile ? mediaFilename : undefined,
    })
  })

  const courseInfo: Partial<CourseFormData> = {
    title,
    slug,
    category,
    target_score,
    price,
    discount_price,
    author_id,
    author_name,
    author_title,
    author_email: author_email || undefined,
    author_avatar: author_avatar || undefined,
    author_bio: author_bio || undefined,
    description,
    final_test_passing_score,
    final_test_duration_minutes,
    final_test_speaking_prompt: final_test_speaking_prompt || undefined,
    final_test_writing_prompt: final_test_writing_prompt || undefined,
    final_test_questions: finalTestQuestions,
    is_published,
    document_name,
  }

  const chapterTestsByModule = new Map<number, QuizQuestionItem[]>()
  chapterTestsRaw.forEach((row, qIdx) => {
    const rawMOrder = row['Thứ tự chương (module_order)'] ?? row['module_order'] ?? row['Chương'] ?? 1
    const mOrder = Number(rawMOrder)
    if (!Number.isInteger(mOrder) || mOrder < 1) {
      throw new Error(`Thứ tự chương (module_order) "${rawMOrder}" tại câu hỏi kiểm tra chương số ${qIdx + 1} không hợp lệ. Phải là số nguyên >= 1.`)
    }
    const qText = String(row['Câu hỏi trắc nghiệm (question_text)'] ?? row['question_text'] ?? row['Câu hỏi'] ?? '').trim()
    if (!qText) return
    const optA = String(row['Đáp án A (option_a)'] ?? row['option_a'] ?? row['A'] ?? '').trim()
    const optB = String(row['Đáp án B (option_b)'] ?? row['option_b'] ?? row['B'] ?? '').trim()
    const optC = String(row['Đáp án C (option_c)'] ?? row['option_c'] ?? row['C'] ?? '').trim()
    const optD = String(row['Đáp án D (option_d)'] ?? row['option_d'] ?? row['D'] ?? '').trim()
    const options = [optA, optB, optC, optD].filter(Boolean)
    const rawAnswer = String(row['Đáp án đúng (correct_answer)'] ?? row['correct_answer'] ?? row['Đáp án'] ?? '').trim().toUpperCase()
    if (rawAnswer && !['A', 'B', 'C', 'D'].includes(rawAnswer)) {
      throw new Error(`Đáp án đúng "${rawAnswer}" tại câu hỏi kiểm tra chương ${mOrder} số ${qIdx + 1} không hợp lệ theo chuẩn Backend (chỉ chấp nhận A, B, C hoặc D).`)
    }
    const correct_answer = rawAnswer || 'A'
    const explanation = String(row['Lời giải thích chi tiết (explanation)'] ?? row['explanation'] ?? row['Giải thích'] ?? '').trim()
    const mediaFilename = String(
      row['File hình ảnh / âm thanh (media_filename)'] ??
      row['media_filename'] ??
      row['media_file'] ??
      row['image_file'] ??
      row['audio_file'] ??
      ''
    ).trim()

    const qId = `test-m${mOrder}-q${qIdx + 1}`
    const matchedMedia = mediaFilename ? findMatchingFile(mediaFilename, files) : undefined
    if (matchedMedia) {
      questionMediaFilesToUpload.push({
        questionId: qId,
        file: matchedMedia,
        isChapterTest: true,
        isFinalTest: false,
        moduleOrder: mOrder,
      })
    }

    const isImageFile = /\.(jpe?g|png|webp|gif|svg)$/i.test(mediaFilename)
    const isAudioFile = /\.(mp3|wav|ogg|m4a|aac)$/i.test(mediaFilename)

    const item: QuizQuestionItem = {
      id: qId,
      question_text: qText,
      options,
      correct_answer,
      explanation,
      order_index: (chapterTestsByModule.get(mOrder)?.length || 0) + 1,
      media_url: isAudioFile ? mediaFilename : undefined,
      audio_url: isAudioFile ? mediaFilename : undefined,
      image_url: isImageFile ? mediaFilename : undefined,
    }

    if (!chapterTestsByModule.has(mOrder)) {
      chapterTestsByModule.set(mOrder, [])
    }
    chapterTestsByModule.get(mOrder)!.push(item)
  })

  const lessonQuizzesByModuleAndLesson = new Map<string, LessonQuestion[]>()
  lessonQuizzesRaw.forEach((row, lqIdx) => {
    const rawMOrder = row['Thứ tự chương (module_order)'] ?? row['module_order'] ?? 1
    const mOrder = Number(rawMOrder)
    if (!Number.isInteger(mOrder) || mOrder < 1) {
      throw new Error(`Thứ tự chương (module_order) "${rawMOrder}" tại câu hỏi ôn tập số ${lqIdx + 1} không hợp lệ. Phải là số nguyên >= 1.`)
    }
    const rawLOrder = row['Thứ tự bài học (lesson_order)'] ?? row['lesson_order'] ?? 1
    const lOrder = Number(rawLOrder)
    if (!Number.isInteger(lOrder) || lOrder < 1) {
      throw new Error(`Thứ tự bài học (lesson_order) "${rawLOrder}" tại câu hỏi ôn tập số ${lqIdx + 1} không hợp lệ. Phải là số nguyên >= 1.`)
    }
    const key = `${mOrder}-${lOrder}`
    const qText = String(row['Câu hỏi ôn tập (question_text)'] ?? row['question_text'] ?? '').trim()
    if (!qText) return
    const optA = String(row['Đáp án A (option_a)'] ?? row['option_a'] ?? '').trim()
    const optB = String(row['Đáp án B (option_b)'] ?? row['option_b'] ?? '').trim()
    const optC = String(row['Đáp án C (option_c)'] ?? row['option_c'] ?? '').trim()
    const optD = String(row['Đáp án D (option_d)'] ?? row['option_d'] ?? '').trim()
    const options = [optA, optB, optC, optD].filter(Boolean)
    const rawAnswer = String(row['Đáp án đúng (correct_answer)'] ?? row['correct_answer'] ?? '').trim().toUpperCase()
    if (rawAnswer && !['A', 'B', 'C', 'D'].includes(rawAnswer)) {
      throw new Error(`Đáp án đúng "${rawAnswer}" tại câu hỏi ôn tập bài học ${mOrder}.${lOrder} số ${lqIdx + 1} không hợp lệ theo chuẩn Backend (chỉ chấp nhận A, B, C hoặc D).`)
    }
    const correct_answer = rawAnswer || 'A'
    const explanation = String(row['Lời giải thích (explanation)'] ?? row['explanation'] ?? '').trim()

    const item: LessonQuestion = {
      id: `quiz-m${mOrder}-l${lOrder}-q${lqIdx + 1}`,
      question_text: qText,
      options,
      correct_answer,
      explanation,
    }

    if (!lessonQuizzesByModuleAndLesson.has(key)) {
      lessonQuizzesByModuleAndLesson.set(key, [])
    }
    lessonQuizzesByModuleAndLesson.get(key)!.push(item)
  })

  const matchedLessons: MatchedLessonItem[] = []
  const modulesMap = new Map<
    number,
    {
      title: string
      description: string
      theoryFile?: string
      passingScore: number
      durationMinutes: number
      speakingPrompt?: string
      writingPrompt?: string
      lessons: CourseLesson[]
    }
  >()
  const videoFilesToUpload: VideoUploadTaskItem[] = []
  const lessonTheoryFilesToUpload: LessonTheoryUploadTaskItem[] = []
  let matchedPdfsCount = matchedCourseDocumentFile ? 1 : 0
  let matchedCount = 0
  let missingCount = 0

  for (let idx = 0; idx < lessonsRaw.length; idx++) {
    const row = lessonsRaw[idx]
    const rawMOrder = row['Thứ tự chương (module_order)'] ?? row['module_order'] ?? 1
    const mOrder = Number(rawMOrder)
    if (!Number.isInteger(mOrder) || mOrder < 1) {
      throw new Error(`Thứ tự chương (module_order) "${rawMOrder}" tại bài học dòng ${idx + 2} không hợp lệ. Phải là số nguyên >= 1.`)
    }
    const mTitle = String(row['Tên chương (module_title)'] ?? row['module_title'] ?? `Chương ${mOrder}`).trim()
    const mDesc = String(row['Mô tả chương (module_description)'] ?? row['module_description'] ?? '').trim()
    const mTheory = String(
      row['Tài liệu tổng hợp chương (module_theory_file)'] ??
      row['Tài liệu chương (module_theory_file)'] ??
      row['Tài liệu lý thuyết chương (module_theory_file)'] ??
      row['module_theory_file'] ??
      findRowString(row, [
        'module_theory_file',
        'tài liệu tổng hợp chương',
        'tài liệu lý thuyết chương',
        'tài liệu chương',
        'đề cương chương',
        'lý thuyết chương',
      ])
    ).trim()

    const rawMPassing = row['Điểm đạt test chương (module_passing_score)'] ?? row['module_passing_score']
    let mPassing = 70
    if (rawMPassing !== undefined && rawMPassing !== null && String(rawMPassing).trim() !== '') {
      const num = Number(rawMPassing)
      if (!Number.isInteger(num) || num < 0 || num > 100) {
        throw new Error(`Điểm đạt test chương "${rawMPassing}" tại bài học dòng ${idx + 2} không hợp lệ theo chuẩn Backend. Phải là số nguyên từ 0 đến 100.`)
      }
      mPassing = num
    }

    const rawMDuration = row['Thời lượng test chương (module_test_duration_minutes)'] ?? row['module_test_duration_minutes']
    let mDuration = category === 'TOEIC_4_SKILLS' ? 20 : 15
    if (rawMDuration !== undefined && rawMDuration !== null && String(rawMDuration).trim() !== '') {
      const num = Number(rawMDuration)
      if (!Number.isInteger(num) || num <= 0) {
        throw new Error(`Thời lượng test chương "${rawMDuration}" tại bài học dòng ${idx + 2} không hợp lệ theo chuẩn Backend. Phải là số nguyên lớn hơn 0.`)
      }
      mDuration = num
    }
    const mSpeakingPrompt = String(
      row['Đề kiểm tra nói chương (module_speaking_prompt)'] ??
      row['module_speaking_prompt'] ??
      findRowString(row, ['module_speaking_prompt', 'đề kiểm tra nói'])
    ).trim()
    const mWritingPrompt = String(
      row['Đề kiểm tra viết chương (module_writing_prompt)'] ??
      row['module_writing_prompt'] ??
      findRowString(row, ['module_writing_prompt', 'đề kiểm tra viết'])
    ).trim()

    const rawLOrder = row['Thứ tự bài học (lesson_order)'] ?? row['lesson_order'] ?? idx + 1
    const lOrder = Number(rawLOrder)
    if (!Number.isInteger(lOrder) || lOrder < 1) {
      throw new Error(`Thứ tự bài học (lesson_order) "${rawLOrder}" tại bài học dòng ${idx + 2} không hợp lệ. Phải là số nguyên >= 1.`)
    }
    const lTitle = String(row['Tên bài học (lesson_title)'] ?? row['lesson_title'] ?? `Bài học ${mOrder}.${lOrder}`).trim()
    const videoFilename = String(row['Tên file video (video_filename)'] ?? row['video_filename'] ?? '').trim()

    const rawPreview = String(row['Học thử miễn phí (is_free_preview)'] ?? row['is_free_preview'] ?? 'FALSE').trim().toUpperCase()
    let isFree = false
    if (rawPreview === 'TRUE' || rawPreview === '1') {
      isFree = true
    } else if (rawPreview === 'FALSE' || rawPreview === '0') {
      isFree = false
    } else {
      throw new Error(`Cấu hình học thử (is_free_preview) "${rawPreview}" tại bài học dòng ${idx + 2} không hợp lệ theo chuẩn Backend. Giá trị hợp lệ: TRUE hoặc FALSE.`)
    }
    const lTheoryFile = String(
      row['File lý thuyết bài học (lesson_theory_file)'] ??
      row['Tài liệu bài học (lesson_theory_file)'] ??
      row['Tài liệu lý thuyết bài học (lesson_theory_file)'] ??
      row['Slide bài học (lesson_theory_file)'] ??
      row['lesson_theory_file'] ??
      findRowString(row, [
        'lesson_theory_file',
        'file lý thuyết bài học',
        'tài liệu bài học',
        'lý thuyết bài học',
        'slide bài học',
      ])
    ).trim()
    const lTheoryText = String(row['Tóm tắt lý thuyết bài học (lesson_theory_text)'] ?? row['lesson_theory_text'] ?? '').trim()

    const matchedVideo = videoFilename ? findMatchingFile(videoFilename, files) : undefined
    const matchedTheory = lTheoryFile ? findMatchingFile(lTheoryFile, files) : undefined
    const lessonKey = `m${mOrder}-l${lOrder}`
    const lessonId = `lesson-${lessonKey}-${idx + 1}`

    let durSec = 600
    let durMin = 10
    if (matchedVideo) {
      const readSec = await readVideoDuration(matchedVideo)
      if (readSec && readSec > 0) {
        durSec = readSec
        durMin = readSec >= 60 ? Math.round(readSec / 60) : Number((readSec / 60).toFixed(2))
      }
    }

    if (matchedTheory) {
      matchedPdfsCount++
      lessonTheoryFilesToUpload.push({ lessonId, lessonKey, moduleOrder: mOrder, lessonOrder: lOrder, file: matchedTheory })
    }

    if (matchedVideo) {
      matchedCount++
      videoFilesToUpload.push({
        lessonId,
        lessonKey,
        moduleOrder: mOrder,
        lessonOrder: lOrder,
        file: matchedVideo,
        durationSeconds: durSec,
        durationMinutes: durMin,
      })
    } else if (videoFilename) {
      missingCount++
    }

    matchedLessons.push({
      moduleOrder: mOrder,
      moduleTitle: mTitle,
      moduleDescription: mDesc,
      moduleTheoryFile: mTheory,
      modulePassingScore: mPassing,
      moduleDurationMinutes: mDuration,
      moduleSpeakingPrompt: mSpeakingPrompt || undefined,
      moduleWritingPrompt: mWritingPrompt || undefined,
      lessonOrder: lOrder,
      lessonTitle: lTitle,
      videoFilename,
      isFreePreview: isFree,
      lessonTheoryFile: lTheoryFile,
      lessonTheoryText: lTheoryText,
      matchedVideoFile: matchedVideo,
      matchedTheoryFile: matchedTheory,
      videoDurationSeconds: durSec,
      videoDurationMinutes: durMin,
    })

    if (!modulesMap.has(mOrder)) {
      modulesMap.set(mOrder, {
        title: mTitle,
        description: mDesc,
        theoryFile: mTheory,
        passingScore: mPassing,
        durationMinutes: mDuration,
        speakingPrompt: mSpeakingPrompt || undefined,
        writingPrompt: mWritingPrompt || undefined,
        lessons: [],
      })
    } else {
      const existingMod = modulesMap.get(mOrder)
      if (existingMod && !existingMod.theoryFile && mTheory) {
        existingMod.theoryFile = mTheory
      }
    }

    const lessonQuizzes = lessonQuizzesByModuleAndLesson.get(`${mOrder}-${lOrder}`) || []

    modulesMap.get(mOrder)!.lessons.push({
      id: lessonId,
      title: lTitle,
      video_url: '',
      duration_minutes: durMin,
      duration_seconds: durSec,
      content: lTheoryText,
      is_preview: isFree,
      lesson_order: lOrder,
      theory_file_name: matchedTheory?.name || lTheoryFile || undefined,
      theory_file_url: undefined,
      pending_video_name: matchedVideo ? matchedVideo.name : undefined,
      pending_theory_name: matchedTheory ? matchedTheory.name : undefined,
      questions: lessonQuizzes,
    })
  }

  const theoryFilesToUpload: { moduleOrder: number; file: File }[] = []
  const moduleAudioFilesToUpload: { moduleOrder: number; file: File }[] = []
  const moduleSpeakingFilesToUpload: { moduleOrder: number; file: File }[] = []

  const sortedModuleOrders = Array.from(modulesMap.keys()).sort((a, b) => a - b)
  const modules: CourseModule[] = sortedModuleOrders.map((mOrder, idx) => {
    const modData = modulesMap.get(mOrder)!
    const tests = chapterTestsByModule.get(mOrder) || []

    const matchedModulePdf = modData.theoryFile ? findMatchingFile(modData.theoryFile, files) : undefined

    if (matchedModulePdf) {
      matchedPdfsCount++
      theoryFilesToUpload.push({ moduleOrder: mOrder, file: matchedModulePdf })
    }

    const rawModAudio = `audio_test_chapter_${mOrder}.wav`
    const matchedModuleAudio = findMatchingFile(rawModAudio, files)

    if (matchedModuleAudio) {
      moduleAudioFilesToUpload.push({ moduleOrder: mOrder, file: matchedModuleAudio })
    }

    const rawModSpeaking = `speaking_sample_chapter_${mOrder}.wav`
    const matchedModuleSpeaking = findMatchingFile(rawModSpeaking, files)

    if (matchedModuleSpeaking) {
      moduleSpeakingFilesToUpload.push({ moduleOrder: mOrder, file: matchedModuleSpeaking })
    }

    return {
      id: `module-${mOrder}-${Date.now() + idx * 100}`,
      title: modData.title,
      description: modData.description,
      module_order: mOrder,
      theory_file_name: matchedModulePdf ? matchedModulePdf.name : (modData.theoryFile || undefined),
      pending_theory_name: matchedModulePdf ? matchedModulePdf.name : undefined,
      passing_score: modData.passingScore,
      challenge_passing_score: modData.passingScore,
      duration_minutes: modData.durationMinutes,
      challenge_duration_minutes: modData.durationMinutes,
      speaking_prompt: modData.speakingPrompt,
      writing_prompt: modData.writingPrompt,
      test_audio_url: matchedModuleAudio?.name || undefined,
      challenge_audio_url: matchedModuleAudio?.name || undefined,
      speaking_file_url: matchedModuleSpeaking?.name || undefined,
      test_questions: tests,
      challenge_questions: tests,
      lessons: modData.lessons,
    }
  })

  let totalChapterQuestions = 0
  chapterTestsByModule.forEach((qList) => {
    totalChapterQuestions += qList.length
  })

  let totalLessonQuizzes = 0
  lessonQuizzesByModuleAndLesson.forEach((qList) => {
    totalLessonQuizzes += qList.length
  })

  return {
    excelFileName: excelFile.name,
    courseInfo,
    modules,
    lessons: matchedLessons,
    totalModulesCount: modules.length,
    totalLessonsCount: matchedLessons.length,
    matchedVideosCount: matchedCount,
    missingVideosCount: missingCount,
    matchedPdfsCount,
    totalChapterQuestionsCount: totalChapterQuestions,
    totalLessonQuizzesCount: totalLessonQuizzes,
    totalFinalQuestionsCount: finalTestQuestions.length,
    videoFilesToUpload,
    theoryFilesToUpload,
    lessonTheoryFilesToUpload,
    courseDocumentFileToUpload: matchedCourseDocumentFile,
    courseThumbnailFileToUpload: matchedCourseThumbnailFile,
    finalTestAudioFileToUpload: matchedFinalTestAudioFile,
    finalTestSpeakingFileToUpload: matchedFinalTestSpeakingFile,
    moduleAudioFilesToUpload,
    moduleSpeakingFilesToUpload,
    questionMediaFilesToUpload,
  }
}
