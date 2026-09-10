/**
 * @file sidebar.nav.config.ts
 * @description Sidebar navigation groups configuration, item definitions, and permission checking logic
 */

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
    label: 'HOME',
    items: [{ id: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' }],
  },
  {
    id: 'users_management',
    label: 'USERS',
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
    label: 'ACCESS CONTROL',
    items: [
      { id: 'roles', icon: Shield, label: 'Vai trò (Role)' },
      { id: 'permissions', icon: KeyRound, label: 'Quyền hạn (Permission)' },
    ],
  },
  {
    id: 'learning',
    label: 'LEARNING',
    items: [
      {
        id: 'courses',
        icon: Library,
        label: 'Khóa học',
        children: [
          { id: 'courses-list', label: 'Quản lý khóa học' },
          { id: 'course-learners', label: 'Quản lý học viên' },
          { id: 'course-exams', label: 'Quản lý bài thi' },
          { id: 'roadmaps', label: 'Quản lý lộ trình' },
        ],
      },
      { id: 'vocabulary', icon: BookOpen, label: 'Từ vựng' },
      {
        id: 'practice',
        icon: Activity,
        label: 'Luyện tập & TOEIC',
        children: [
          { id: 'practice-exercises', label: 'Bài luyện tập' },
          { id: 'practice-listening', label: 'Luyện nghe' },
          { id: 'practice-speaking', label: 'Luyện nói' },
          { id: 'practice-writing', label: 'Luyện viết' },
          { id: 'toeic-tests', label: 'Đề thi TOEIC' },
        ],
      },
      { id: 'media-storage', icon: Layers3, label: 'Kho Media' },
    ],
  },
  {
    id: 'community',
    label: 'COMMUNITY',
    items: [
      { id: 'community', icon: MessageCircle, label: 'Cộng đồng' },
      { id: 'public-decks', icon: Layers3, label: 'Bộ thẻ công khai' },
    ],
  },
  {
    id: 'insights',
    label: 'INSIGHTS',
    items: [
      {
        id: 'progress',
        icon: BarChart3,
        label: 'Thống kê dữ liệu',
        children: [
          { id: 'progress', label: 'Phân tích LingoSphere' },
          { id: 'analytics-posthog', label: 'Frontend Web (PostHog)' },
          { id: 'monitoring-betterstack', label: 'Backend 13 Services (BetterStack)' },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: 'SYSTEM',
    items: [
      { id: 'notifications', icon: Bell, label: 'Thông báo', kicker: '8' },
      { id: 'settings', icon: Settings2, label: 'Cài đặt' },
    ],
  },
]
