// Component thẻ tổng quan đơn hàng & lượt học Sales Overview theo phong cách Vuexy Admin.

import { ShoppingBag, Eye } from 'lucide-react'

interface VuexySalesOverviewCardProps {
  totalValue?: string
  growthPercentage?: string
  orderPercentage?: string
  orderCount?: string
  visitsPercentage?: string
  visitsCount?: string
  title?: string
}

export function VuexySalesOverviewCard({
  totalValue = '42.5k',
  growthPercentage = '+18.2%',
  orderPercentage = '62.2%',
  orderCount = '6,440',
  visitsPercentage = '25.5%',
  visitsCount = '12,749',
  title = 'Tổng Quan Đơn Hàng & Luyện Thi',
}: VuexySalesOverviewCardProps) {
  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {growthPercentage}
          </span>
        </div>
        <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalValue}</h4>
      </div>

      <div className="my-auto py-2">
        <div className="grid grid-cols-5 items-center">
          <div className="col-span-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="p-1 rounded-md bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <ShoppingBag className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Đơn mua</span>
            </div>
            <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">{orderPercentage}</h5>
            <small className="text-[11px] text-slate-400 dark:text-slate-500">{orderCount}</small>
          </div>

          <div className="col-span-1 flex justify-center">
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center">
              <span className="absolute text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                VS
              </span>
            </div>
          </div>

          <div className="col-span-2 text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Lượt học</span>
              <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Eye className="w-3.5 h-3.5" />
              </span>
            </div>
            <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">{visitsPercentage}</h5>
            <small className="text-[11px] text-slate-400 dark:text-slate-500">{visitsCount}</small>
          </div>
        </div>

        <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="bg-sky-500 h-full transition-all" style={{ width: '70%' }} />
          <div className="bg-indigo-600 h-full transition-all" style={{ width: '30%' }} />
        </div>
      </div>
    </div>
  )
}

