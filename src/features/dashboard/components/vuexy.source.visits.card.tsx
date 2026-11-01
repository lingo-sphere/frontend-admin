// Component thẻ nguồn truy cập Source Visits theo phong cách Vuexy Admin.

import { useState } from 'react'
import { MoreVertical, Compass, Globe, Mail, ExternalLink, Megaphone, Star } from 'lucide-react'

interface SourceItem {
  id: string
  title: string
  subtitle: string
  count: string
  trend: string
  isPositive: boolean
  icon: typeof Compass
}

interface VuexySourceVisitsCardProps {
  title?: string
  subtitle?: string
  items?: SourceItem[]
}

const defaultSources: SourceItem[] = [
  {
    id: 'direct',
    title: 'Truy cập trực tiếp',
    subtitle: 'Ứng dụng Web & Mobile',
    count: '1.2k',
    trend: '+4.2%',
    isPositive: true,
    icon: Compass,
  },
  {
    id: 'social',
    title: 'Mạng xã hội & Forum',
    subtitle: 'Facebook, Zalo & TikTok',
    count: '31.5k',
    trend: '+8.2%',
    isPositive: true,
    icon: Globe,
  },
  {
    id: 'email',
    title: 'Email bản tin học tập',
    subtitle: 'Nhắc học & Thách thức',
    count: '893',
    trend: '+2.4%',
    isPositive: true,
    icon: Mail,
  },
  {
    id: 'referrals',
    title: 'Mã giới thiệu học viên',
    subtitle: 'Học bổng & Bạn bè',
    count: '342',
    trend: '-0.4%',
    isPositive: false,
    icon: ExternalLink,
  },
  {
    id: 'advt',
    title: 'Chiến dịch tuyển sinh',
    subtitle: 'Google & Meta Ads',
    count: '2.15k',
    trend: '+9.1%',
    isPositive: true,
    icon: Megaphone,
  },
  {
    id: 'other',
    title: 'Kênh đối tác khác',
    subtitle: 'Trường học & Trung tâm',
    count: '12.5k',
    trend: '+6.2%',
    isPositive: true,
    icon: Star,
  },
]

export function VuexySourceVisitsCard({
  title = 'Nguồn Truy Cập & Kênh Học Tập',
  subtitle = '38.4k Lượt truy cập toàn hệ sinh thái',
  items = defaultSources,
}: VuexySourceVisitsCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{title}</h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-20 w-36 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-xs">
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Làm mới
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3.5 my-auto">
        {items.map((item) => {
          const IconComp = item.icon
          return (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <IconComp className="w-4 h-4" />
                </span>
                <div>
                  <h6 className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.title}</h6>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.count}</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    item.isPositive
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                  }`}
                >
                  {item.trend}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

