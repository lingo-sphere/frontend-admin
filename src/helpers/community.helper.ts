/**
 * @file community.helper.ts
 * @description Mã nguồn thành phần community.helper.ts
 */

export interface CommunityPost {
  id: string
  author_name: string
  author_email: string
  avatar?: string
  title: string
  content: string
  category: 'QUESTION' | 'EXPERIENCE' | 'STUDY_GROUP' | 'REPORT'
  likes_count: number
  comments_count: number
  status: 'APPROVED' | 'PENDING_REVIEW' | 'FLAGGED' | 'HIDDEN'
  created_at: string
}
