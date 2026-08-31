import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { CommunityFilterBar } from '@/components/community/CommunityFilterBar'
import { CommunityPostCard } from '@/components/community/CommunityPostCard'
import type { CommunityPost } from '@/helpers/community.helper'

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletePostId, setDeletePostId] = useState<string | null>(null)

  const handleUpdateStatus = (id: string, newStatus: 'APPROVED' | 'HIDDEN') => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
    toast.success(
      `Đã cập nhật trạng thái bài viết thành ${
        newStatus === 'APPROVED' ? 'Đã duyệt' : 'Đã ẩn'
      }`
    )
  }

  const confirmDelete = () => {
    if (!deletePostId) return
    setPosts(posts.filter((p) => p.id !== deletePostId))
    toast.success('Đã xóa bài viết cộng đồng vi phạm')
    setDeletePostId(null)
  }

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <MessageCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          <span>Kiểm Duyệt Cộng Đồng Học Tập</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi thảo luận, bài viết chia sẻ kinh nghiệm và xử lý bài viết bị báo cáo vi phạm
        </p>
      </div>

      <CommunityFilterBar
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        onSearchChange={setSearchQuery}
        onStatusChange={setFilterStatus}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Chưa có bài viết cộng đồng nào cần xử lý
          </div>
        ) : (
          filteredPosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onUpdateStatus={handleUpdateStatus}
              onDelete={(id) => setDeletePostId(id)}
            />
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deletePostId)}
        onClose={() => setDeletePostId(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa bài viết cộng đồng?"
        message="Bài viết và toàn bộ bình luận liên quan sẽ bị xóa vĩnh viễn khỏi nền tảng."
        confirmText="Xóa bài viết"
        cancelText="Hủy bỏ"
        variant="danger"
      />
    </div>
  )
}
