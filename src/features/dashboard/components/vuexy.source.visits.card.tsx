// Component thẻ phân loại cơ cấu tài khoản và kênh người dùng theo phong cách Vuexy Admin.
import { useState } from 'react'
import { MoreVertical, GraduationCap, Users, ShieldCheck, Crown, UserCheck, Compass } from 'lucide-react'

interface VuexySourceVisitsCardProps {
  totalUsers: number
  studentsCount: number
  instructorsCount: number
  adminsCount: number
  vipCount: number
  standardCount: number
  activeTodayCount?: number
  title?: string
}

export function VuexySourceVisitsCard({
  totalUsers,
  studentsCount,
  instructorsCount,
  adminsCount,
  vipCount,
  standardCount,
  activeTodayCount = 0,
  title = 'Cơ Cấu Tài Khoản & Đối Tượng Học Viên',
}: VuexySourceVisitsCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const items = [
    {
      id: 'students',
      title: 'Học viên (Student)',
      subtitle: 'Người học trực tuyến trên nền tảng',
      count: `${studentsCount}`,
      trend: `${totalUsers > 0 ? Math.round((studentsCount / totalUsers) * 100) : 0}%`,
      icon: GraduationCap,
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    },
    {
      id: 'vip',
      title: 'Gói VIP Premium',
      subtitle: 'Học viên đăng ký gói đặc quyền',
      count: `${vipCount}`,
      trend: `${totalUsers > 0 ? Math.round((vipCount / totalUsers) * 100) : 0}%`,
      icon: Crown,
      colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    },
    {
      id: 'standard',
      title: 'Tài khoản Tiêu chuẩn',
      subtitle: 'Học viên trải nghiệm miễn phí',
      count: `${standardCount}`,
      trend: `${totalUsers > 0 ? Math.round((standardCount / totalUsers) * 100) : 0}%`,
      icon: UserCheck,
      colorClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    },
    {
      id: 'instructors',
      title: 'Giảng viên & Trợ giảng',
      subtitle: 'Biên soạn nội dung & chấm bài thi',
      count: `${instructorsCount}`,
      trend: `${totalUsers > 0 ? Math.round((instructorsCount / totalUsers) * 100) : 0}%`,
      icon: Users,
      colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    {
      id: 'admins',
      title: 'Quản trị viên (Admin)',
      subtitle: 'Vận hành và quản lý hệ sinh thái',
      count: `${adminsCount}`,
      trend: `${totalUsers > 0 ? Math.round((adminsCount / totalUsers) * 100) : 0}%`,
      icon: ShieldCheck,
      colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    },
    {
      id: 'active',
      title: 'Tương tác trong ngày (DAU)',
      subtitle: 'Người dùng phát sinh hành vi hôm nay',
      count: `${activeTodayCount}`,
      trend: `${totalUsers > 0 ? Math.round((activeTodayCount / totalUsers) * 100) : 0}%`,
      icon: Compass,
      colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    },
  ]

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-[#2f3349] border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{title}</h5>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalUsers.toLocaleString('vi-VN')} Tài khoản toàn hệ sinh thái
          </p>
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
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.colorClass}`}>
                  <IconComp className="w-4 h-4" />
                </span>
                <div>
                  <h6 className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.title}</h6>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.count}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 min-w-[42px] text-center">
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
