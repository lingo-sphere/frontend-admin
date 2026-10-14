/**
 * @file use.course.curriculum.ts
 * @description Hook quản lý trạng thái, thao tác thêm/xóa/sửa/sắp xếp chương học và bài học trong cây giáo trình khóa học
 */

import { useState } from 'react'
import type { CourseModule, CourseLesson, LessonQuestion } from '@/features/courses/components/course.basic.info.tab'
import type { ExamQuestionItem } from '@/features/courses/hooks/use.exam.question.editor'

interface UseCourseCurriculumProps {
  modules: CourseModule[]
  onChange: (modules: CourseModule[]) => void
}

export function useCourseCurriculum({ modules, onChange }: UseCourseCurriculumProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(modules.map((m) => m.id))

  const [studioModalState, setStudioModalState] = useState<{
    isOpen: boolean
    moduleId: string
    moduleTitle: string
    questions: ExamQuestionItem[]
    globalAudioUrl: string
  }>({
    isOpen: false,
    moduleId: '',
    moduleTitle: '',
    questions: [],
    globalAudioUrl: '',
  })

  const [lessonQuizModalState, setLessonQuizModalState] = useState<{
    isOpen: boolean
    moduleId: string
    lesson: CourseLesson | null
    chapterIndex: number
    lessonIndex: number
  }>({
    isOpen: false,
    moduleId: '',
    lesson: null,
    chapterIndex: 0,
    lessonIndex: 0,
  })

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
  const totalMinutes = modules.reduce(
    (acc, m) =>
      acc +
      (m.lessons || []).reduce((sum, l) => sum + (Number(l.duration_minutes) || 0), 0),
    0
  )
  const totalTests = modules.filter(
    (m) =>
      (m.test_questions && m.test_questions.length > 0) ||
      (m.post_mini_questions && m.post_mini_questions.length > 0)
  ).length

  const areAllExpanded = modules.length > 0 && expandedModules.length === modules.length

  const toggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedModules([])
    } else {
      setExpandedModules(modules.map((m) => m.id))
    }
  }

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  const addModule = () => {
    const now = Date.now()
    const newModuleId = `mod-${now}`
    const newModule: CourseModule = {
      id: newModuleId,
      title: '',
      description: '',
      module_order: modules.length + 1,
      created_at_timestamp: now,
      passing_score: 70,
      test_questions: [],
      challenge_passing_score: 70,
      challenge_questions: [],
      post_mini_passing_score: 70,
      post_mini_questions: [],
      lessons: [
        {
          id: `les-${now}`,
          title: '',
          video_url: '',
          duration_minutes: 0,
          content: '',
          is_preview: false,
          lesson_order: 1,
        },
      ],
    }
    onChange([...modules, newModule])
    setExpandedModules((prev) => [...prev, newModuleId])
  }

  const removeModule = (moduleId: string) => {
    onChange(modules.filter((m) => m.id !== moduleId))
  }

  const updateModule = (moduleId: string, updated: Partial<CourseModule>) => {
    onChange(modules.map((m) => (m.id === moduleId ? { ...m, ...updated } : m)))
  }

  const moveModuleUp = (index: number) => {
    if (index <= 0) return
    const updated = [...modules]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    updated.forEach((m, idx) => {
      m.module_order = idx + 1
    })
    onChange(updated)
  }

  const moveModuleDown = (index: number) => {
    if (index >= modules.length - 1) return
    const updated = [...modules]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    updated.forEach((m, idx) => {
      m.module_order = idx + 1
    })
    onChange(updated)
  }

  const addLesson = (moduleId: string) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        const newLesson: CourseLesson = {
          id: `les-${Date.now()}`,
          title: '',
          video_url: '',
          duration_minutes: 0,
          content: '',
          is_preview: false,
          lesson_order: m.lessons.length + 1,
        }
        return {
          ...m,
          lessons: [...m.lessons, newLesson],
        }
      })
    )
  }

  const removeLesson = (moduleId: string, lessonId: string) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        return {
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lessonId),
        }
      })
    )
  }

  const moveLessonUp = (moduleId: string, lessonIndex: number) => {
    if (lessonIndex <= 0) return
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        const updatedLessons = [...m.lessons]
        const temp = updatedLessons[lessonIndex]
        updatedLessons[lessonIndex] = updatedLessons[lessonIndex - 1]
        updatedLessons[lessonIndex - 1] = temp
        updatedLessons.forEach((l, idx) => {
          l.lesson_order = idx + 1
        })
        return { ...m, lessons: updatedLessons }
      })
    )
  }

  const moveLessonDown = (moduleId: string, lessonIndex: number) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        if (lessonIndex >= m.lessons.length - 1) return m
        const updatedLessons = [...m.lessons]
        const temp = updatedLessons[lessonIndex]
        updatedLessons[lessonIndex] = updatedLessons[lessonIndex + 1]
        updatedLessons[lessonIndex + 1] = temp
        updatedLessons.forEach((l, idx) => {
          l.lesson_order = idx + 1
        })
        return { ...m, lessons: updatedLessons }
      })
    )
  }

  const updateLessonField = (
    moduleId: string,
    lessonId: string,
    field: keyof CourseLesson,
    value: string | number | boolean
  ) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        return {
          ...m,
          lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l)),
        }
      })
    )
  }

  const updateLessonFields = (
    moduleId: string,
    lessonId: string,
    fields: Partial<CourseLesson>
  ) => {
    onChange(
      modules.map((m) => {
        if (m.id !== moduleId) return m
        return {
          ...m,
          lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...fields } : l)),
        }
      })
    )
  }

  const formatDurationDisplay = (seconds?: number, minutes?: number) => {
    if (typeof seconds === 'number' && seconds > 0) {
      if (seconds < 60) return `${seconds}s`
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return s > 0 ? `${m}p ${s}s` : `${m} phút`
    }
    if (typeof minutes === 'number' && minutes > 0) {
      if (minutes < 1) {
        const s = Math.round(minutes * 60)
        return `${s}s`
      }
      return `${minutes} phút`
    }
    return '0s'
  }

  const handleApplyQuestions = (
    moduleId: string,
    questions: ExamQuestionItem[],
    audioUrl?: string,
    meta?: { duration_minutes?: number }
  ) => {
    updateModule(moduleId, {
      test_questions: questions,
      challenge_questions: questions,
      post_mini_questions: questions,
      test_audio_url: audioUrl || '',
      challenge_audio_url: audioUrl || '',
      audio_url: audioUrl || '',
      ...(meta?.duration_minutes && meta.duration_minutes > 0
        ? {
            duration_minutes: meta.duration_minutes,
            challenge_duration_minutes: meta.duration_minutes,
            post_mini_duration_minutes: meta.duration_minutes,
          }
        : {}),
    })
  }

  const openLessonQuizStudio = (
    moduleId: string,
    lesson: CourseLesson,
    chapterIndex: number,
    lessonIndex: number
  ) => {
    setLessonQuizModalState({
      isOpen: true,
      moduleId,
      lesson,
      chapterIndex,
      lessonIndex,
    })
  }

  const closeLessonQuizStudio = () => {
    setLessonQuizModalState((prev) => ({ ...prev, isOpen: false, lesson: null }))
  }

  const handleSaveLessonQuestions = (
    moduleId: string,
    lessonId: string,
    questions: LessonQuestion[]
  ) => {
    updateLessonFields(moduleId, lessonId, { questions })
  }

  const scrollToChapter = (moduleId: string) => {
    if (!expandedModules.includes(moduleId)) {
      setExpandedModules((prev) => [...prev, moduleId])
    }
  }

  return {
    expandedModules,
    studioModalState,
    setStudioModalState,
    lessonQuizModalState,
    openLessonQuizStudio,
    closeLessonQuizStudio,
    handleSaveLessonQuestions,
    totalLessons,
    totalMinutes,
    totalTests,
    areAllExpanded,
    toggleExpandAll,
    toggleModuleExpand,
    addModule,
    removeModule,
    updateModule,
    moveModuleUp,
    moveModuleDown,
    addLesson,
    removeLesson,
    moveLessonUp,
    moveLessonDown,
    updateLessonField,
    updateLessonFields,
    formatDurationDisplay,
    handleApplyQuestions,
    scrollToChapter,
  }
}
