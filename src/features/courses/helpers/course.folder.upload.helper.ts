// Helper xu ly upload hang loat file video, tai lieu, audio tu thu muc khoa hoc len Cloudflare R2.

import type { CourseFormData, CourseModule } from '@/features/courses/components/course.basic.info.tab'
import type { VideoUploadTaskItem, LessonTheoryUploadTaskItem } from '@/features/courses/helpers/course.folder.import.helper'
import { readVideoDuration } from '@/features/courses/helpers/course.folder.import.helper'
import { mediaAdminService } from '@/features/media/services/media.service'

export interface PendingFolderUploads {
  videoFiles: VideoUploadTaskItem[]
  moduleTheoryFiles: { moduleOrder: number; file: File }[]
  lessonTheoryFiles: LessonTheoryUploadTaskItem[]
  courseDocumentFile?: File
  courseThumbnailFile?: File
  finalTestAudioFile?: File
  finalTestSpeakingFile?: File
  moduleAudioFiles: { moduleOrder: number; file: File }[]
  moduleSpeakingFiles: { moduleOrder: number; file: File }[]
  questionMediaFiles: {
    questionId: string
    file: File
    isChapterTest: boolean
    isFinalTest: boolean
    moduleOrder?: number
  }[]
}

export interface FolderUploadProgress {
  completedFiles: number
  totalFiles: number
  currentFileName: string
  percent: number
}

