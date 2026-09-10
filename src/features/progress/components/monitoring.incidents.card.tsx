/**
 * @file monitoring.incidents.card.tsx
 * @description Card hiển thị nhật ký bảo trì và sự cố BetterStack gần đây
 */

import { CheckCircle2, Clock } from 'lucide-react'
import type { BetterStackIncident } from '@/types/api.types'

interface MonitoringIncidentsCardProps {
  incidents?: BetterStackIncident[]
  isVi: boolean
}

export function MonitoringIncidentsCard({
  incidents = [],
  isVi,
}: MonitoringIncidentsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {isVi
              ? 'Nhật Ký Bảo Trì & Sự Cố (BetterStack Incident Logs)'
              : 'Maintenance & Incident History'}
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isVi ? 'Cập nhật tự động qua Webhook' : 'Auto-updated via Webhook'}
        </span>
      </div>

      {incidents.length > 0 ? (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{inc.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isVi ? 'Đã giải quyết xong lúc: ' : 'Resolved at: '}
                    {new Date(inc.resolved_at || inc.created_at).toLocaleString(
                      isVi ? 'vi-VN' : 'en-US'
                    )}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {inc.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 text-xs sm:text-sm">
          {isVi
            ? 'Không có sự cố nào trong 30 ngày qua 🎉'
            : 'No incidents reported in the last 30 days 🎉'}
        </div>
      )}
    </div>
  )
}
