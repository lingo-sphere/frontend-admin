/**
 * @file CommunityPage.tsx
 * @description Trang quản trị CommunityPage trong giao diện Admin
 */

import { useState, useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import { toast } from '@/store/toast-store'
import { CommunityFilterBar } from '@/components/community/CommunityFilterBar'
import { CommunityPostCard } from '@/components/community/CommunityPostCard'
import type { CommunityPost } from '@/helpers/community.helper'
import { Pagination } from '@/components/common/Pagination'

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const handleUpdateStatus = (id: string, newStatus: 'APPROVED' | 'HIDDEN') => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
    toast.success(
      `Đã cập nhật trạng thái bài viết thành ${
        newStatus === 'APPROVED' ? 'Đã duyệt' : 'Đã ẩn'
      }`
    )
  }

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Đã xóa bài viết cộng đồng vi phạm')
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = filterStatus === 'ALL' || p.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [posts, searchQuery, filterStatus])

  const totalPages = Math.ceil(filteredPosts.length / pageSize) || 1

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPosts.slice(start, start + pageSize)
  }, [filteredPosts, currentPage, pageSize])

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
        onSearchChange={(val) => {
          setSearchQuery(val)
          setCurrentPage(1)
        }}
        onStatusChange={(val) => {
          setFilterStatus(val)
          setCurrentPage(1)
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedPosts.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            Chưa có bài viết cộng đồng nào cần xử lý
          </div>
        ) : (
          paginatedPosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      {filteredPosts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[6, 10, 20, 50]}
          totalItems={filteredPosts.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}
