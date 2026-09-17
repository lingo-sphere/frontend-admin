// Helper xu ly doc file Excel va khop noi video cung tai lieu PDF va anh thumbnail phuc vu tao nhanh khoa hoc.

import * as XLSX from 'xlsx'
import type { CourseFormData, CourseModule, CourseLesson, LessonQuestion } from '@/features/courses/components/course.basic.info.tab'
import type { QuizQuestionItem } from '@/features/courses/schemas/course.schema'
import { generateSlug } from '@/features/courses/helpers/course.helper'

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
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase()
    for (const kw of fieldKeywords) {
      if (lowerKey.includes(kw.toLowerCase())) {
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
    const fRelPath = f.webkitRelativePath ? f.webkitRelativePath.toLowerCase() : ''
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

  const title = String(findValue(infoRaw, ['title', 'tên khóa học']) || excelFile.name.replace(/\.[^/.]+$/, '').replace(/^\d+_/, '').replace(/_/g, ' ')).trim()
  const rawSlug = String(findValue(infoRaw, ['slug', 'đường dẫn rút gọn']) || '').trim()
  const slug = rawSlug ? generateSlug(rawSlug) : generateSlug(title)
  const rawCategory = String(findValue(infoRaw, ['category', 'thể loại']) || 'TOEIC_2_SKILLS').trim()
  const category = rawCategory.includes('4') ? 'TOEIC_4_SKILLS' : 'TOEIC_2_SKILLS'
  const rawLevel = String(findValue(infoRaw, ['level', 'trình độ']) || 'BEGINNER').trim().toUpperCase()
  const level = rawLevel === 'INTERMEDIATE' || rawLevel === 'ADVANCED' ? rawLevel : 'BEGINNER'
  const target_score = Number(findValue(infoRaw, ['target_score', 'mục tiêu']) || 500)
  const price = Number(findValue(infoRaw, ['price', 'giá gốc']) || 0)
  const discount_price = Number(findValue(infoRaw, ['discount_price', 'giá khuyến mãi']) || 0)
  const author_name = String(findValue(infoRaw, ['author_name', 'tên giảng viên']) || 'Đội ngũ Giảng viên LingoSphere').trim()
  const author_title = String(findValue(infoRaw, ['author_title', 'chức danh']) || 'Giảng viên chuyên môn').trim()
  const author_email = String(findValue(infoRaw, ['author_email', 'email giảng viên']) || '').trim()
  const author_bio = String(findValue(infoRaw, ['author_bio', 'tiểu sử giảng viên']) || '').trim()
  const description = String(findValue(infoRaw, ['description', 'mô tả']) || `Khóa học ${title} chất lượng cao chuẩn quốc tế trên LingoSphere.`).trim()
  const final_test_passing_score = Number(findValue(infoRaw, ['final_test_passing_score', 'điểm đạt kiểm tra cuối khóa', 'cuối khóa']) || 70)
  const final_test_duration_minutes = Number(findValue(infoRaw, ['final_test_duration_minutes', 'thời lượng thi tốt nghiệp', 'thời lượng kiểm tra cuối khóa']) || 60)
  const final_test_speaking_prompt = String(findValue(infoRaw, ['final_test_speaking_prompt', 'đề thi nói cuối khóa']) || '').trim()
  const final_test_writing_prompt = String(findValue(infoRaw, ['final_test_writing_prompt', 'đề thi viết cuối khóa']) || '').trim()
  const rawIsPublished = String(findValue(infoRaw, ['is_published', 'xuất bản']) || 'TRUE').toUpperCase()
  const is_published = rawIsPublished !== 'FALSE'

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
    const rawAnswer = String(row['Đáp án đúng (correct_answer)'] ?? row['correct_answer'] ?? row['Đáp án'] ?? 'A').trim().toUpperCase()
    const correct_answer = ['A', 'B', 'C', 'D'].includes(rawAnswer) ? rawAnswer : 'A'
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

    finalTestQuestions.push({
      id: qId,
      question_text: qText,
      options,
      correct_answer,
      explanation,
      order_index: ftIdx + 1,
      media_url: mediaFilename || undefined,
    })
  })

  const courseInfo: Partial<CourseFormData> = {
    title,
    slug,
    category,
    level,
    target_score: isNaN(target_score) ? 500 : target_score,
    price: isNaN(price) ? 0 : price,
    discount_price: isNaN(discount_price) ? 0 : discount_price,
    author_name,
    author_title,
    author_email: author_email || undefined,
    author_bio: author_bio || undefined,
    description,
    final_test_passing_score: isNaN(final_test_passing_score) ? 70 : final_test_passing_score,
    final_test_duration_minutes: isNaN(final_test_duration_minutes) ? 60 : final_test_duration_minutes,
    final_test_speaking_prompt: final_test_speaking_prompt || undefined,
    final_test_writing_prompt: final_test_writing_prompt || undefined,
    final_test_questions: finalTestQuestions,
    is_published,
    document_name,
  }

  const chapterTestsByModule = new Map<number, QuizQuestionItem[]>()
  chapterTestsRaw.forEach((row, qIdx) => {
    const mOrder = Number(row['Thứ tự chương (module_order)'] ?? row['module_order'] ?? row['Chương'] ?? 1)
    const qText = String(row['Câu hỏi trắc nghiệm (question_text)'] ?? row['question_text'] ?? row['Câu hỏi'] ?? '').trim()
    if (!qText) return
    const optA = String(row['Đáp án A (option_a)'] ?? row['option_a'] ?? row['A'] ?? '').trim()
    const optB = String(row['Đáp án B (option_b)'] ?? row['option_b'] ?? row['B'] ?? '').trim()
    const optC = String(row['Đáp án C (option_c)'] ?? row['option_c'] ?? row['C'] ?? '').trim()
    const optD = String(row['Đáp án D (option_d)'] ?? row['option_d'] ?? row['D'] ?? '').trim()
    const options = [optA, optB, optC, optD].filter(Boolean)
    const rawAnswer = String(row['Đáp án đúng (correct_answer)'] ?? row['correct_answer'] ?? row['Đáp án'] ?? 'A').trim().toUpperCase()
    const correct_answer = ['A', 'B', 'C', 'D'].includes(rawAnswer) ? rawAnswer : 'A'
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

    const item: QuizQuestionItem = {
      id: qId,
      question_text: qText,
      options,
      correct_answer,
      explanation,
      order_index: (chapterTestsByModule.get(mOrder)?.length || 0) + 1,
      media_url: mediaFilename || undefined,
    }

    if (!chapterTestsByModule.has(mOrder)) {
      chapterTestsByModule.set(mOrder, [])
    }
    chapterTestsByModule.get(mOrder)!.push(item)
  })

  const lessonQuizzesByModuleAndLesson = new Map<string, LessonQuestion[]>()
  lessonQuizzesRaw.forEach((row, lqIdx) => {
    const mOrder = Number(row['Thứ tự chương (module_order)'] ?? row['module_order'] ?? 1)
    const lOrder = Number(row['Thứ tự bài học (lesson_order)'] ?? row['lesson_order'] ?? 1)
    const key = `${mOrder}-${lOrder}`
    const qText = String(row['Câu hỏi ôn tập (question_text)'] ?? row['question_text'] ?? '').trim()
    if (!qText) return
    const optA = String(row['Đáp án A (option_a)'] ?? row['option_a'] ?? '').trim()
    const optB = String(row['Đáp án B (option_b)'] ?? row['option_b'] ?? '').trim()
    const optC = String(row['Đáp án C (option_c)'] ?? row['option_c'] ?? '').trim()
    const optD = String(row['Đáp án D (option_d)'] ?? row['option_d'] ?? '').trim()
    const options = [optA, optB, optC, optD].filter(Boolean)
    const rawAnswer = String(row['Đáp án đúng (correct_answer)'] ?? row['correct_answer'] ?? 'A').trim().toUpperCase()
    const correct_answer = ['A', 'B', 'C', 'D'].includes(rawAnswer) ? rawAnswer : 'A'
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
    const mOrder = Number(row['Thứ tự chương (module_order)'] ?? row['module_order'] ?? 1)
    const mTitle = String(row['Tên chương (module_title)'] ?? row['module_title'] ?? `Chương ${mOrder}`).trim()
    const mDesc = String(row['Mô tả chương (module_description)'] ?? row['module_description'] ?? '').trim()
    const mTheory = findRowString(row, ['module_theory_file', 'tài liệu chương', 'tài liệu lý thuyết', 'theory_file', 'tài liệu'])
    const mPassing = Number(row['Điểm đạt test chương (module_passing_score)'] ?? row['module_passing_score'] ?? 70)
    const mDuration = Number(row['Thời lượng test chương (module_test_duration_minutes)'] ?? row['module_test_duration_minutes'] ?? (category === 'TOEIC_4_SKILLS' ? 20 : 15))
    const mSpeakingPrompt = findRowString(row, ['module_speaking_prompt', 'đề kiểm tra nói'])
    const mWritingPrompt = findRowString(row, ['module_writing_prompt', 'đề kiểm tra viết'])

    const lOrder = Number(row['Thứ tự bài học (lesson_order)'] ?? row['lesson_order'] ?? idx + 1)
    const lTitle = String(row['Tên bài học (lesson_title)'] ?? row['lesson_title'] ?? `Bài học ${mOrder}.${lOrder}`).trim()
    const videoFilename = String(row['Tên file video (video_filename)'] ?? row['video_filename'] ?? '').trim()
    const rawPreview = String(row['Học thử miễn phí (is_free_preview)'] ?? row['is_free_preview'] ?? 'FALSE').toUpperCase()
    const isFree = rawPreview === 'TRUE' || rawPreview === '1'
    const lTheoryFile = findRowString(row, ['lesson_theory_file', 'file lý thuyết bài học', 'lý thuyết bài học', 'tài liệu bài học', 'theory'])
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
      modulePassingScore: isNaN(mPassing) ? 70 : mPassing,
      moduleDurationMinutes: isNaN(mDuration) ? 15 : mDuration,
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
        passingScore: isNaN(mPassing) ? 70 : mPassing,
        durationMinutes: isNaN(mDuration) ? 15 : mDuration,
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
      theory_file_name: matchedModulePdf?.name || modData.theoryFile || undefined,
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
