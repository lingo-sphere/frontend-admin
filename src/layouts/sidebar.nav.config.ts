// Cấu hình danh mục nhóm và các mục điều hướng thanh bên Admin.
import React from 'react'
import type { IconSvgElement } from '@hugeicons/react'
import {
  UserMultiple02Icon,
  Shield01Icon,
  Book02Icon,
  UserGroupIcon,
  FileEditIcon,
  Layers01Icon,
  HeadphonesIcon,
  BookOpen01Icon,
  Mic01Icon,
  PencilEdit02Icon,
  TextFontIcon,
  AudioWave01Icon,
  ChartLineData02Icon,
  CursorPointer01Icon,
  Activity01Icon,
  Rocket01Icon,
  AiBrain01Icon,
  Settings02Icon,
} from '@hugeicons/core-free-icons'
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
  icon?: React.ReactNode | IconSvgElement
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
          { id: 'users-list', label: 'Học viên', icon: UserMultiple02Icon },
          { id: 'admins', label: 'Quản trị viên', icon: Shield01Icon },
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
          { id: 'courses-list', label: 'Quản lý khóa học', icon: Book02Icon },
          { id: 'course-learners', label: 'Quản lý học viên', icon: UserGroupIcon },
          { id: 'course-exams', label: 'Quản lý bài thi', icon: FileEditIcon },
        ],
      },
      { id: 'vocabulary', icon: BookOpen, label: 'Từ vựng' },
      {
        id: 'practice',
        icon: Activity,
        label: 'Luyện tập kỹ năng',
        children: [
          { id: 'practice-contexts', label: 'Quản lý ngữ cảnh', icon: Layers01Icon },
          { id: 'practice-listening', label: 'Luyện nghe', icon: HeadphonesIcon },
          { id: 'practice-reading', label: 'Luyện đọc', icon: BookOpen01Icon },
          { id: 'practice-speaking', label: 'Luyện nói', icon: Mic01Icon },
          { id: 'practice-writing', label: 'Luyện viết', icon: PencilEdit02Icon },
          { id: 'practice-grammar', label: 'Ngữ pháp', icon: TextFontIcon },
          { id: 'practice-ipa', label: 'Ngữ âm & IPA', icon: AudioWave01Icon },
        ],
      },
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
          { id: 'progress', label: 'Phân tích học tập', icon: ChartLineData02Icon },
          { id: 'analytics-posthog', label: 'Phân tích Web', icon: CursorPointer01Icon },
          { id: 'monitoring-betterstack', label: 'Giám sát hệ thống', icon: Activity01Icon },
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
          { id: 'settings-plans', label: 'Gói dịch vụ', icon: Rocket01Icon },
          { id: 'settings-ai', label: 'AI & Mô hình', icon: AiBrain01Icon },
          { id: 'settings-system', label: 'Hệ thống', icon: Settings02Icon },
        ],
      },
    ],
  },
]
