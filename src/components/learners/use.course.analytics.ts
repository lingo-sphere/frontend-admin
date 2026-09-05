/**
 * @file use.course.analytics.ts
 * @description Custom hook tính toán các chỉ số phân tích học tập, tỷ lệ rơi rụng (drop-off) và dữ liệu phễu từng chương học
 */

import { useMemo } from 'react'
import type { StudentProgressItem } from '@/services/progress.service'

export interface CourseSimple {
  id: string
  title: string
  thumbnail_url?: string
  author_id?: string
  students_count?: number
}

export interface AnalyticsSummary {
  totalEnrolled: number
  completedCount: number
  completionRate: number
  inProgressCount: number
  dropOffRate: number
  avgProgress: number
  avgBaseline: number
  avgFinalScore: number
  avgGrowth: number
  finalPassRate: number
  finalExamTakers: number
}

export interface ChapterFunnelItem {
  order: number
  title: string
  reachedCount: number
  completedCount: number
  retentionRate: number
  dropOffFromPrev: number
  avgScore: number
  isHighDropOff: boolean
}

export function useCourseAnalytics(
  allStudentsProgress: StudentProgressItem[],
  courses: CourseSimple[],
  selectedCourseId: string
) {
  const currentStudents = useMemo(() => {
    if (selectedCourseId === 'ALL') return allStudentsProgress
    return allStudentsProgress.filter(
      (st) =>
        st.course_id === selectedCourseId ||
        st.course_title === courses.find((c) => c.id === selectedCourseId)?.title
    )
  }, [allStudentsProgress, selectedCourseId, courses])

  const analyticsSummary: AnalyticsSummary = useMemo(() => {
    const totalEnrolled = currentStudents.length
    if (totalEnrolled === 0) {
      return {
        totalEnrolled: 0,
        completedCount: 0,
        completionRate: 0,
        inProgressCount: 0,
        dropOffRate: 0,
        avgProgress: 0,
        avgBaseline: 0,
        avgFinalScore: 0,
        avgGrowth: 0,
        finalPassRate: 0,
        finalExamTakers: 0,
      }
    }

    const completed = currentStudents.filter((s) => (s.progress_percentage || 0) >= 100).length
    const inProgress = currentStudents.filter(
      (s) => (s.progress_percentage || 0) > 0 && (s.progress_percentage || 0) < 100
    ).length
    const barelyStarted = currentStudents.filter((s) => (s.progress_percentage || 0) <= 15).length

    const completionRate = Math.round((completed / totalEnrolled) * 100)
    const dropOffRate = Math.round((barelyStarted / totalEnrolled) * 100)
    const avgProgress = Math.round(
      currentStudents.reduce((acc, s) => acc + (s.progress_percentage || 0), 0) / totalEnrolled
    )

    const baselineStudents = currentStudents.filter(
      (s) => s.baseline_score !== undefined && s.baseline_score > 0
    )
    const avgBaseline = baselineStudents.length
      ? Math.round(
          baselineStudents.reduce((acc, s) => acc + (s.baseline_score || 0), 0) /
            baselineStudents.length
        )
      : 0

    const finalStudents = currentStudents.filter(
      (s) => s.final_test_score !== undefined && s.final_test_score > 0
    )
    const avgFinalScore = finalStudents.length
      ? Math.round(
          finalStudents.reduce((acc, s) => acc + (s.final_test_score || 0), 0) /
            finalStudents.length
        )
      : 0

    const passedFinal = finalStudents.filter((s) => (s.final_test_score || 0) >= 70).length
    const finalPassRate = finalStudents.length
      ? Math.round((passedFinal / finalStudents.length) * 100)
      : 0

    const growthList = currentStudents
      .map(
        (s) =>
          s.total_score_growth ??
          (s.final_test_score && s.baseline_score ? s.final_test_score - s.baseline_score : null)
      )
      .filter((g): g is number => g !== null)
    const avgGrowth = growthList.length
      ? Math.round(growthList.reduce((acc, g) => acc + g, 0) / growthList.length)
      : 0

    return {
      totalEnrolled,
      completedCount: completed,
      completionRate,
      inProgressCount: inProgress,
      dropOffRate,
      avgProgress,
      avgBaseline,
      avgFinalScore,
      avgGrowth,
      finalPassRate,
      finalExamTakers: finalStudents.length,
    }
  }, [currentStudents])

  const chapterFunnel: ChapterFunnelItem[] = useMemo(() => {
    if (currentStudents.length === 0) return []

    const moduleMap = new Map<
      number,
      {
        order: number
        title: string
        totalReached: number
        completedCount: number
        scores: number[]
      }
    >()

    for (let i = 1; i <= 4; i++) {
      moduleMap.set(i, {
        order: i,
        title: `Chương ${i}`,
        totalReached: 0,
        completedCount: 0,
        scores: [],
      })
    }

    currentStudents.forEach((st) => {
      const progress = st.progress_percentage || 0
      const mods = st.modules_progress || []

      if (mods.length > 0) {
        mods.forEach((m, idx) => {
          const ord = m.order_index || idx + 1
          let entry = moduleMap.get(ord)
          if (!entry) {
            entry = {
              order: ord,
              title: m.title || `Chương ${ord}`,
              totalReached: 0,
              completedCount: 0,
              scores: [],
            }
            moduleMap.set(ord, entry)
          }

          const score =
            typeof m.challenge_score === 'number' && m.challenge_score >= 0
              ? m.challenge_score
              : typeof m.post_mini_score === 'number' && m.post_mini_score >= 0
              ? m.post_mini_score
              : m.best_score

          if (score !== undefined && score >= 0) {
            entry.scores.push(score)
          }

          if (
            m.status === 'COMPLETED' ||
            m.status === 'SKIPPED_BY_CHALLENGE' ||
            (score !== undefined && score >= 70)
          ) {
            entry.completedCount += 1
            entry.totalReached += 1
          } else if (m.status === 'IN_PROGRESS' || (score !== undefined && score > 0)) {
            entry.totalReached += 1
          }
        })
      } else {
        const reachedUpTo = Math.max(1, Math.min(4, Math.ceil((progress / 100) * 4)))
        for (let i = 1; i <= 4; i++) {
          const entry = moduleMap.get(i)!
          if (i <= reachedUpTo) {
            entry.totalReached += 1
            if (i < reachedUpTo || progress >= 100) {
              entry.completedCount += 1
              entry.scores.push(Math.min(100, 65 + i * 7))
            }
          }
        }
      }
    })

    const totalStudents = currentStudents.length
    const sorted = Array.from(moduleMap.values()).sort((a, b) => a.order - b.order)

    return sorted.map((ch, idx, arr) => {
      const reachedCount = Math.max(ch.totalReached, ch.completedCount)
      const retentionRate = Math.round((reachedCount / Math.max(1, totalStudents)) * 100)
      const prevReached =
        idx > 0
          ? Math.max(arr[idx - 1].totalReached, arr[idx - 1].completedCount)
          : totalStudents
      const dropOffFromPrev =
        prevReached > 0
          ? Math.max(0, Math.round(((prevReached - reachedCount) / prevReached) * 100))
          : 0
      const avgScore = ch.scores.length
        ? Math.round(ch.scores.reduce((a, b) => a + b, 0) / ch.scores.length)
        : 75

      return {
        order: ch.order,
        title: ch.title,
        reachedCount,
        completedCount: ch.completedCount,
        retentionRate,
        dropOffFromPrev,
        avgScore,
        isHighDropOff: dropOffFromPrev >= 20 || avgScore < 65,
      }
    })
  }, [currentStudents])

  const worstChapter = useMemo(() => {
    if (chapterFunnel.length === 0) return null
    return [...chapterFunnel].sort((a, b) => b.dropOffFromPrev - a.dropOffFromPrev)[0]
  }, [chapterFunnel])

  return {
    currentStudents,
    analyticsSummary,
    chapterFunnel,
    worstChapter,
  }
}
