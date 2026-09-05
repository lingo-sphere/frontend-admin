/**
 * @file statistics.data.ts
 * @description Định nghĩa các kiểu dữ liệu và cấu hình bộ lọc cho hệ thống thống kê Admin
 */

export interface TimeFilterOption {
  id: string
  labelVi: string
  labelEn: string
  days: number
}

export const timeFilterOptions: TimeFilterOption[] = [
  { id: '7d', labelVi: '7 ngày qua', labelEn: 'Last 7 days', days: 7 },
  { id: '14d', labelVi: '14 ngày qua', labelEn: 'Last 14 days', days: 14 },
  { id: '30d', labelVi: '30 ngày qua', labelEn: 'Last 30 days', days: 30 },
  { id: '90d', labelVi: '90 ngày qua', labelEn: 'Last 90 days', days: 90 },
  { id: 'custom', labelVi: 'Tùy chỉnh', labelEn: 'Custom', days: 0 },
]

export interface DBEntityMetric {
  id: string
  serviceName: string
  labelVi: string
  labelEn: string
  count: number
  changePercent: number
  unit: string
  iconName: string
  color: string
}

export const dbEntityMetrics: DBEntityMetric[] = []

export interface ActivityDayPoint {
  date: string
  label: string
  activeUsers: number
  lessonsCompleted: number
  vocabPracticed: number
  toeicTestsSubmitted: number
  aiEvaluations: number
}

export const activityTimeSeriesData: ActivityDayPoint[] = []

export interface GamificationStats {
  totalXpDistributed: number
  avgUserStreak: number
  longestStreakEver: number
  activeStreakToday: number
  totalGemsDistributed: number
  totalBadgesEarned: number
  topLeagues: { name: string; userCount: number }[]
}

export const gamificationStats: GamificationStats = {
  totalXpDistributed: 0,
  avgUserStreak: 0,
  longestStreakEver: 0,
  activeStreakToday: 0,
  totalGemsDistributed: 0,
  totalBadgesEarned: 0,
  topLeagues: [],
}

export interface SkillPerformance {
  skillId: string
  skillNameVi: string
  skillNameEn: string
  avgScore: number
  passingRatePercent: number
  totalAttempts: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  changePercent: number
}

export const skillPerformanceData: SkillPerformance[] = []

export interface TOEICPartStat {
  partNumber: number
  partNameVi: string
  skill: 'LISTENING' | 'READING'
  totalQuestionsBank: number
  avgAccuracyPercent: number
  difficultyScore: number
}

export const toeicPartStats: TOEICPartStat[] = []

export interface TOEICScoreOverview {
  avgTotalScore: number
  avgListeningScore: number
  avgReadingScore: number
  highestScore: number
  targetDistribution: { band: string; percentage: number }[]
}

export const toeicScoreOverview: TOEICScoreOverview = {
  avgTotalScore: 0,
  avgListeningScore: 0,
  avgReadingScore: 0,
  highestScore: 0,
  targetDistribution: [],
}

export interface AIModelUsage {
  id: string
  modelName: string
  provider: 'OPENAI' | 'GEMINI' | 'ANTHROPIC' | 'LOCAL' | string
  purpose: string
  totalRequests: number
  avgResponseTimeMs: number
  estimatedCostUSD: number
  successRatePercent: number
  status: 'ACTIVE' | 'STANDBY' | 'DEPRECATED'
}

export const aiModelUsageList: AIModelUsage[] = []

export interface AIEvaluationCategory {
  id: string
  type: string
  labelVi: string
  totalEvaluations: number
  pendingCount: number
  avgScore: number
  avgProcessingTimeMs: number
  costUSD: number
  helpfulRatingPercent: number
}

export const aiEvaluationCategories: AIEvaluationCategory[] = []

export interface AIRecommendationStats {
  totalGenerated: number
  acceptedCount: number
  completedCount: number
  dismissedCount: number
  acceptanceRatePercent: number
  topRecommendationTypes: { type: string; labelVi: string; count: number }[]
}

export const aiRecommendationStats: AIRecommendationStats = {
  totalGenerated: 0,
  acceptedCount: 0,
  completedCount: 0,
  dismissedCount: 0,
  acceptanceRatePercent: 0,
  topRecommendationTypes: [],
}

export interface AIEvaluationLogItem {
  id: string
  userName: string
  userEmail: string
  planType: 'FREE' | 'PREMIUM'
  sourceService: 'PRACTICE' | 'EXAM' | 'VOCABULARY'
  evaluationType: 'SPEAKING' | 'WRITING' | 'LISTENING' | 'VOCABULARY' | 'GRAMMAR' | 'TOEIC_ANALYSIS' | 'PRONUNCIATION'
  score: string
  tokensUsed: number
  processingTimeMs: number
  costUSD: number
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED'
  feedbackType?: 'HELPFUL' | 'NOT_HELPFUL'
  rating?: number
  createdAt: string
}

export interface UserActivityLog {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  actionType: 'LESSON_COMPLETED' | 'TOEIC_TEST' | 'VOCAB_STUDY' | 'AI_CHAT' | 'PREMIUM_UPGRADE' | string
  actionNameVi: string
  actionNameEn: string
  detail: string
  platform: 'Web' | 'iOS' | 'Android' | string
  scoreOrXP?: string
  status?: 'SUCCESS' | 'IN_PROGRESS' | 'COMPLETED' | string
  timestamp: string | Date
}
