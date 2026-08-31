export type AnalyticsTab = 'overview' | 'toeic' | 'ai' | 'logs'

export interface ProgressSummaryStats {
  totalUsers: number
  activeToday: number
  totalCourses: number
  totalVocab: number
  totalExams: number
  totalVip: number
}
