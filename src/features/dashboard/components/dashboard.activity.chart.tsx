// Component biểu đồ cột phân tích phiên học tập theo ngày với hiệu ứng trực quan hiện đại.
export interface ChartItem {
  value: number
  label: string
  fullDate: string
}

export function SimpleChart({ items }: { items: ChartItem[] }) {
  const maxValue = Math.max(...items.map((i) => i.value), 1)
  const minValue = Math.min(...items.map((i) => i.value), 0)

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-end gap-1.5 sm:gap-2 flex-1 pb-2">
        {items.map((item, index) => {
          const heightPercent = Math.max(
            12,
            Math.round(((item.value - minValue + 20) / (maxValue - minValue + 40)) * 100)
          )
          const isLatest = index === items.length - 1

          return (
            <div
              key={index}
              title={`${item.fullDate}: ${item.value} phiên học`}
              className="flex-1 flex flex-col justify-end items-center h-full group relative"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold pointer-events-none whitespace-nowrap z-20 shadow-md">
                {item.value}
              </div>
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  isLatest
                    ? 'bg-gradient-to-t from-teal-500 to-emerald-400 shadow-sm shadow-teal-500/30'
                    : 'bg-teal-500/25 dark:bg-teal-500/20 group-hover:bg-teal-500/80'
                }`}
              />
            </div>
          )
        })}
      </div>

      <div className="flex gap-1.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {items.map((item, index) => (
          <span
            key={index}
            className="flex-1 text-center text-[10.5px] font-medium text-slate-400 dark:text-slate-500 truncate"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