export async function uploadFolderResourcesToR2(
  pendingUploads: PendingFolderUploads,
  courseFolder: string,
  currentCourseInfo: Partial<CourseFormData>,
  currentModules: CourseModule[],
  onProgress?: (progress: FolderUploadProgress) => void
): Promise<{
  courseInfo: Partial<CourseFormData>
  modules: CourseModule[]
  allUploadedUrls: string[]
  failedCount: number
}> {
  const updatedCourseInfo: Partial<CourseFormData> = JSON.parse(JSON.stringify(currentCourseInfo))
  const updatedModules: CourseModule[] = JSON.parse(JSON.stringify(currentModules))

  const videoFiles = pendingUploads.videoFiles || []
  const moduleTheoryFiles = pendingUploads.moduleTheoryFiles || []
  const lessonTheoryFiles = pendingUploads.lessonTheoryFiles || []
  const courseDocFile = pendingUploads.courseDocumentFile
  const courseThumbFile = pendingUploads.courseThumbnailFile
  const finalTestAudioFile = pendingUploads.finalTestAudioFile
  const finalTestSpeakingFile = pendingUploads.finalTestSpeakingFile
  const moduleAudioFiles = pendingUploads.moduleAudioFiles || []
  const moduleSpeakingFiles = pendingUploads.moduleSpeakingFiles || []
  const questionMediaFiles = pendingUploads.questionMediaFiles || []

  const totalFiles =
    videoFiles.length +
    moduleTheoryFiles.length +
    lessonTheoryFiles.length +
    (courseDocFile ? 1 : 0) +
    (courseThumbFile ? 1 : 0) +
    (finalTestAudioFile ? 1 : 0) +
    (finalTestSpeakingFile ? 1 : 0) +
    moduleAudioFiles.length +
    moduleSpeakingFiles.length +
    questionMediaFiles.length

  if (totalFiles === 0) {
    return {
      courseInfo: updatedCourseInfo,
      modules: updatedModules,
      allUploadedUrls: [],
      failedCount: 0,
    }
  }

  let totalBytes = 0
  videoFiles.forEach((v) => { totalBytes += v.file.size })
  moduleTheoryFiles.forEach((m) => { totalBytes += m.file.size })
  lessonTheoryFiles.forEach((l) => { totalBytes += l.file.size })
  if (courseDocFile) totalBytes += courseDocFile.size
  if (courseThumbFile) totalBytes += courseThumbFile.size
  if (finalTestAudioFile) totalBytes += finalTestAudioFile.size
  if (finalTestSpeakingFile) totalBytes += finalTestSpeakingFile.size
  moduleAudioFiles.forEach((a) => { totalBytes += a.file.size })
  moduleSpeakingFiles.forEach((s) => { totalBytes += s.file.size })
  questionMediaFiles.forEach((q) => { totalBytes += q.file.size })

  const loadedBytesMap: Record<number, number> = {}
  let completedFiles = 0
  const allUploadedUrls: string[] = []

  const reportProgress = (fileIdx: number, loaded: number, name: string) => {
    loadedBytesMap[fileIdx] = loaded
    let currentTotalLoaded = 0
    Object.values(loadedBytesMap).forEach((val) => {
      currentTotalLoaded += val
    })
    const pct = totalBytes > 0 ? Math.min(100, Math.round((currentTotalLoaded * 100) / totalBytes)) : 100
    onProgress?.({
      completedFiles,
      totalFiles,
      currentFileName: name,
      percent: pct,
    })
  }

  let globalFileIndex = 0
  const tasks: (() => Promise<void>)[] = []

  if (courseThumbFile) {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, courseThumbFile.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        courseThumbFile,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, courseThumbFile.name)
        }
      )
      reportProgress(fIdx, courseThumbFile.size, courseThumbFile.name)
      if (uploadRes.file_url) {
        updatedCourseInfo.thumbnail_url = uploadRes.file_url
        allUploadedUrls.push(uploadRes.file_url)
      }
    })
  }

  if (courseDocFile) {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, courseDocFile.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        courseDocFile,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, courseDocFile.name)
        }
      )
      reportProgress(fIdx, courseDocFile.size, courseDocFile.name)
      if (uploadRes.file_url) {
        updatedCourseInfo.document_url = uploadRes.file_url
        updatedCourseInfo.document_name = courseDocFile.name
        allUploadedUrls.push(uploadRes.file_url)
      }
    })
  }

  if (finalTestAudioFile) {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, finalTestAudioFile.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        finalTestAudioFile,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, finalTestAudioFile.name)
        }
      )
      reportProgress(fIdx, finalTestAudioFile.size, finalTestAudioFile.name)
      if (uploadRes.file_url) {
        updatedCourseInfo.final_test_audio_url = uploadRes.file_url
        allUploadedUrls.push(uploadRes.file_url)
      }
    })
  }

  if (finalTestSpeakingFile) {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, finalTestSpeakingFile.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        finalTestSpeakingFile,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, finalTestSpeakingFile.name)
        }
      )
      reportProgress(fIdx, finalTestSpeakingFile.size, finalTestSpeakingFile.name)
      if (uploadRes.file_url) {
        updatedCourseInfo.final_test_speaking_file_url = uploadRes.file_url
        allUploadedUrls.push(uploadRes.file_url)
      }
    })
  }

  videoFiles.forEach((item) => {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, item.file.name)
      let durSec = item.durationSeconds || 0
      if (!durSec) {
        durSec = await readVideoDuration(item.file)
      }
      const durMin = durSec >= 60 ? Math.round(durSec / 60) : Number((durSec / 60).toFixed(2))

      const uploadRes = await mediaAdminService.uploadDirectR2(
        item.file,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, item.file.name)
        }
      )

      reportProgress(fIdx, item.file.size, item.file.name)

      if (uploadRes.file_url) {
        allUploadedUrls.push(uploadRes.file_url)
        for (const mod of updatedModules) {
          const targetLes = mod.lessons.find((l) => l.id === item.lessonId || (mod.module_order === item.moduleOrder && l.lesson_order === item.lessonOrder))
          if (targetLes) {
            targetLes.video_url = uploadRes.file_url
            targetLes.duration_seconds = durSec
            targetLes.duration_minutes = durMin
            delete targetLes.pending_video_name
            break
          }
        }
      }
    })
  })

  moduleTheoryFiles.forEach((item) => {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, item.file.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        item.file,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, item.file.name)
        }
      )
      reportProgress(fIdx, item.file.size, item.file.name)
      if (uploadRes.file_url) {
        allUploadedUrls.push(uploadRes.file_url)
        const targetMod = updatedModules.find((m) => m.module_order === item.moduleOrder)
        if (targetMod) {
          targetMod.theory_file_url = uploadRes.file_url
          targetMod.theory_file_name = item.file.name
          delete targetMod.pending_theory_name
        }
      }
    })
  })

  lessonTheoryFiles.forEach((item) => {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, item.file.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        item.file,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, item.file.name)
        }
      )
      reportProgress(fIdx, item.file.size, item.file.name)
      if (uploadRes.file_url) {
        allUploadedUrls.push(uploadRes.file_url)
        for (const mod of updatedModules) {
          const targetLes = mod.lessons.find((l) => l.id === item.lessonId || (mod.module_order === item.moduleOrder && l.lesson_order === item.lessonOrder))
          if (targetLes) {
            targetLes.theory_file_url = uploadRes.file_url
            targetLes.theory_file_name = item.file.name
            delete targetLes.pending_theory_name
            break
          }
        }
      }
    })
  })

  moduleAudioFiles.forEach((item) => {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, item.file.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        item.file,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, item.file.name)
        }
      )
      reportProgress(fIdx, item.file.size, item.file.name)
      if (uploadRes.file_url) {
        allUploadedUrls.push(uploadRes.file_url)
        const targetMod = updatedModules.find((m) => m.module_order === item.moduleOrder)
        if (targetMod) {
          targetMod.test_audio_url = uploadRes.file_url
          targetMod.challenge_audio_url = uploadRes.file_url
          targetMod.audio_url = uploadRes.file_url
        }
      }
    })
  })

  moduleSpeakingFiles.forEach((item) => {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, item.file.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        item.file,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, item.file.name)
        }
      )
      reportProgress(fIdx, item.file.size, item.file.name)
      if (uploadRes.file_url) {
        allUploadedUrls.push(uploadRes.file_url)
        const targetMod = updatedModules.find((m) => m.module_order === item.moduleOrder)
        if (targetMod) {
          targetMod.speaking_file_url = uploadRes.file_url
        }
      }
    })
  })

  questionMediaFiles.forEach((item) => {
    const fIdx = globalFileIndex++
    tasks.push(async () => {
      reportProgress(fIdx, 0, item.file.name)
      const uploadRes = await mediaAdminService.uploadDirectR2(
        item.file,
        courseFolder,
        (_percent, loaded) => {
          reportProgress(fIdx, loaded, item.file.name)
        }
      )
      reportProgress(fIdx, item.file.size, item.file.name)
      if (!uploadRes.file_url) return

      allUploadedUrls.push(uploadRes.file_url)
      const isAudio = /\.(wav|mp3|ogg|m4a)$/i.test(item.file.name)
      const isImage = /\.(jpe?g|png|webp|gif)$/i.test(item.file.name)

      if (item.isFinalTest) {
        const q = updatedCourseInfo.final_test_questions?.find((qu) => qu.id === item.questionId)
        if (q) {
          q.media_url = uploadRes.file_url
          if (isImage) q.image_url = uploadRes.file_url
          if (isAudio) q.audio_url = uploadRes.file_url
        }
      } else if (item.isChapterTest && item.moduleOrder !== undefined) {
        const targetMod = updatedModules.find((m) => m.module_order === item.moduleOrder)
        if (targetMod) {
          const q1 = targetMod.test_questions?.find((qu) => qu.id === item.questionId)
          if (q1) {
            q1.media_url = uploadRes.file_url
            if (isImage) q1.image_url = uploadRes.file_url
            if (isAudio) q1.audio_url = uploadRes.file_url
          }
          const q2 = targetMod.challenge_questions?.find((qu) => qu.id === item.questionId)
          if (q2) {
            q2.media_url = uploadRes.file_url
            if (isImage) q2.image_url = uploadRes.file_url
            if (isAudio) q2.audio_url = uploadRes.file_url
          }
        }
      }
    })
  })

  const queue = tasks.map((task) => task)
  const poolLimit = 3
  const poolConcurrency = Math.min(poolLimit, queue.length || 1)
  let failedCount = 0

  const workers = Array.from({ length: poolConcurrency }, async () => {
    while (queue.length > 0) {
      const task = queue.shift()
      if (!task) break
      try {
        await task()
      } catch (taskErr) {
        failedCount++
        console.error('[FolderUploadHelper] Task failed:', taskErr)
      } finally {
        completedFiles++
        onProgress?.({
          completedFiles,
          totalFiles,
          currentFileName: '',
          percent: totalBytes > 0 ? Math.min(100, Math.round((completedFiles * 100) / totalFiles)) : 100,
        })
      }
    }
  })

  await Promise.all(workers)

  return {
    courseInfo: updatedCourseInfo,
    modules: updatedModules,
    allUploadedUrls,
    failedCount,
  }
}
