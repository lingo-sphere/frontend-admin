import {
  MessageSquare,
  ThumbsUp,
  Trash2,
  CheckCircle2,
  Eye,
} from 'lucide-react'
import type { CommunityPost } from '@/helpers/community.helper'
import { Popconfirm } from '@/components/common/Popconfirm'

interface CommunityPostCardProps {
  post: CommunityPost
  onUpdateStatus: (id: string, newStatus: 'APPROVED' | 'HIDDEN') => void
  onDelete: (id: string) => Promise<void> | void
}

export function CommunityPostCard({
  post,
  onUpdateStatus,
  onDelete,
}: CommunityPostCardProps) {
  const isApproved = post.status === 'APPROVED'

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {post.author_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
              {post.author_name}
            </h4>
            <p className="text-[11px] text-slate-400">{post.author_email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              post.status === 'APPROVED'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : post.status === 'FLAGGED'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {post.status}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          {post.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
            {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
            {post.comments_count} bình luận
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isApproved ? (
            <button
              onClick={() => onUpdateStatus(post.id, 'HIDDEN')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ẩn bài</span>
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(post.id, 'APPROVED')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Duyệt bài</span>
            </button>
          )}
          <Popconfirm
            title="Xóa bài viết này?"
            description="Bài viết và toàn bộ bình luận liên quan sẽ bị xóa vĩnh viễn."
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
            placement="topRight"
            onConfirm={() => onDelete(post.id)}
          >
            <button
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Xóa bài viết"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      </div>
    </div>
  )
}
