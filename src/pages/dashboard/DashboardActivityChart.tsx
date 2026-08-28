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
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-t-md transition-all duration-300 group-hover:bg-teal-400 ${
                  isLatest
                    ? 'bg-teal-500 shadow-lg shadow-teal-500/30'
                    : 'bg-teal-500/30'
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
            className="flex-1 text-center text-[10px] text-slate-400 truncate"
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
