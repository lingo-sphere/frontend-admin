import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Mail,
  Shield,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Edit2,
  X,
  Check,
  Key,
  Lock,
  User,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { adminUsers } from '@/data/settings-data'

interface AdminProfileData {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TEACHER'
  avatar?: string
  is_active: boolean
  last_active: string
  created_at: string
  
  total_courses_created: number
  total_lessons_created: number
  total_users_managed: number
}

export function AdminProfilePage() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const activeNavItem = useAdminStore((state) => state.activeNavItem)

  const userId = activeNavItem.includes(':') ? activeNavItem.split(':')[1] : adminUsers[0]?.id
  const adminUser = adminUsers.find(u => u.id === userId) || adminUsers[0]

  const [profileData, setProfileData] = useState<AdminProfileData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as 'ADMIN' | 'TEACHER',
    is_active: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (adminUser) {
      setProfileData({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        avatar: adminUser.avatar,
        is_active: adminUser.is_active,
        last_active: adminUser.last_active,
        created_at: adminUser.created_at || new Date().toISOString(),
        total_courses_created: 12,
        total_lessons_created: 156,
        total_users_managed: 1234,
      })
    }
  }, [adminUser])

  const handleOpenEdit = () => {
    if (profileData) {
      setEditForm({
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        is_active: profileData.is_active,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setIsEditModalOpen(true)
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileData) return

    setProfileData({
      ...profileData,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      is_active: editForm.is_active,
    })

    setIsEditModalOpen(false)
    setToastMessage(isVietnamese ? 'Cập nhật thông tin quản trị viên thành công!' : 'Profile updated successfully!')
    setTimeout(() => setToastMessage(null), 3000)
  }

  if (!adminUser || !profileData) {
    return (
      <main className="page-content">
        <div className="form-header">
          <button className="back-button" onClick={() => setActiveNavItem('dashboard')}>
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

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} ${isVietnamese ? 'phút trước' : 'mins ago'}`
    if (diffHours < 24) return `${diffHours} ${isVietnamese ? 'giờ trước' : 'hours ago'}`
    if (diffDays < 7) return `${diffDays} ${isVietnamese ? 'ngày trước' : 'days ago'}`
    return formatDate(dateStr)
  }

  const RoleIcon = profileData.role === 'TEACHER' ? GraduationCap : Shield

  return (
    <main className="page-content">
      
      {toastMessage && (
        <div className="toast-notification success" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--success)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 500,
          fontSize: '14px',
        }}>
          <Check size={18} />
          {toastMessage}
        </div>
      )}

      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-button" onClick={() => setActiveNavItem('dashboard')}>
            <ChevronLeft />
            {isVietnamese ? 'Quay lại' : 'Back'}
          </button>
          <h1 className="form-title" style={{ margin: 0 }}>
            {isVietnamese ? 'Chi tiết quản trị viên' : 'Admin Details'}
          </h1>
        </div>

        <button className="primary-button" onClick={handleOpenEdit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit2 size={16} />
          {isVietnamese ? 'Chỉnh sửa hồ sơ' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        
        <div className="profile-header-card">
          <div className="profile-avatar admin">
            <RoleIcon />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{profileData.name}</h2>
            <p className="profile-email">
              <Mail /> {profileData.email}
            </p>
            <div className="profile-badges">
              <span className={`status-badge ${profileData.is_active ? 'active' : 'inactive'}`}>
                {profileData.is_active
                  ? (isVietnamese ? 'Hoạt động' : 'Active')
                  : (isVietnamese ? 'Không hoạt động' : 'Inactive')
                }
              </span>
              <span className="role-badge">
                <RoleIcon />
                {profileData.role === 'ADMIN'
                  ? (isVietnamese ? 'Quản trị viên' : 'Admin')
                  : (isVietnamese ? 'Giáo viên' : 'Teacher')
                }
              </span>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          
          <div className="profile-card">
            <h3 className="card-title">
              {isVietnamese ? 'Hoạt động' : 'Activity'}
            </h3>
            <div className="activity-stats">
              <div className="activity-stat">
                <span className="activity-value">{profileData.total_courses_created}</span>
                <span className="activity-label">
                  {isVietnamese ? 'Khóa học đã tạo' : 'Courses created'}
                </span>
              </div>
              <div className="activity-stat">
                <span className="activity-value">{profileData.total_lessons_created}</span>
                <span className="activity-label">
                  {isVietnamese ? 'Bài học đã tạo' : 'Lessons created'}
                </span>
              </div>
              <div className="activity-stat">
                <span className="activity-value">{profileData.total_users_managed}</span>
                <span className="activity-label">
                  {isVietnamese ? 'Người dùng quản lý' : 'Users managed'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3 className="card-title">
              {profileData.role === 'ADMIN' ? (isVietnamese ? 'Quyền quản trị' : 'Admin Permissions') : (isVietnamese ? 'Quyền giáo viên' : 'Teacher Permissions')}
            </h3>
            <div className="permissions-list">
              {profileData.role === 'ADMIN' ? (
                <>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Quản lý người dùng' : 'Manage users'}</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Quản lý khóa học' : 'Manage courses'}</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Quản lý từ vựng' : 'Manage vocabulary'}</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Cài đặt hệ thống' : 'System settings'}</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Xem báo cáo' : 'View reports'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Tạo khóa học' : 'Create courses'}</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Quản lý bài học' : 'Manage lessons'}</span>
                  </div>
                  <div className="permission-item">
                    <CheckCircle className="perm-icon success" />
                    <span>{isVietnamese ? 'Thêm từ vựng' : 'Add vocabulary'}</span>
                  </div>
                  <div className="permission-item">
                    <XCircle className="perm-icon danger" />
                    <span>{isVietnamese ? 'Cài đặt hệ thống' : 'System settings'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3 className="card-title">
              <Calendar /> {isVietnamese ? 'Thông tin tài khoản' : 'Account Info'}
            </h3>
            <div className="account-info">
              <div className="info-row">
                <span className="info-label">{isVietnamese ? 'Ngày tạo' : 'Created'}</span>
                <span className="info-value">{formatDate(profileData.created_at)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{isVietnamese ? 'Hoạt động cuối' : 'Last active'}</span>
                <span className="info-value">{formatTimeAgo(profileData.last_active)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-container edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3 className="modal-title" style={{ margin: 0 }}>
                {isVietnamese ? 'Chỉnh sửa thông tin tài khoản' : 'Edit Account Details'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group-full">
                <label className="form-field-label">{isVietnamese ? 'Họ và tên' : 'Full Name'}</label>
                <input
                  type="text"
                  className="form-field-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group-grid">
                <div>
                  <label className="form-field-label">Email</label>
                  <input
                    type="email"
                    className="form-field-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-field-label">{isVietnamese ? 'Vai trò' : 'Role'}</label>
                  <select
                    className="form-field-select"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'ADMIN' | 'TEACHER' })}
                  >
                    <option value="ADMIN">{isVietnamese ? 'Quản trị viên' : 'Admin'}</option>
                    <option value="TEACHER">{isVietnamese ? 'Giáo viên' : 'Teacher'}</option>
                  </select>
                </div>
              </div>

              <div className="form-group-full">
                <label className="form-field-label">{isVietnamese ? 'Trạng thái hoạt động' : 'Account Status'}</label>
                <select
                  className="form-field-select"
                  value={editForm.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}
                >
                  <option value="active">{isVietnamese ? 'Đang hoạt động' : 'Active'}</option>
                  <option value="inactive">{isVietnamese ? 'Không hoạt động' : 'Inactive'}</option>
                </select>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={16} />
                  {isVietnamese ? 'Đổi mật khẩu (Tùy chọn)' : 'Change Password (Optional)'}
                </h4>

                <div className="form-group-full" style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder={isVietnamese ? 'Mật khẩu hiện tại' : 'Current password'}
                    className="form-field-input"
                    style={{ paddingRight: '40px' }}
                    value={editForm.currentPassword}
                    onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                    }}
                    title={showCurrentPassword ? (isVietnamese ? 'Ẩn mật khẩu' : 'Hide password') : (isVietnamese ? 'Hiện mật khẩu' : 'Show password')}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="form-group-grid">
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder={isVietnamese ? 'Mật khẩu mới' : 'New password'}
                      className="form-field-input"
                      style={{ paddingRight: '40px' }}
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                      }}
                      title={showNewPassword ? (isVietnamese ? 'Ẩn mật khẩu' : 'Hide password') : (isVietnamese ? 'Hiện mật khẩu' : 'Show password')}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={isVietnamese ? 'Xác nhận mật khẩu' : 'Confirm password'}
                      className="form-field-input"
                      style={{ paddingRight: '40px' }}
                      value={editForm.confirmPassword}
                      onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                      }}
                      title={showConfirmPassword ? (isVietnamese ? 'Ẩn mật khẩu' : 'Hide password') : (isVietnamese ? 'Hiện mật khẩu' : 'Show password')}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setIsEditModalOpen(false)}>
                  {isVietnamese ? 'Hủy' : 'Cancel'}
                </button>
                <button type="submit" className="primary-button" style={{ height: '44px', flex: 1, justifyContent: 'center' }}>
                  {isVietnamese ? 'Lưu thay đổi' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
