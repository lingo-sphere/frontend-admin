/**
 * @file r2.media.preview.card.tsx
 * @description Thẻ hiển thị file media đã upload thành công kèm thumbnail, nút xem trước, đổi và xóa file
 */

import { Play, CheckCircle2, Eye, RefreshCw, ExternalLink, Trash2 } from 'lucide-react'
import { resolveStreamUrl } from '@/hooks/use.r2.uploader'

interface R2MediaPreviewCardProps {
  value: string
  isVideo: boolean
  isVi: boolean
  onPreview: () => void
  onChangeFile: () => void
  onRemove: (e: React.MouseEvent) => void
}

export function R2MediaPreviewCard({
  value,
  isVideo,
  isVi,
  onPreview,
  onChangeFile,
  onRemove,
}: R2MediaPreviewCardProps) {
  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div
        onClick={onPreview}
        className="flex items-center gap-3 overflow-hidden cursor-pointer group flex-1"
        title={
          isVi
            ? isVideo
              ? 'Bấm để xem trước video đã tải lên'
              : 'Bấm để xem ảnh phóng to'
            : isVideo
            ? 'Click to preview video'
            : 'Click to preview image'
        }
      >
        {!isVideo && (
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-black/5 dark:border-slate-800 relative">
            <img
              src={resolveStreamUrl(value)}
              alt="Preview"
              className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
            />
          </div>
        )}
        {isVideo && (
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-indigo-200 bg-indigo-950 flex items-center justify-center text-white relative group-hover:bg-indigo-900 transition-colors">
            <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
          </div>
        )}

        <div className="space-y-0.5 overflow-hidden">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{value.split('/').pop() || 'media-file'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {isVi ? 'Đã lưu trữ an toàn' : 'Stored securely'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
          title={
            isVideo
              ? isVi
                ? 'Phát video xem trước'
                : 'Play video preview'
              : isVi
              ? 'Xem ảnh phóng to'
              : 'View image preview'
          }
        >
          {isVideo ? (
            <>
              <Play className="w-3 h-3 fill-indigo-700 dark:fill-indigo-300" />
              <span>{isVi ? 'Phát video' : 'Play'}</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" />
              <span>{isVi ? 'Xem' : 'View'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onChangeFile}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          title="Thay thế file khác"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{isVi ? 'Đổi' : 'Change'}</span>
        </button>

        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          title="Mở trong tab mới"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
          title="Xóa file"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
