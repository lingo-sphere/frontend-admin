export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone_number?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  date_of_birth?: string
  target_toeic_score: number
  current_estimated_score: number
  learning_goal_minutes_per_day: number
  bio?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  is_premium: boolean
  current_plan_slug?: string
  created_at: string

  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  gems: number

  lessons_completed: number
  vocabulary_reviewed: number
  practice_sessions: number
  exams_completed: number
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  premium: number
  free: number
  avgStreak: number
  avgLevel: number
}

export const genderLabels: Record<string, { vi: string; en: string }> = {
  MALE: { vi: 'Nam', en: 'Male' },
  FEMALE: { vi: 'Nữ', en: 'Female' },
  OTHER: { vi: 'Khác', en: 'Other' },
}

export const statusColors: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'var(--success-soft)', text: 'var(--success)' },
  INACTIVE: { bg: 'var(--warning-soft)', text: '#9a6d1a' },
  BANNED: { bg: 'rgba(201, 92, 89, 0.1)', text: 'var(--error)' },
}

export const planColors: Record<string, { bg: string; text: string }> = {
  free: { bg: 'var(--surface-subtle)', text: 'var(--text-tertiary)' },
  premium: { bg: 'var(--primary-soft)', text: 'var(--primary)' },
}

export const planLabels: Record<string, { vi: string; en: string }> = {
  free: { vi: 'Miễn phí', en: 'Free' },
  premium: { vi: 'Premium', en: 'Premium' },
}

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'leminh@gmail.com',
    full_name: 'Lê Minh',
    avatar_url: 'https://i.pravatar.cc/150?u=leminh',
    phone_number: '0912345678',
    gender: 'MALE',
    date_of_birth: '1998-05-15',
    target_toeic_score: 750,
    current_estimated_score: 620,
    learning_goal_minutes_per_day: 30,
    bio: 'Học tiếng Anh để đi làm',
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 15420,
    level: 12,
    current_streak: 45,
    longest_streak: 67,
    gems: 320,
    lessons_completed: 234,
    vocabulary_reviewed: 1850,
    practice_sessions: 89,
    exams_completed: 12,
  },
  {
    id: 'user-002',
    email: 'ngoctram@gmail.com',
    full_name: 'Ngọc Trâm',
    avatar_url: 'https://i.pravatar.cc/150?u=ngoctram',
    phone_number: '0923456789',
    gender: 'FEMALE',
    date_of_birth: '2000-08-22',
    target_toeic_score: 850,
    current_estimated_score: 720,
    learning_goal_minutes_per_day: 45,
    bio: 'Mục tiêu TOEIC 850+',
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 42800,
    level: 28,
    current_streak: 120,
    longest_streak: 180,
    gems: 890,
    lessons_completed: 512,
    vocabulary_reviewed: 4200,
    practice_sessions: 245,
    exams_completed: 35,
  },
  {
    id: 'user-003',
    email: 'phuchoang@gmail.com',
    full_name: 'Phúc Hoàng',
    avatar_url: 'https://i.pravatar.cc/150?u=phuchoang',
    phone_number: '0934567890',
    gender: 'MALE',
    date_of_birth: '1995-12-03',
    target_toeic_score: 650,
    current_estimated_score: 480,
    learning_goal_minutes_per_day: 20,
    status: 'ACTIVE',
    is_premium: false,
    current_plan_slug: 'free',
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 3200,
    level: 5,
    current_streak: 12,
    longest_streak: 15,
    gems: 45,
    lessons_completed: 67,
    vocabulary_reviewed: 420,
    practice_sessions: 23,
    exams_completed: 3,
  },
  {
    id: 'user-004',
    email: 'thuha@gmail.com',
    full_name: 'Thu Hà',
    avatar_url: 'https://i.pravatar.cc/150?u=thuha',
    gender: 'FEMALE',
    target_toeic_score: 750,
    current_estimated_score: 580,
    learning_goal_minutes_per_day: 30,
    bio: 'Học để xin việc',
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 18500,
    level: 14,
    current_streak: 56,
    longest_streak: 78,
    gems: 410,
    lessons_completed: 289,
    vocabulary_reviewed: 2100,
    practice_sessions: 112,
    exams_completed: 18,
  },
  {
    id: 'user-005',
    email: 'ductuan@gmail.com',
    full_name: 'Đức Tuấn',
    phone_number: '0945678901',
    gender: 'MALE',
    date_of_birth: '1999-03-18',
    target_toeic_score: 650,
    current_estimated_score: 350,
    learning_goal_minutes_per_day: 15,
    status: 'INACTIVE',
    is_premium: false,
    current_plan_slug: 'free',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 850,
    level: 2,
    current_streak: 0,
    longest_streak: 5,
    gems: 12,
    lessons_completed: 18,
    vocabulary_reviewed: 95,
    practice_sessions: 5,
    exams_completed: 0,
  },
  {
    id: 'user-006',
    email: 'minhanh@gmail.com',
    full_name: 'Minh Anh',
    avatar_url: 'https://i.pravatar.cc/150?u=minhanh',
    gender: 'FEMALE',
    target_toeic_score: 900,
    current_estimated_score: 780,
    learning_goal_minutes_per_day: 60,
    bio: 'IELTS 7.5 target',
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 62000,
    level: 42,
    current_streak: 200,
    longest_streak: 250,
    gems: 1500,
    lessons_completed: 780,
    vocabulary_reviewed: 6500,
    practice_sessions: 380,
    exams_completed: 48,
  },
  {
    id: 'user-007',
    email: 'quanghung@gmail.com',
    full_name: 'Quang Hùng',
    avatar_url: 'https://i.pravatar.cc/150?u=quanghung',
    gender: 'MALE',
    target_toeic_score: 550,
    current_estimated_score: 420,
    learning_goal_minutes_per_day: 20,
    status: 'BANNED',
    is_premium: false,
    current_plan_slug: 'free',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 450,
    level: 1,
    current_streak: 0,
    longest_streak: 3,
    gems: 5,
    lessons_completed: 12,
    vocabulary_reviewed: 50,
    practice_sessions: 3,
    exams_completed: 0,
  },
  {
    id: 'user-008',
    email: 'linhnguyen@gmail.com',
    full_name: 'Linh Nguyễn',
    avatar_url: 'https://i.pravatar.cc/150?u=linhnguyen',
    gender: 'FEMALE',
    target_toeic_score: 650,
    current_estimated_score: 510,
    learning_goal_minutes_per_day: 25,
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 6800,
    level: 8,
    current_streak: 28,
    longest_streak: 35,
    gems: 120,
    lessons_completed: 95,
    vocabulary_reviewed: 780,
    practice_sessions: 42,
    exams_completed: 8,
  },
  {
    id: 'user-009',
    email: 'thanhdat@gmail.com',
    full_name: 'Thanh Đạt',
    phone_number: '0956789012',
    gender: 'MALE',
    target_toeic_score: 750,
    current_estimated_score: 600,
    learning_goal_minutes_per_day: 30,
    status: 'ACTIVE',
    is_premium: false,
    current_plan_slug: 'free',
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 11200,
    level: 10,
    current_streak: 32,
    longest_streak: 45,
    gems: 200,
    lessons_completed: 156,
    vocabulary_reviewed: 1200,
    practice_sessions: 67,
    exams_completed: 10,
  },
  {
    id: 'user-010',
    email: 'tramnguyen@gmail.com',
    full_name: 'Trâm Nguyễn',
    avatar_url: 'https://i.pravatar.cc/150?u=tramnguyen',
    gender: 'FEMALE',
    target_toeic_score: 850,
    current_estimated_score: 680,
    learning_goal_minutes_per_day: 40,
    bio: 'Working professional',
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 24500,
    level: 18,
    current_streak: 67,
    longest_streak: 89,
    gems: 520,
    lessons_completed: 320,
    vocabulary_reviewed: 2800,
    practice_sessions: 145,
    exams_completed: 22,
  },
  {
    id: 'user-011',
    email: 'baolong@gmail.com',
    full_name: 'Bảo Long',
    avatar_url: 'https://i.pravatar.cc/150?u=baolong',
    gender: 'MALE',
    target_toeic_score: 600,
    current_estimated_score: 430,
    learning_goal_minutes_per_day: 20,
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 4100,
    level: 6,
    current_streak: 15,
    longest_streak: 20,
    gems: 88,
    lessons_completed: 72,
    vocabulary_reviewed: 560,
    practice_sessions: 28,
    exams_completed: 5,
  },
  {
    id: 'user-012',
    email: 'khatnhi@gmail.com',
    full_name: 'Khát Nhi',
    avatar_url: 'https://i.pravatar.cc/150?u=khatnhi',
    gender: 'FEMALE',
    target_toeic_score: 950,
    current_estimated_score: 840,
    learning_goal_minutes_per_day: 90,
    bio: 'Top learner',
    status: 'ACTIVE',
    is_premium: true,
    current_plan_slug: 'premium',
    created_at: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    total_xp: 88000,
    level: 55,
    current_streak: 310,
    longest_streak: 365,
    gems: 2800,
    lessons_completed: 1100,
    vocabulary_reviewed: 9200,
    practice_sessions: 520,
    exams_completed: 72,
  },
]

export function getUserStats(users: User[]): UserStats {
  const stats: UserStats = {
    total: users.length,
    active: 0,
    inactive: 0,
    premium: 0,
    free: 0,
    avgStreak: 0,
    avgLevel: 0,
  }

  let totalStreak = 0
  let totalLevel = 0

  users.forEach(user => {
    if (user.status === 'ACTIVE') stats.active++
    if (user.status === 'INACTIVE') stats.inactive++
    if (user.is_premium) stats.premium++
    else stats.free++
    totalStreak += user.current_streak
    totalLevel += user.level
  })

  stats.avgStreak = Math.round(totalStreak / users.length)
  stats.avgLevel = Math.round(totalLevel / users.length * 10) / 10

  return stats
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}
