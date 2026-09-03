/**
 * @file MediaStorageQuotaCards.tsx
 * @description Component giao diện MediaStorageQuotaCards phục vụ khu vực Quản trị Admin
 */

import { Database, HardDrive, Radio } from 'lucide-react'
import type { StorageQuota } from '@/services/media.service'
import { formatMb, formatGb } from '@/helpers/media.helper'

interface MediaStorageQuotaCardsProps {
  quota: StorageQuota | null
}

export function MediaStorageQuotaCards({ quota }: MediaStorageQuotaCardsProps) {
  const usedGb = quota ? formatGb(quota.used_bytes) : '0.00'
  const usedMb = quota ? formatMb(quota.used_bytes) : '0.0'
  const totalGb = quota ? formatGb(quota.total_quota_bytes) : '10.00'
  const percentage = quota?.used_percentage ?? 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dung Lượng Đã Dùng
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {usedGb} GB <span className="text-xs font-normal text-slate-500">({usedMb} MB)</span>
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(percentage, 2)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Tổng dung lượng hạn mức: {totalGb} GB (Máy chủ lưu trữ đám mây)
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng Số Tệp Tin Media
            </p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {(quota?.total_files_count ?? 0).toLocaleString()} tệp tin
            </h3>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          Bao gồm hình ảnh bài giảng, audio phát âm và video hướng dẫn
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Trạng Thái Mạng Phân Phối CDN
              </p>
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                100% Hoạt động
              </h3>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          Tối ưu hóa chi phí băng thông với mạng phân phối nội dung tốc độ cao
        </p>
      </div>
    </div>
  )
}
