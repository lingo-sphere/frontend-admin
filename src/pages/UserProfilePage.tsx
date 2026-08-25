// Updated: 2026-08-22
// User Profile Page - Chi tiết người dùng
// Đồng bộ với user.dbml - user_profiles, user_gamifications

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Mail,
  Calendar,
  Crown,
  Flame,
  Star,
  Trophy,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { mockUsers } from '@/data/users-data'

interface UserProfileData {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  phone?: string
  status: string
  is_premium: boolean
  created_at: string
  last_active: string
  // Gamification
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  total_lessons_completed: number
  total_words_learned: number
  toeic_score?: number
  accuracy_rate: number
  avg_session_time: number
  total_sessions: number
  // Stats
  total_courses_enrolled: number
  total_courses_completed: number
  total_decks_studied: number
  total_reviews: number
}

export function UserProfilePage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  const userId = activeNavItem.includes(':') ? activeNavItem.split(':')[1] : mockUsers[0]?.id
  const user = mockUsers.find(u => u.id === userId) || mockUsers[0]

  const [profileData, setProfileData] = useState<UserProfileData | null>(null)

  useEffect(() => {
    if (user) {
      // Mock full profile data
      setProfileData({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        phone: user.phone,
        status: user.status,
        is_premium: user.is_premium,
        created_at: user.created_at,
        last_active: user.last_active,
        total_xp: user.total_xp,
        level: user.level,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        total_lessons_completed: user.total_lessons_completed,
        total_words_learned: user.total_words_learned,
        toeic_score: user.toeic_score,
        accuracy_rate: 87,
        avg_session_time: 25,
        total_sessions: 156,
        total_courses_enrolled: 8,
        total_courses_completed: 5,
        total_decks_studied: 12,
        total_reviews: 2340,
      })
    }
  }, [user])

  if (!user || !profileData) {
    return (
      <main className="page-content">
        <div className="form-header">
          <button className="back-button" onClick={() => setActiveNavItem('users-list')}>
            <ChevronLeft />
            {isVietnamese ? 'Quay lại' : 'Back'}
          </button>
        </div>
        <div className="not-found">
          <p>{isVietnamese ? 'Không tìm thấy người dùng' : 'User not found'}</p>
        </div>
      </main>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const xpToNextLevel = (profileData.level + 1) * 1000
  const xpProgress = (profileData.total_xp % 1000) / 10

  return (
    <main className="page-content">
      {/* Header */}
      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-button" onClick={() => setActiveNavItem('users-list')}>
            <ChevronLeft />
            {isVietnamese ? 'Quay lại' : 'Back'}
          </button>
          <h1 className="form-title" style={{ margin: 0 }}>
            {isVietnamese ? 'Chi tiết người dùng' : 'User Details'}
          </h1>
        </div>
      </div>

      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} />
            ) : (
              <span>{user.full_name.charAt(0)}</span>
            )}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.full_name}</h2>
            <p className="profile-email">
              <Mail /> {user.email}
            </p>
            <div className="profile-badges">
              <span className={`status-badge ${user.status.toLowerCase()}`}>
                {user.status === 'ACTIVE'
                  ? (isVietnamese ? 'Hoạt động' : 'Active')
                  : user.status === 'INACTIVE'
                    ? (isVietnamese ? 'Không hoạt động' : 'Inactive')
                    : (isVietnamese ? 'Bị cấm' : 'Banned')
                }
              </span>
              {user.is_premium && (
                <span className="premium-badge">
                  <Crown /> Premium
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Level & XP */}
          <div className="profile-card">
            <h3 className="card-title">
              <Award /> {isVietnamese ? 'Cấp độ & Kinh nghiệm' : 'Level & Experience'}
            </h3>
            <div className="level-display">
              <div className="level-badge-large">
                <span className="level-number">{profileData.level}</span>
              </div>
              <div className="xp-info">
                <div className="xp-bar">
                  <div className="xp-progress" style={{ width: `${xpProgress}%` }} />
                </div>
                <p className="xp-text">
                  {profileData.total_xp.toLocaleString()} XP
                  <span> / {xpToNextLevel.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-item">
                <Flame className="stat-icon" />
                <div>
                  <span className="stat-value">{profileData.current_streak}</span>
                  <span className="stat-label">{isVietnamese ? 'Streak hiện tại' : 'Current streak'}</span>
                </div>
              </div>
              <div className="stat-item">
                <TrendingUp className="stat-icon" />
                <div>
                  <span className="stat-value">{profileData.longest_streak}</span>
                  <span className="stat-label">{isVietnamese ? 'Streak dài nhất' : 'Longest streak'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="profile-card">
            <h3 className="card-title">
              <BookOpen /> {isVietnamese ? 'Tiến độ học tập' : 'Learning Progress'}
            </h3>
            <div className="stats-grid">
              <div className="stat-box">
                <BookOpen className="stat-box-icon" />
                <span className="stat-box-value">{profileData.total_lessons_completed}</span>
                <span className="stat-box-label">{isVietnamese ? 'Bài học hoàn thành' : 'Lessons completed'}</span>
              </div>
              <div className="stat-box">
                <Star className="stat-box-icon" />
                <span className="stat-box-value">{profileData.total_words_learned}</span>
                <span className="stat-box-label">{isVietnamese ? 'Từ đã học' : 'Words learned'}</span>
              </div>
              <div className="stat-box">
                <Target className="stat-box-icon" />
                <span className="stat-box-value">{profileData.total_reviews}</span>
                <span className="stat-box-label">{isVietnamese ? 'Lần ôn tập' : 'Reviews'}</span>
              </div>
              <div className="stat-box">
                <TrendingUp className="stat-box-icon" />
                <span className="stat-box-value">{profileData.accuracy_rate}%</span>
                <span className="stat-box-label">{isVietnamese ? 'Độ chính xác' : 'Accuracy'}</span>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="profile-card">
            <h3 className="card-title">
              <BookOpen /> {isVietnamese ? 'Khóa học' : 'Courses'}
            </h3>
            <div className="course-progress-list">
              <div className="course-progress-item">
                <div className="course-progress-header">
                  <span>{isVietnamese ? 'Đã đăng ký' : 'Enrolled'}</span>
                  <span className="progress-value">{profileData.total_courses_enrolled}</span>
                </div>
              </div>
              <div className="course-progress-item">
                <div className="course-progress-header">
                  <span>{isVietnamese ? 'Hoàn thành' : 'Completed'}</span>
                  <span className="progress-value success">{profileData.total_courses_completed}</span>
                </div>
              </div>
              <div className="course-progress-item">
                <div className="course-progress-header">
                  <span>{isVietnamese ? 'Bộ thẻ đã học' : 'Decks studied'}</span>
                  <span className="progress-value">{profileData.total_decks_studied}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TOEIC Score */}
          {profileData.toeic_score && (
            <div className="profile-card">
              <h3 className="card-title">
                <Target /> {isVietnamese ? 'Điểm TOEIC' : 'TOEIC Score'}
              </h3>
              <div className="toeic-score-display">
                <span className="toeic-score">{profileData.toeic_score}</span>
                <span className="toeic-max">/ 990</span>
              </div>
              <div className="toeic-breakdown">
                <div className="toeic-part">
                  <span className="part-label">{isVietnamese ? 'Nghe' : 'Listening'}</span>
                  <div className="part-bar">
                    <div className="part-progress" style={{ width: '75%' }} />
                  </div>
                  <span className="part-value">495</span>
                </div>
                <div className="toeic-part">
                  <span className="part-label">{isVietnamese ? 'Đọc' : 'Reading'}</span>
                  <div className="part-bar">
                    <div className="part-progress" style={{ width: '70%' }} />
                  </div>
                  <span className="part-value">470</span>
                </div>
              </div>
            </div>
          )}

          {/* Session Stats */}
          <div className="profile-card">
            <h3 className="card-title">
              <Clock /> {isVietnamese ? 'Phiên học' : 'Sessions'}
            </h3>
            <div className="session-stats">
              <div className="session-stat">
                <span className="session-value">{profileData.total_sessions}</span>
                <span className="session-label">{isVietnamese ? 'Tổng phiên' : 'Total sessions'}</span>
              </div>
              <div className="session-stat">
                <span className="session-value">{profileData.avg_session_time} {isVietnamese ? 'phút' : 'min'}</span>
                <span className="session-label">{isVietnamese ? 'Trung bình/phiên' : 'Avg per session'}</span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="profile-card">
            <h3 className="card-title">
              <Calendar /> {isVietnamese ? 'Thông tin tài khoản' : 'Account Info'}
            </h3>
            <div className="account-info">
              <div className="info-row">
                <span className="info-label">{isVietnamese ? 'Ngày tham gia' : 'Join date'}</span>
                <span className="info-value">{formatDate(profileData.created_at)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{isVietnamese ? 'Hoạt động cuối' : 'Last active'}</span>
                <span className="info-value">{formatDate(profileData.last_active)}</span>
              </div>
              {profileData.phone && (
                <div className="info-row">
                  <span className="info-label">{isVietnamese ? 'Số điện thoại' : 'Phone'}</span>
                  <span className="info-value">{profileData.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
