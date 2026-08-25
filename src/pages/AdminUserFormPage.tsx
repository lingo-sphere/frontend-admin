// Updated: 2026-08-22
// Admin User Form Page - Trang thêm/sửa quản trị viên và giáo viên
// Đồng bộ với auth.dbml - auth_accounts

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronLeft,
  Save,
  Mail,
  Lock,
  Shield,
  GraduationCap,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'
import { adminUsers } from '@/data/settings-data'

interface AdminUserFormData {
  email: string
  password: string
  full_name: string
  role: 'ADMIN' | 'TEACHER'
  status: 'ACTIVE' | 'BLOCKED'
}

interface AdminUserFormPageProps {
  editUserId?: string
}

export function AdminUserFormPage({ editUserId }: AdminUserFormPageProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const isEditing = !!editUserId

  const [formData, setFormData] = useState<AdminUserFormData>({
    email: '',
    password: '',
    full_name: '',
    role: 'ADMIN',
    status: 'ACTIVE',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load user data when editing
  useEffect(() => {
    if (editUserId) {
      const user = adminUsers.find(u => u.id === editUserId)
      if (user) {
        setFormData({
          email: user.email,
          password: '', // Don't load password for security
          full_name: user.name,
          role: user.role,
          status: user.is_active ? 'ACTIVE' : 'BLOCKED',
        })
      }
    }
  }, [editUserId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = isVietnamese ? 'Email là bắt buộc' : 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isVietnamese ? 'Email không hợp lệ' : 'Invalid email'
    }

    // Password is optional when editing
    if (!isEditing && !formData.password) {
      newErrors.password = isVietnamese ? 'Mật khẩu là bắt buộc' : 'Password is required'
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = isVietnamese ? 'Mật khẩu phải có ít nhất 8 ký tự' : 'Password must be at least 8 characters'
    }

    if (!formData.full_name) {
      newErrors.full_name = isVietnamese ? 'Họ tên là bắt buộc' : 'Full name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    console.log('Saving admin user:', formData)
    alert(isEditing
      ? (isVietnamese ? 'Đã cập nhật người dùng!' : 'User updated!')
      : (isVietnamese ? 'Đã thêm người dùng!' : 'User added!')
    )
    setActiveNavItem('admins')
  }

  const roleOptions = [
    {
      id: 'ADMIN' as const,
      label: isVietnamese ? 'Quản trị viên' : 'Admin',
      description: isVietnamese ? 'Toàn quyền quản lý hệ thống' : 'Full system management access',
      icon: Shield,
    },
    {
      id: 'TEACHER' as const,
      label: isVietnamese ? 'Giáo viên' : 'Teacher',
      description: isVietnamese ? 'Quản lý khóa học và nội dung' : 'Manage courses and content',
      icon: GraduationCap,
    },
  ]

  const statusOptions = [
    { id: 'ACTIVE' as const, label: isVietnamese ? 'Hoạt động' : 'Active', color: 'var(--success)' },
    { id: 'BLOCKED' as const, label: isVietnamese ? 'Bị khóa' : 'Blocked', color: 'var(--error)' },
  ]

  return (
    <main className="page-content">
      {/* Header */}
      <div className="form-header">
        <button className="back-button" onClick={() => setActiveNavItem('admins')}>
          <ChevronLeft />
          {isVietnamese ? 'Quay lại' : 'Back'}
        </button>
        <h1 className="form-title">
          {isEditing
            ? (isVietnamese ? 'Chỉnh sửa người dùng' : 'Edit User')
            : (isVietnamese ? 'Thêm người dùng' : 'Add User')
          }
        </h1>
        <button className="primary-button" onClick={handleSave}>
          <Save />
          {isVietnamese ? 'Lưu' : 'Save'}
        </button>
      </div>

      {/* Form */}
      <div className="user-form-content">
        {/* Account Info */}
        <div className="form-section">
          <h2 className="section-title">{isVietnamese ? 'Thông tin tài khoản' : 'Account Information'}</h2>

          <div className="form-group">
            <label className="form-label">
              Email <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                type="email"
                className={`form-input with-icon ${errors.email ? 'error' : ''}`}
                placeholder="email@example.com"
                value={formData.email}
                onChange={e => {
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                }}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              {isVietnamese ? 'Mật khẩu' : 'Password'}
              {!isEditing && <span className="required">*</span>}
              {isEditing && <span className="form-hint-inline">{isVietnamese ? '(để trống nếu không đổi)' : '(leave blank to keep)'}</span>}
            </label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input with-icon ${errors.password ? 'error' : ''}`}
                placeholder={isVietnamese ? 'Nhập mật khẩu...' : 'Enter password...'}
                value={formData.password}
                onChange={e => {
                  setFormData(prev => ({ ...prev, password: e.target.value }))
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                }}
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
        </div>

        {/* Profile Info */}
        <div className="form-section">
          <h2 className="section-title">{isVietnamese ? 'Thông tin cá nhân' : 'Personal Information'}</h2>

          <div className="form-group">
            <label className="form-label">
              {isVietnamese ? 'Họ và tên' : 'Full Name'} <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.full_name ? 'error' : ''}`}
              placeholder={isVietnamese ? 'Nhập họ tên...' : 'Enter full name...'}
              value={formData.full_name}
              onChange={e => {
                setFormData(prev => ({ ...prev, full_name: e.target.value }))
                if (errors.full_name) setErrors(prev => ({ ...prev, full_name: '' }))
              }}
            />
            {errors.full_name && <span className="error-message">{errors.full_name}</span>}
          </div>
        </div>

        {/* Role Selection */}
        <div className="form-section">
          <h2 className="section-title">{isVietnamese ? 'Vai trò' : 'Role'}</h2>

          <div className="role-options">
            {roleOptions.map(option => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`role-option ${formData.role === option.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: option.id }))}
                >
                  <div className="role-icon">
                    <Icon />
                  </div>
                  <div className="role-info">
                    <span className="role-label">{option.label}</span>
                    <span className="role-description">{option.description}</span>
                  </div>
                  {formData.role === option.id && <Check className="role-check" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status Selection */}
        <div className="form-section">
          <h2 className="section-title">{isVietnamese ? 'Trạng thái' : 'Status'}</h2>

          <div className="status-options">
            {statusOptions.map(option => (
              <button
                key={option.id}
                type="button"
                className={`status-option ${formData.status === option.id ? 'selected' : ''}`}
                style={{
                  '--status-color': option.color,
                } as React.CSSProperties}
                onClick={() => setFormData(prev => ({ ...prev, status: option.id }))}
              >
                {formData.status === option.id && <Check className="status-check" />}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="form-summary">
          <h3>{isVietnamese ? 'Tóm tắt' : 'Summary'}</h3>
          <div className="summary-items">
            <div className="summary-item">
              <span className="summary-label">{isVietnamese ? 'Email' : 'Email'}</span>
              <span className="summary-value">{formData.email || '-'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{isVietnamese ? 'Họ tên' : 'Full Name'}</span>
              <span className="summary-value">{formData.full_name || '-'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{isVietnamese ? 'Vai trò' : 'Role'}</span>
              <span className="summary-value">
                {formData.role === 'ADMIN'
                  ? (isVietnamese ? 'Quản trị viên' : 'Admin')
                  : (isVietnamese ? 'Giáo viên' : 'Teacher')
                }
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{isVietnamese ? 'Trạng thái' : 'Status'}</span>
              <span className="summary-value">
                {formData.status === 'ACTIVE'
                  ? (isVietnamese ? 'Hoạt động' : 'Active')
                  : (isVietnamese ? 'Bị khóa' : 'Blocked')
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
