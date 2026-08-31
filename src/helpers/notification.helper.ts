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
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return isVietnamese ? 'Vừa xong' : 'Just now'
  if (diffMins < 60) return isVietnamese ? `${diffMins} phút trước` : `${diffMins}m ago`
  if (diffHours < 24) return isVietnamese ? `${diffHours} giờ trước` : `${diffHours}h ago`
  if (diffDays < 7) return isVietnamese ? `${diffDays} ngày trước` : `${diffDays}d ago`
  return date.toLocaleDateString(isVietnamese ? 'vi-VN' : 'en-US')
}
