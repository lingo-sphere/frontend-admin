// Tiện ích và kiểu dữ liệu phục vụ bộ lọc thông báo Admin
import { formatRelativeTime } from '@/lib/format'

export type FilterCategory =
  | 'ALL'
  | 'AUTH'
  | 'USER'
  | 'SUBSCRIPTION'
  | 'VOCABULARY'
  | 'PRACTICE'
  | 'EXAM'
  | 'COURSE'
  | 'AI'
  | 'SYSTEM'

export type FilterPriority = 'ALL' | 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL'
export type FilterStatus = 'ALL' | 'UNREAD' | 'READ' | 'PINNED'

export function formatTimeAgo(dateStr: string, isVietnamese: boolean): string {
  return formatRelativeTime(dateStr, isVietnamese)
}

