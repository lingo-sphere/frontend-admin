/**
 * @file statistics.data.ts
 * @description Mã nguồn thành phần statistics-data.ts
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

export const dbEntityMetrics: DBEntityMetric[] = [
  {
    id: 'users',
    serviceName: 'User Service DB',
    labelVi: 'Tổng người dùng hệ thống',
    labelEn: 'Total Registered Users',
    count: 12480,
    changePercent: 12.5,
    unit: 'người dùng',
    iconName: 'Users',
    color: '#2f7f78',
  },
  {
    id: 'subscriptions',
    serviceName: 'User Service DB',
    labelVi: 'Tài khoản Premium đang hoạt động',
    labelEn: 'Active Premium Subscribers',
    count: 3850,
    changePercent: 18.2,
    unit: 'tài khoản',
    iconName: 'Crown',
    color: '#d97706',
  },
  {
    id: 'vocabulary',
    serviceName: 'Vocabulary Service DB',
    labelVi: 'Từ vựng & Thẻ Flashcard',
    labelEn: 'Lexical Items & Flashcards',
    count: 48500,
    changePercent: 8.4,
    unit: 'mục từ',
    iconName: 'BookOpen',
    color: '#2563eb',
  },
  {
    id: 'toeic_questions',
    serviceName: 'Exam Service DB',
    labelVi: 'Ngân hàng đề TOEIC',
    labelEn: 'TOEIC Exam Bank',
    count: 81,
    changePercent: 14.1,
    unit: 'bộ đề (200 câu/đề)',
    iconName: 'FileCheck',
    color: '#7c3aed',
  },
  {
    id: 'ai_evaluations',
    serviceName: 'AI Service DB',
    labelVi: 'Đánh giá AI (Speaking/Writing)',
    labelEn: 'AI Evaluations Logged',
    count: 84250,
    changePercent: 24.6,
    unit: 'lượt đánh giá',
    iconName: 'Sparkles',
    color: '#9333ea',
  },
  {
    id: 'rag_vectors',
    serviceName: 'AI Service DB (Qdrant)',
    labelVi: 'RAG Vector Embeddings',
    labelEn: 'RAG Vector Embeddings',
    count: 142000,
    changePercent: 31.0,
    unit: 'vectors',
    iconName: 'Database',
    color: '#059669',
  },
]

export interface ActivityDayPoint {
  dateStr: string
  dayLabel: string
  dau: number
  sessions: number
  minutesSpent: number
  xpGained: number
  newUsers: number
}

export const activityTimeSeriesData: ActivityDayPoint[] = [
  { dateStr: '2026-08-10', dayLabel: '10/08', dau: 2450, sessions: 5120, minutesSpent: 128000, xpGained: 450000, newUsers: 120 },
  { dateStr: '2026-08-11', dayLabel: '11/08', dau: 2610, sessions: 5480, minutesSpent: 135000, xpGained: 482000, newUsers: 145 },
  { dateStr: '2026-08-12', dayLabel: '12/08', dau: 2580, sessions: 5320, minutesSpent: 131000, xpGained: 468000, newUsers: 130 },
  { dateStr: '2026-08-13', dayLabel: '13/08', dau: 2790, sessions: 5900, minutesSpent: 146000, xpGained: 520000, newUsers: 160 },
  { dateStr: '2026-08-14', dayLabel: '14/08', dau: 2950, sessions: 6300, minutesSpent: 154000, xpGained: 560000, newUsers: 185 },
  { dateStr: '2026-08-15', dayLabel: '15/08', dau: 3120, sessions: 6750, minutesSpent: 168000, xpGained: 610000, newUsers: 210 },
  { dateStr: '2026-08-16', dayLabel: '16/08', dau: 3050, sessions: 6540, minutesSpent: 162000, xpGained: 590000, newUsers: 195 },
  { dateStr: '2026-08-17', dayLabel: '17/08', dau: 2880, sessions: 6100, minutesSpent: 150000, xpGained: 540000, newUsers: 165 },
  { dateStr: '2026-08-18', dayLabel: '18/08', dau: 2980, sessions: 6380, minutesSpent: 158000, xpGained: 575000, newUsers: 175 },
  { dateStr: '2026-08-19', dayLabel: '19/08', dau: 3150, sessions: 6820, minutesSpent: 171000, xpGained: 625000, newUsers: 220 },
  { dateStr: '2026-08-20', dayLabel: '20/08', dau: 3340, sessions: 7200, minutesSpent: 182000, xpGained: 670000, newUsers: 240 },
  { dateStr: '2026-08-21', dayLabel: '21/08', dau: 3420, sessions: 7450, minutesSpent: 189000, xpGained: 695000, newUsers: 260 },
  { dateStr: '2026-08-22', dayLabel: '22/08', dau: 3580, sessions: 7890, minutesSpent: 198000, xpGained: 730000, newUsers: 285 },
  { dateStr: '2026-08-23', dayLabel: 'Hôm nay', dau: 3690, sessions: 8120, minutesSpent: 205000, xpGained: 760000, newUsers: 310 },
]

export interface GamificationStats {
  averageStreak: number
  longestStreakRecord: number
  activeStreakUsersPercent: number
  levelDistribution: { range: string; count: number; percent: number }[]
  deviceDistribution: { device: string; labelVi: string; count: number; percent: number }[]
}

export const gamificationStats: GamificationStats = {
  averageStreak: 18.5,
  longestStreakRecord: 365,
  activeStreakUsersPercent: 78.4,
  levelDistribution: [
    { range: 'Level 1 - 5 (Beginner)', count: 3250, percent: 26.0 },
    { range: 'Level 6 - 15 (Intermediate)', count: 5120, percent: 41.0 },
    { range: 'Level 16 - 30 (Advanced)', count: 2890, percent: 23.2 },
    { range: 'Level 31+ (Master)', count: 1220, percent: 9.8 },
  ],
  deviceDistribution: [
    { device: 'MOBILE_IOS', labelVi: 'iOS App', count: 5490, percent: 44.0 },
    { device: 'MOBILE_ANDROID', labelVi: 'Android App', count: 4860, percent: 39.0 },
    { device: 'WEB_DESKTOP', labelVi: 'Website Admin/Web', count: 2130, percent: 17.0 },
  ],
}

export interface SkillPerformance {
  skillId: string
  skillNameVi: string
  skillNameEn: string
  attemptsCount: number
  avgAccuracyPercent: number
  avgTimeSpentMin: number
  difficultyDistribution: { level: string; percent: number }[]
  statusColor: string
}

export const skillPerformanceData: SkillPerformance[] = [
  {
    skillId: 'listening',
    skillNameVi: 'Luyện Nghe (Listening & Dictation)',
    skillNameEn: 'Listening & Dictation',
    attemptsCount: 38400,
    avgAccuracyPercent: 79.5,
    avgTimeSpentMin: 18,
    difficultyDistribution: [{ level: 'Easy', percent: 35 }, { level: 'Medium', percent: 48 }, { level: 'Hard', percent: 17 }],
    statusColor: '#2f7f78',
  },
  {
    skillId: 'speaking',
    skillNameVi: 'Luyện Nói (Speaking AI Evaluated)',
    skillNameEn: 'Speaking Practice',
    attemptsCount: 22100,
    avgAccuracyPercent: 74.2,
    avgTimeSpentMin: 14,
    difficultyDistribution: [{ level: 'Easy', percent: 28 }, { level: 'Medium', percent: 52 }, { level: 'Hard', percent: 20 }],
    statusColor: '#8a68a8',
  },
  {
    skillId: 'writing',
    skillNameVi: 'Luyện Viết (Writing AI Evaluated)',
    skillNameEn: 'Writing Practice',
    attemptsCount: 16500,
    avgAccuracyPercent: 72.8,
    avgTimeSpentMin: 22,
    difficultyDistribution: [{ level: 'Easy', percent: 20 }, { level: 'Medium', percent: 55 }, { level: 'Hard', percent: 25 }],
    statusColor: '#3b82f6',
  },
  {
    skillId: 'reading',
    skillNameVi: 'Đọc hiểu & Ngữ pháp (Reading)',
    skillNameEn: 'Reading Comprehension',
    attemptsCount: 42000,
    avgAccuracyPercent: 82.1,
    avgTimeSpentMin: 16,
    difficultyDistribution: [{ level: 'Easy', percent: 40 }, { level: 'Medium', percent: 45 }, { level: 'Hard', percent: 15 }],
    statusColor: '#10b981',
  },
  {
    skillId: 'vocabulary',
    skillNameVi: 'Thẻ Từ Vựng Spaced Repetition (SRS)',
    skillNameEn: 'Vocabulary Flashcards SRS',
    attemptsCount: 125000,
    avgAccuracyPercent: 86.4,
    avgTimeSpentMin: 12,
    difficultyDistribution: [{ level: 'New', percent: 15 }, { level: 'Learning', percent: 35 }, { level: 'Mastered', percent: 50 }],
    statusColor: '#f59e0b',
  },
]

export interface TOEICPartStat {
  partNumber: number
  partNameVi: string
  section: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING'
  totalQuestionsAttempted: number
  avgAccuracyPercent: number
  weakTopicCount: number
}

export const toeicPartStats: TOEICPartStat[] = [
  { partNumber: 1, partNameVi: 'Part 1: Photographs', section: 'LISTENING', totalQuestionsAttempted: 14500, avgAccuracyPercent: 88.5, weakTopicCount: 2 },
  { partNumber: 2, partNameVi: 'Part 2: Question - Response', section: 'LISTENING', totalQuestionsAttempted: 22800, avgAccuracyPercent: 81.2, weakTopicCount: 5 },
  { partNumber: 3, partNameVi: 'Part 3: Conversations', section: 'LISTENING', totalQuestionsAttempted: 31200, avgAccuracyPercent: 75.4, weakTopicCount: 8 },
  { partNumber: 4, partNameVi: 'Part 4: Short Talks', section: 'LISTENING', totalQuestionsAttempted: 28400, avgAccuracyPercent: 73.1, weakTopicCount: 9 },
  { partNumber: 5, partNameVi: 'Part 5: Incomplete Sentences', section: 'READING', totalQuestionsAttempted: 45000, avgAccuracyPercent: 78.6, weakTopicCount: 12 },
  { partNumber: 6, partNameVi: 'Part 6: Text Completion', section: 'READING', totalQuestionsAttempted: 26000, avgAccuracyPercent: 74.8, weakTopicCount: 7 },
  { partNumber: 7, partNameVi: 'Part 7: Reading Comprehension', section: 'READING', totalQuestionsAttempted: 38500, avgAccuracyPercent: 68.2, weakTopicCount: 15 },
  { partNumber: 8, partNameVi: 'Part 8: Read Aloud & Describe Picture', section: 'SPEAKING', totalQuestionsAttempted: 12400, avgAccuracyPercent: 79.5, weakTopicCount: 4 },
  { partNumber: 9, partNameVi: 'Part 9: Respond to Questions & Express Opinion', section: 'SPEAKING', totalQuestionsAttempted: 9800, avgAccuracyPercent: 71.2, weakTopicCount: 6 },
  { partNumber: 10, partNameVi: 'Part 10: Write Sentences & Respond Email', section: 'WRITING', totalQuestionsAttempted: 11200, avgAccuracyPercent: 76.0, weakTopicCount: 5 },
  { partNumber: 11, partNameVi: 'Part 11: Write Opinion Essay', section: 'WRITING', totalQuestionsAttempted: 8400, avgAccuracyPercent: 69.4, weakTopicCount: 7 },
]

export interface TOEICScoreOverview {
  averageTotalScore: number
  averageListeningScore: number
  averageReadingScore: number
  highestScoreRecord: number
  totalExams: number
  totalExamAttempts: number
  scoreDistribution: { range: string; count: number; percent: number }[]
}

export const toeicScoreOverview: TOEICScoreOverview = {
  averageTotalScore: 655,
  averageListeningScore: 350,
  averageReadingScore: 305,
  highestScoreRecord: 985,
  totalExams: 8420,
  totalExamAttempts: 8420,
  scoreDistribution: [
    { range: '0 - 450 (Elementary)', count: 980, percent: 11.6 },
    { range: '455 - 650 (Intermediate)', count: 3540, percent: 42.0 },
    { range: '655 - 785 (Upper Inter)', count: 2620, percent: 31.1 },
    { range: '790 - 990 (Advanced)', count: 1280, percent: 15.3 },
  ],
}

export interface AIModelUsage {
  id: string
  modelName: string
  provider: string
  capabilities: string[]
  totalRequests: number
  inputTokens: number
  outputTokens: number
  costUSD: number
  costVND: number
  avgLatencyMs: number
  successRatePercent: number
  isPrimary: boolean
}

export const aiModelUsageList: AIModelUsage[] = [
  {
    id: 'gemini-3.6-flash',
    modelName: 'Gemini 3.6 Flash',
    provider: 'Google AI',
    capabilities: ['TEXT', 'SPEECH', 'VISION', 'MULTIMODAL'],
    totalRequests: 142500,
    inputTokens: 28450000,
    outputTokens: 9820000,
    costUSD: 42.50,
    costVND: 1083750,
    avgLatencyMs: 240,
    successRatePercent: 99.8,
    isPrimary: true,
  },
  {
    id: 'gemini-3.1-pro',
    modelName: 'Gemini 3.1 Pro',
    provider: 'Google AI',
    capabilities: ['TEXT', 'REASONING', 'COMPLEX_EVAL'],
    totalRequests: 32100,
    inputTokens: 14200000,
    outputTokens: 6450000,
    costUSD: 68.20,
    costVND: 1739100,
    avgLatencyMs: 510,
    successRatePercent: 99.4,
    isPrimary: false,
  },
  {
    id: 'whisper-stt-v3',
    modelName: 'Whisper Audio STT',
    provider: 'OpenAI / Custom API',
    capabilities: ['SPEECH_TO_TEXT', 'PHONEME_ALIGN'],
    totalRequests: 28400,
    inputTokens: 8500000,
    outputTokens: 2100000,
    costUSD: 34.10,
    costVND: 869550,
    avgLatencyMs: 420,
    successRatePercent: 99.1,
    isPrimary: false,
  },
]

export interface AIEvaluationCategory {
  category: string
  labelVi: string
  totalEvaluations: number
  pendingCount: number
  avgScore: number
  avgProcessingTimeMs: number
  costUSD: number
  helpfulRatingPercent: number
}

export const aiEvaluationCategories: AIEvaluationCategory[] = [
  {
    category: 'SPEAKING',
    labelVi: 'Đánh giá Phát âm & Fluency (Speaking AI)',
    totalEvaluations: 34200,
    pendingCount: 18,
    avgScore: 4.1,
    avgProcessingTimeMs: 450,
    costUSD: 48.60,
    helpfulRatingPercent: 94.2,
  },
  {
    category: 'WRITING',
    labelVi: 'Chấm bài Viết (Task Achievement & Grammar AI)',
    totalEvaluations: 24800,
    pendingCount: 24,
    avgScore: 3.9,
    avgProcessingTimeMs: 820,
    costUSD: 62.40,
    helpfulRatingPercent: 91.8,
  },
  {
    category: 'LISTENING_BLANK',
    labelVi: 'Chấm Nghe chép chính tả (Dictation AI)',
    totalEvaluations: 18500,
    pendingCount: 5,
    avgScore: 4.4,
    avgProcessingTimeMs: 180,
    costUSD: 18.20,
    helpfulRatingPercent: 96.5,
  },
  {
    category: 'VOCABULARY',
    labelVi: 'Đánh giá Phản xạ Từ vựng (SRS AI)',
    totalEvaluations: 41200,
    pendingCount: 12,
    avgScore: 4.6,
    avgProcessingTimeMs: 120,
    costUSD: 24.50,
    helpfulRatingPercent: 97.8,
  },
  {
    category: 'GRAMMAR',
    labelVi: 'Chẩn đoán Cấu trúc & Ngữ pháp (Grammar AI)',
    totalEvaluations: 29600,
    pendingCount: 15,
    avgScore: 4.3,
    avgProcessingTimeMs: 310,
    costUSD: 31.80,
    helpfulRatingPercent: 95.1,
  },
  {
    category: 'TOEIC_ANALYSIS',
    labelVi: 'Phân tích điểm yếu TOEIC (Diagnostic AI)',
    totalEvaluations: 16750,
    pendingCount: 2,
    avgScore: 4.7,
    avgProcessingTimeMs: 610,
    costUSD: 35.60,
    helpfulRatingPercent: 98.4,
  },
  {
    category: 'PRONUNCIATION',
    labelVi: 'Phân tích Trọng âm & Âm tiết (Phoneme STT)',
    totalEvaluations: 22100,
    pendingCount: 8,
    avgScore: 4.2,
    avgProcessingTimeMs: 290,
    costUSD: 21.40,
    helpfulRatingPercent: 93.6,
  },
]

export interface AIRecommendationStats {
  totalGenerated: number
  acceptedCount: number
  completedCount: number
  dismissedCount: number
  acceptanceRatePercent: number
  topRecommendationTypes: { type: string; labelVi: string; count: number }[]
}

export const aiRecommendationStats: AIRecommendationStats = {
  totalGenerated: 42100,
  acceptedCount: 32900,
  completedCount: 28400,
  dismissedCount: 9200,
  acceptanceRatePercent: 78.15,
  topRecommendationTypes: [
    { type: 'VOCABULARY', labelVi: 'Từ vựng cần ôn lại', count: 16500 },
    { type: 'GRAMMAR', labelVi: 'Củng cố điểm ngữ pháp yếu', count: 11200 },
    { type: 'TOEIC_PART', labelVi: 'Luyện tập Part thi yếu', count: 8400 },
    { type: 'SPEAKING_PRACTICE', labelVi: 'Luyện phát âm từ khó', count: 6000 },
  ],
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
