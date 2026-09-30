// Khai báo các định nghĩa kiểu dữ liệu cho thực thể học viên và thống kê người học trong quản trị.
export interface User {
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  phone_number?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  target_toeic_score: number
  current_estimated_score: number
  placement_test_score?: number
  placement_listening_score?: number
  placement_reading_score?: number
  placement_skills_type?: string
  placement_tested_at?: string
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
