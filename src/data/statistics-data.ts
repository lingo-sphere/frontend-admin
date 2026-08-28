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
  planType: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS'
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

export const mockAIEvaluationLogs: AIEvaluationLogItem[] = [
  {
    id: 'eval-101',
    userName: 'Lê Minh',
    userEmail: 'leminh@gmail.com',
    planType: 'PREMIUM',
    sourceService: 'PRACTICE',
    evaluationType: 'SPEAKING',
    score: '4.5 / 5.0 (Fluency 88%)',
    tokensUsed: 420,
    processingTimeMs: 380,
    costUSD: 0.0012,
    status: 'COMPLETED',
    feedbackType: 'HELPFUL',
    rating: 5,
    createdAt: '2 phút trước',
  },
  {
    id: 'eval-102',
    userName: 'Ngọc Trâm',
    userEmail: 'ngoctram@gmail.com',
    planType: 'PREMIUM_PLUS',
    sourceService: 'PRACTICE',
    evaluationType: 'WRITING',
    score: '8.0 / 9.0 (IELTS Band 7.5)',
    tokensUsed: 1240,
    processingTimeMs: 790,
    costUSD: 0.0035,
    status: 'COMPLETED',
    feedbackType: 'HELPFUL',
    rating: 5,
    createdAt: '8 phút trước',
  },
  {
    id: 'eval-103',
    userName: 'Phúc Hoàng',
    userEmail: 'phuchoang@gmail.com',
    planType: 'FREE',
    sourceService: 'EXAM',
    evaluationType: 'TOEIC_ANALYSIS',
    score: 'Gợi ý Part 3 & 7',
    tokensUsed: 850,
    processingTimeMs: 540,
    costUSD: 0.0021,
    status: 'COMPLETED',
    feedbackType: 'HELPFUL',
    rating: 4,
    createdAt: '15 phút trước',
  },
  {
    id: 'eval-104',
    userName: 'Thu Hà',
    userEmail: 'thuha@gmail.com',
    planType: 'PREMIUM',
    sourceService: 'PRACTICE',
    evaluationType: 'LISTENING',
    score: 'Đúng 24 / 25 từ',
    tokensUsed: 210,
    processingTimeMs: 190,
    costUSD: 0.0006,
    status: 'COMPLETED',
    feedbackType: 'HELPFUL',
    rating: 5,
    createdAt: '22 phút trước',
  },
  {
    id: 'eval-105',
    userName: 'Minh Anh',
    userEmail: 'minhanh@gmail.com',
    planType: 'PREMIUM_PLUS',
    sourceService: 'PRACTICE',
    evaluationType: 'VOCABULARY',
    score: 'Mastered (SRS Interval 30d)',
    tokensUsed: 140,
    processingTimeMs: 110,
    costUSD: 0.0004,
    status: 'COMPLETED',
    feedbackType: 'HELPFUL',
    rating: 5,
    createdAt: '31 phút trước',
  },
  {
    id: 'eval-106',
    userName: 'Đức Trí',
    userEmail: 'ductri@gmail.com',
    planType: 'PREMIUM',
    sourceService: 'PRACTICE',
    evaluationType: 'GRAMMAR',
    score: 'Khắc phục Relative Clauses',
    tokensUsed: 380,
    processingTimeMs: 290,
    costUSD: 0.0011,
    status: 'COMPLETED',
    feedbackType: 'HELPFUL',
    rating: 5,
    createdAt: '45 phút trước',
  },
  {
    id: 'eval-107',
    userName: 'Thanh Hằng',
    userEmail: 'thanhhang@gmail.com',
    planType: 'PREMIUM_PLUS',
    sourceService: 'PRACTICE',
    evaluationType: 'PRONUNCIATION',
    score: 'Accuracy 92.5% (/θ/ sound)',
    tokensUsed: 310,
    processingTimeMs: 270,
    costUSD: 0.0009,
    status: 'COMPLETED',
    feedbackType: 'HELPFUL',
    rating: 4,
    createdAt: '52 phút trước',
  },
]

export interface UserActivityLog {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  actionType: 'LESSON_COMPLETED' | 'TOEIC_TEST' | 'VOCAB_STUDY' | 'AI_CHAT' | 'PREMIUM_UPGRADE'
  actionNameVi: string
  actionNameEn: string
  detail: string
  platform: 'Web' | 'iOS' | 'Android'
  scoreOrXP: string
  status: 'SUCCESS' | 'IN_PROGRESS' | 'COMPLETED'
  timestamp: string
}

