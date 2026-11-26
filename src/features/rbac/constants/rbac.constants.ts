// Danh mục phân hệ module và nhãn hiển thị trực quan cho hệ thống phân quyền RBAC.

export const RBAC_MODULES = [
  'AUTH',
  'USERS',
  'COURSES',
  'EXAMS',
  'PRACTICE',
  'PRACTICE_LISTENING',
  'PRACTICE_READING',
  'PRACTICE_SPEAKING',
  'PRACTICE_WRITING',
  'PRACTICE_GRAMMAR',
  'PRACTICE_IPA',
  'VOCABULARY_ADMIN',
  'VOCABULARY',
  'AI_MANAGEMENT',
  'COMMUNITY',
  'NOTIFICATIONS',
  'MEDIA',
  'PROGRESS',
  'ROLES',
  'PERMISSIONS',
] as const

export type RbacModuleType = typeof RBAC_MODULES[number]

export const RBAC_MODULE_LABELS: Record<string, string> = {
  AUTH: 'Xác thực & Tài khoản (AUTH)',
  USERS: 'Người dùng & Học viên (USERS)',
  COURSES: 'Khóa học & Bài giảng (COURSES)',
  EXAMS: 'Khảo thí & Đề thi TOEIC (EXAMS)',
  PRACTICE: 'Luyện tập chung (PRACTICE)',
  PRACTICE_LISTENING: 'Luyện Nghe (PRACTICE_LISTENING)',
  PRACTICE_READING: 'Luyện Đọc (PRACTICE_READING)',
  PRACTICE_SPEAKING: 'Luyện Nói (PRACTICE_SPEAKING)',
  PRACTICE_WRITING: 'Luyện Viết (PRACTICE_WRITING)',
  PRACTICE_GRAMMAR: 'Ngữ pháp (PRACTICE_GRAMMAR)',
  PRACTICE_IPA: 'Ngữ âm & IPA (PRACTICE_IPA)',
  VOCABULARY_ADMIN: 'Quản trị Từ vựng (VOCABULARY_ADMIN)',
  VOCABULARY: 'Từ vựng & Flashcards (VOCABULARY)',
  AI_MANAGEMENT: 'Quản trị AI & Quota (AI_MANAGEMENT)',
  COMMUNITY: 'Cộng đồng & Kiểm duyệt (COMMUNITY)',
  NOTIFICATIONS: 'Thông báo & Marketing (NOTIFICATIONS)',
  MEDIA: 'Đa phương tiện (MEDIA)',
  PROGRESS: 'Tiến độ học tập (PROGRESS)',
  ROLES: 'Vai trò người dùng (ROLES)',
  PERMISSIONS: 'Quyền hạn API (PERMISSIONS)',
}
