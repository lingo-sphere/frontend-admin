// Cấu hình danh mục nhóm và các mục điều hướng thanh bên Admin.
import React from 'react'
import {
  LayoutDashboard,
  Users,
  Library,
  BookOpen,
  Activity,
  MessageCircle,
  Layers3,
  BarChart3,
  Bell,
  Settings2,
  Shield,
  KeyRound,
} from 'lucide-react'

export interface NavSubItem {
  id: string
  label: string
}

export interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  kicker?: string
  children?: NavSubItem[]
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    id: 'home',
    label: 'TRANG CHỦ',
    items: [{ id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' }],
  },
  {
    id: 'users_management',
    label: 'QUẢN LÝ NGƯỜI DÙNG',
    items: [
      {
        id: 'users',
        icon: Users,
        label: 'Người dùng',
        children: [
          { id: 'users-list', label: 'Học viên' },
          { id: 'admins', label: 'Quản trị viên' },
        ],
      },
    ],
  },
  {
    id: 'access_control',
    label: 'QUẢN LÝ PHÂN QUYỀN',
    items: [
      { id: 'roles', icon: Shield, label: 'Vai trò' },
      { id: 'permissions', icon: KeyRound, label: 'Quyền hạn' },
    ],
  },
  {
    id: 'learning',
    label: 'GIẢNG DẠY & HỌC TẬP',
    items: [
      {
        id: 'courses',
        icon: Library,
        label: 'Khóa học',
        children: [
          { id: 'courses-list', label: 'Quản lý khóa học' },
          { id: 'course-learners', label: 'Quản lý học viên' },
          { id: 'course-exams', label: 'Quản lý bài thi' },
        ],
      },
      { id: 'vocabulary', icon: BookOpen, label: 'Từ vựng' },
      {
        id: 'practice',
        icon: Activity,
        label: 'Luyện tập kỹ năng',
        children: [
          { id: 'practice-contexts', label: 'Quản lý ngữ cảnh' },
          { id: 'practice-listening', label: 'Luyện nghe' },
          { id: 'practice-reading', label: 'Luyện đọc' },
          { id: 'practice-speaking', label: 'Luyện nói' },
          { id: 'practice-writing', label: 'Luyện viết' },
          { id: 'practice-grammar', label: 'Ngữ pháp' },
          { id: 'practice-ipa', label: 'Ngữ âm & IPA' },
        ],
      },
      { id: 'media-storage', icon: Layers3, label: 'Kho tài nguyên' },
    ],
  },
  {
    id: 'community',
    label: 'CỘNG ĐỒNG',
    items: [
      { id: 'community', icon: MessageCircle, label: 'Cộng đồng' },
      { id: 'public-decks', icon: Layers3, label: 'Bộ thẻ công khai' },
    ],
  },
  {
    id: 'insights',
    label: 'THỐNG KÊ & BÁO CÁO',
    items: [
      {
        id: 'progress',
        icon: BarChart3,
        label: 'Thống kê dữ liệu',
        children: [
          { id: 'progress', label: 'Phân tích học tập' },
          { id: 'analytics-posthog', label: 'Phân tích Web' },
          { id: 'monitoring-betterstack', label: 'Giám sát hệ thống' },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: 'HỆ THỐNG',
    items: [
      { id: 'notifications', icon: Bell, label: 'Thông báo', kicker: '8' },
      {
        id: 'settings',
        icon: Settings2,
        label: 'Cài đặt',
        children: [
          { id: 'settings-plans', label: 'Gói dịch vụ' },
          { id: 'settings-ai', label: 'AI & Mô hình' },
          { id: 'settings-system', label: 'Hệ thống' },
        ],
      },
    ],
  },
]
