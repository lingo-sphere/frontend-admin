/**
 * @file users.data.ts
 * @description Mã nguồn thành phần users-data.ts
 */

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
