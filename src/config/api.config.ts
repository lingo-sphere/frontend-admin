export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 30000,
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'lingosphere_access_token',
    REFRESH_TOKEN: 'lingosphere_refresh_token',
    USER: 'lingosphere_admin_user',
    THEME: 'lingosphere-admin-theme',
  },
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH_TOKEN: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      CHANGE_PASSWORD: (userId: string) => `/auth/change-password/${userId}`,
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    // Users & Gamification & Subscriptions
    USERS: {
      ADMIN_USERS: '/users/admin/users',
      ADMIN_ANALYTICS: '/users/admin/analytics/overview',
      UPDATE_STATUS: (userId: string) => `/users/admin/${userId}/status`,
      PROFILE: '/users/profile',
      PROFILE_BY_ID: (userId: string) => `/users/profile/${userId}`,
      SETTINGS: '/users/settings',
      GAMIFICATION: '/users/gamification',
      LEADERBOARD: '/users/gamification/leaderboard',
      XP_LOGS: '/users/gamification/xp-logs',
      ACHIEVEMENTS: '/users/achievements',
      SUBSCRIPTION_PLANS: '/users/subscriptions/plans',
      MY_SUBSCRIPTION: '/users/subscriptions/my',
      SUBSCRIPTION_HISTORY: '/users/subscriptions/history',
    },
    // Roles & RBAC
    ROLES: {
      LIST: '/roles',
      BY_ID: (id: string) => `/roles/${id}`,
      ASSIGN: (userId: string) => `/roles/assign/${userId}`,
      SEED_DEFAULT: '/roles/seed-default',
    },
    PERMISSIONS: {
      LIST: '/permissions',
      BY_ID: (id: string) => `/permissions/${id}`,
    },
    // Courses
    COURSES: {
      LIST: '/courses',
      BY_ID: (id: string) => `/courses/${id}`,
      CURRICULUM: (id: string) => `/courses/${id}/curriculum`,
      APPROVAL_STATUS: (id: string) => `/courses/${id}/approval-status`,
      TEACHER_COURSES: '/courses/teacher/my-courses',
      MODULES: (courseId: string) => `/courses/${courseId}/modules`,
      DELETE_MODULE: (moduleId: string) => `/courses/modules/${moduleId}`,
      LESSONS: (courseId: string, moduleId: string) => `/courses/${courseId}/modules/${moduleId}/lessons`,
      LESSON_BY_ID: (lessonId: string) => `/courses/lessons/${lessonId}`,
      LESSON_QUESTIONS: (lessonId: string) => `/courses/lessons/${lessonId}/questions`,
      QUESTION_BY_ID: (questionId: string) => `/courses/questions/${questionId}`,
    },
    // Vocabulary
    VOCABULARY: {
      SEARCH: '/vocabulary/lexical-items/search',
      BY_ID: (id: string) => `/vocabulary/lexical-items/${id}`,
      CREATE: '/vocabulary/lexical-items',
      TOPICS: '/vocabulary/topics',
      TOPIC_BY_ID: (id: string) => `/vocabulary/topics/${id}`,
      IPA_SYMBOLS: '/vocabulary/ipa-symbols',
      IPA_BY_ID: (id: string) => `/vocabulary/ipa-symbols/${id}`,
      GRAMMAR_POINTS: '/vocabulary/grammar-points',
      GRAMMAR_BY_ID: (id: string) => `/vocabulary/grammar-points/${id}`,
      DECKS: '/vocabulary/flashcards/decks',
      PUBLIC_DECKS: '/vocabulary/flashcards/decks/public/explore',
      DECK_BY_ID: (id: string) => `/vocabulary/flashcards/decks/${id}`,
      ADD_CARD: (deckId: string) => `/vocabulary/flashcards/decks/${deckId}/cards`,
    },
    // Practice & Tests
    PRACTICE: {
      SETS: '/practice/sets',
      SET_BY_ID: (id: string) => `/practice/sets/${id}`,
      SET_QUESTIONS: (setId: string) => `/practice/sets/${setId}/questions`,
      QUESTIONS: '/practice/questions',
      LISTENING: '/practice/listening/exercises',
      LISTENING_BY_ID: (id: string) => `/practice/listening/exercises/${id}`,
      LISTENING_SEGMENTS: '/practice/listening/segments',
      SPEAKING: '/practice/speaking/exercises',
      SPEAKING_BY_ID: (id: string) => `/practice/speaking/exercises/${id}`,
      WRITING: '/practice/writing/exercises',
      WRITING_BY_ID: (id: string) => `/practice/writing/exercises/${id}`,
      JOURNAL_PROMPT: '/practice/writing/journal/daily-prompt',
    },
    // TOEIC Exams
    EXAMS: {
      LIST: '/exams',
      BY_ID: (id: string) => `/exams/${id}`,
      PARTS: '/exams/parts',
      PASSAGES: '/exams/passages',
      QUESTIONS: '/exams/questions',
      ADD_QUESTIONS: (id: string) => `/exams/${id}/questions`,
    },
    // Notifications
    NOTIFICATIONS: {
      MY: '/notifications/my',
      CREATE: '/notifications',
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: '/notifications/my/read-all',
      PREFERENCES: '/notifications/preferences/my',
      TEMPLATES: '/notifications/templates',
      CAMPAIGNS: '/notifications/campaigns',
      CRON_DAILY_REMINDERS: '/notifications/cron/run-daily-reminders',
    },
    // Media & Cloudflare R2
    MEDIA: {
      UPLOAD: '/media/upload',
      PRESIGNED_URL: '/media/presigned-url',
      FILE_BY_ID: (id: string) => `/media/files/${id}`,
      STORAGE_USAGE: '/media/storage-usage',
      COLLECTIONS: '/media/collections',
      COLLECTION_BY_ID: (id: string) => `/media/collections/${id}`,
    },
    // AI Services
    AI: {
      MODELS: '/ai/models',
      PROMPTS: '/ai/prompts',
      GENERATE: '/ai/generate',
      TEACHER_GENERATE_QUIZ: '/ai/teacher/generate-quiz',
    },
    // Progress
    PROGRESS: {
      MY_COURSES: '/progress/courses',
      STUDENTS: (courseId: string) => `/progress/teacher/courses/${courseId}/students`,
      GROWTH_CHART: (courseId: string) => `/progress/courses/${courseId}/growth-chart`,
    },
  },
}