export const recentUserActivityLogs: UserActivityLog[] = [
  {
    id: 'act-001',
    userId: 'usr-101',
    userName: 'Nguyễn Văn An',
    userEmail: 'an.nguyen@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    actionType: 'TOEIC_TEST',
    actionNameVi: 'Làm đề thi TOEIC Full Test 04',
    actionNameEn: 'Completed TOEIC Full Test 04',
    detail: 'Đạt 850/990 điểm (Nghe 440, Đọc 410)',
    platform: 'Web',
    scoreOrXP: '+120 XP',
    status: 'COMPLETED',
    timestamp: '10 phút trước',
  },
  {
    id: 'act-002',
    userId: 'usr-102',
    userName: 'Trần Thị Bích',
    userEmail: 'bich.tran@yahoo.com',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    actionType: 'VOCAB_STUDY',
    actionNameVi: 'Ôn tập bộ thẻ Từ vựng TOEIC 600',
    actionNameEn: 'Reviewed TOEIC 600 Flashcards',
    detail: 'Hoàn thành 30 từ với kỹ thuật SRS',
    platform: 'iOS',
    scoreOrXP: '+45 XP',
    status: 'COMPLETED',
    timestamp: '25 phút trước',
  },
  {
    id: 'act-003',
    userId: 'usr-103',
    userName: 'Lê Minh Cường',
    userEmail: 'cuong.le@outlook.com',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    actionType: 'AI_CHAT',
    actionNameVi: 'Luyện nói với Trợ lý AI Lingobot',
    actionNameEn: 'Speaking Practice with AI Assistant',
    detail: 'Chủ đề: Job Interview Preparation (Cấp độ B2)',
    platform: 'Android',
    scoreOrXP: '+80 XP',
    status: 'COMPLETED',
    timestamp: '40 phút trước',
  },
  {
    id: 'act-004',
    userId: 'usr-104',
    userName: 'Phạm Thu Hà',
    userEmail: 'ha.pham@hotmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    actionType: 'PREMIUM_UPGRADE',
    actionNameVi: 'Nâng cấp Gói dịch vụ Premium 1 Năm',
    actionNameEn: 'Upgraded to 1-Year Premium Plan',
    detail: 'Giao dịch thành công qua VNPay',
    platform: 'Web',
    scoreOrXP: 'Premium VIP',
    status: 'SUCCESS',
    timestamp: '1 giờ trước',
  },
  {
    id: 'act-005',
    userId: 'usr-001',
    userName: 'Vân Anh',
    userEmail: 'vananh@email.com',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    actionType: 'LESSON_COMPLETED',
    actionNameVi: 'Hoàn thành Bài 05: Business Email Writing',
    actionNameEn: 'Completed Lesson 05: Business Email Writing',
    detail: 'Đạt 95% độ chính xác bài kiểm tra',
    platform: 'Web',
    scoreOrXP: '+60 XP',
    status: 'COMPLETED',
    timestamp: '2 giờ trước',
  },
  {
    id: 'act-006',
    userId: 'usr-106',
    userName: 'Vũ Thị Ngọc',
    userEmail: 'ngoc.vu@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    actionType: 'TOEIC_TEST',
    actionNameVi: 'Luyện nghe TOEIC Part 1 - 100 câu',
    actionNameEn: 'Practiced TOEIC Listening Part 1',
    detail: 'Đạt 90/100 câu đúng',
    platform: 'iOS',
    scoreOrXP: '+75 XP',
    status: 'COMPLETED',
    timestamp: '3 giờ trước',
  },
  {
    id: 'act-007',
    userId: 'usr-107',
    userName: 'Đặng Đình Khoa',
    userEmail: 'khoa.dang@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    actionType: 'VOCAB_STUDY',
    actionNameVi: 'Học bộ từ vựng Chuyên ngành Marketing',
    actionNameEn: 'Studied Marketing Vocabulary Deck',
    detail: 'Học 20 từ mới',
    platform: 'Android',
    scoreOrXP: '+30 XP',
    status: 'COMPLETED',
    timestamp: '4 giờ trước',
  },
  {
    id: 'act-008',
    userId: 'usr-108',
    userName: 'Bùi Bảo Anh',
    userEmail: 'baoanh.bui@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    actionType: 'AI_CHAT',
    actionNameVi: 'Sửa bài viết Writing với AI feedback',
    actionNameEn: 'Writing Correction with AI',
    detail: 'Đánh giá AI: Band 7.5 (Cải thiện Grammar)',
    platform: 'Web',
    scoreOrXP: '+50 XP',
    status: 'COMPLETED',
    timestamp: '5 giờ trước',
  },
  {
    id: 'act-009',
    userId: 'usr-109',
    userName: 'Phan Như Quỳnh',
    userEmail: 'quynh.phan@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    actionType: 'LESSON_COMPLETED',
    actionNameVi: 'Hoàn thành Khóa học TOEIC 500+ cấp tốc',
    actionNameEn: 'Completed TOEIC 500+ Intensive Course',
    detail: 'Nhận chứng nhận hoàn thành khóa học',
    platform: 'Web',
    scoreOrXP: '+300 XP',
    status: 'COMPLETED',
    timestamp: '6 giờ trước',
  },
  {
    id: 'act-010',
    userId: 'usr-110',
    userName: 'Ngô Thanh Sơn',
    userEmail: 'son.ngo@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    actionType: 'TOEIC_TEST',
    actionNameVi: 'Luyện đọc TOEIC Part 7 - Reading Comprehension',
    actionNameEn: 'Practiced TOEIC Reading Part 7',
    detail: 'Đạt 45/54 câu đúng',
    platform: 'Android',
    scoreOrXP: '+55 XP',
    status: 'COMPLETED',
    timestamp: '8 giờ trước',
  },
]
