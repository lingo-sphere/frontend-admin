import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MessageCircle,
  Search,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Flag,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  User,
  Clock,
  Eye,
  Filter,
} from 'lucide-react'
import { toast } from '@/store/toast-store'
import { ConfirmModal } from '@/components/common/ConfirmModal'

interface CommunityPost {
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

export function CommunityPage() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletePostId, setDeletePostId] = useState<string | null>(null)

  const handleUpdateStatus = (id: string, newStatus: 'APPROVED' | 'HIDDEN') => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, status: newStatus } : p)))
    toast.success(`Đã cập nhật trạng thái bài viết thành ${newStatus === 'APPROVED' ? 'Đã duyệt' : 'Đã ẩn'}`)
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
    <main className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            COMMUNITY & MODERATION
          </div>
          <h1 className="page-title">Kiểm Duyệt Cộng Đồng Học Tập</h1>
          <p className="page-subtitle">
            Theo dõi thảo luận, bài viết chia sẻ kinh nghiệm và xử lý bài viết bị báo cáo vi phạm
          </p>
        </div>
      </div>

      <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <Search className="icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết, người đăng..."
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontSize: '13px' }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="toolbar-select"
          style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'inherit', fontSize: '13px' }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="APPROVED">Đã duyệt (Approved)</option>
          <option value="FLAGGED">Bị báo cáo (Flagged)</option>
          <option value="HIDDEN">Đã ẩn (Hidden)</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className={`p-5 rounded-2xl border transition-all ${
              post.status === 'FLAGGED'
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-slate-900/60 border-slate-800/80'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                  {post.author_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{post.author_name}</h4>
                  <p className="text-xs text-slate-400">{post.author_email} · {new Date(post.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {post.status === 'FLAGGED' && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Bị báo cáo spam
                  </span>
                )}
                {post.status === 'APPROVED' && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã duyệt
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-100 mb-2">{post.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{post.content}</p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-400">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {post.likes_count} lượt thích
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {post.comments_count} bình luận
                </span>
              </div>

              <div className="flex items-center gap-2">
                {post.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(post.id, 'APPROVED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors"
                  >
                    Duyệt bài
                  </button>
                )}
                {post.status !== 'HIDDEN' && (
                  <button
                    onClick={() => handleUpdateStatus(post.id, 'HIDDEN')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 font-semibold border border-amber-500/30 transition-colors"
                  >
                    Ẩn bài
                  </button>
                )}
                <button
                  onClick={() => setDeletePostId(post.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Xóa vĩnh viễn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={Boolean(deletePostId)}
        onClose={() => setDeletePostId(null)}
        onConfirm={confirmDelete}
        title="Xóa bài viết cộng đồng?"
        description="Bài viết và toàn bộ bình luận liên quan sẽ bị xóa khỏi cộng đồng học tập."
        confirmText="Xóa bài viết"
        cancelText="Hủy"
        variant="danger"
      />
    </main>
  )
}
