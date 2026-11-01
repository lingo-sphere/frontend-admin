// Component thẻ trượt phân tích Website Analytics theo phong cách Vuexy Admin Template.

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Users, BookOpen, GraduationCap, Award } from 'lucide-react'

interface VuexyAnalyticsSliderCardProps {
  totalUsers?: number
  activeToday?: number
  totalCourses?: number
  vipUsers?: number
  isVietnamese?: boolean
}

export function VuexyAnalyticsSliderCard({
  totalUsers = 7,
  activeToday = 0,
  totalCourses = 2,
  vipUsers = 3,
  isVietnamese = true,
}: VuexyAnalyticsSliderCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slides = [
    {
      title: isVietnamese ? 'Phân Tích Nền Tảng LingoSphere' : 'Website & Learning Analytics',
      subtitle: isVietnamese ? 'Tỉ lệ tương tác học tập trung bình 28.5%' : 'Total 28.5% Conversion Rate',
      sectionTitle: isVietnamese ? 'Lưu Lượng Học Tập' : 'Traffic',
      stats: [
        { value: `${totalUsers}`, label: isVietnamese ? 'Tổng học viên' : 'Total Learners' },
        { value: `${activeToday}`, label: isVietnamese ? 'Học hôm nay' : 'Active Today' },
        { value: `${totalCourses} Khóa`, label: isVietnamese ? 'Khóa học' : 'Courses' },
        { value: `${vipUsers}`, label: isVietnamese ? 'Gói VIP' : 'VIP Accounts' },
      ],
      badge: isVietnamese ? 'Hoạt động ổn định' : 'Optimal',
      icon: TrendingUp,
    },
    {
      title: isVietnamese ? 'Tiến Trình Học Tập & Luyện Đề' : 'Study & Practice Progress',
      subtitle: isVietnamese ? 'Hệ thống luyện thi TOEIC 7 Part chuẩn quốc tế' : 'Full 7 Part TOEIC practice system',
      sectionTitle: isVietnamese ? 'Kỹ Năng & Từ Vựng' : 'Skills & Vocabulary',
      stats: [
        { value: '450+', label: isVietnamese ? 'Từ vựng SRS' : 'SRS Words' },
        { value: '11 Đề', label: isVietnamese ? 'Đề thi TOEIC' : 'Mock Tests' },
        { value: '88%', label: isVietnamese ? 'Tỉ lệ hoàn thành' : 'Completion Rate' },
        { value: '94%', label: isVietnamese ? 'Duy trì Streak' : 'Streak Retention' },
      ],
      badge: isVietnamese ? 'Chuẩn CEFR' : 'CEFR Ready',
      icon: BookOpen,
    },
    {
      title: isVietnamese ? 'Doanh Thu & Tăng Trưởng Khóa Học' : 'Revenue & Subscriptions',
      subtitle: isVietnamese ? 'Tăng trưởng đơn hàng học tập +18.4% tháng này' : '+18.4% growth this month',
      sectionTitle: isVietnamese ? 'Phân Bổ Gói Dịch Vụ' : 'Revenue Streams',
      stats: [
        { value: '65%', label: isVietnamese ? 'Khóa học TOEIC' : 'Course Orders' },
        { value: '25%', label: isVietnamese ? 'Gói VIP Premium' : 'VIP Premium' },
        { value: '10%', label: isVietnamese ? 'Luyện tập AI' : 'AI Modules' },
        { value: '+18.4%', label: isVietnamese ? 'Tăng trưởng' : 'Growth' },
      ],
      badge: isVietnamese ? 'Doanh số VIP' : 'Top Tier',
      icon: Award,
    },
  ]

  const active = slides[currentSlide]
  const IconComponent = active.icon

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white p-6 shadow-md shadow-indigo-500/20 flex flex-col justify-between min-h-[260px]">
      <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-12 top-6 w-32 h-32 rounded-full bg-violet-400/20 blur-xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 uppercase tracking-wide">
              {active.badge}
            </span>
            <span className="text-xs text-indigo-100 font-medium">{active.subtitle}</span>
          </div>

          <div className="flex items-center gap-1.5 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
          {active.title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-5">
        <div className="sm:col-span-8">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-3">
            {active.sectionTitle}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {active.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="px-2 py-1 rounded-lg bg-white/15 backdrop-blur-md text-xs font-extrabold text-white min-w-[50px] text-center border border-white/20">
                  {stat.value}
                </span>
                <span className="text-xs text-indigo-100 font-medium truncate">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:col-span-4 hidden sm:flex justify-end items-center">
          <div className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner text-white group hover:scale-105 transition-transform">
            <IconComponent className="w-12 h-12 text-white/90 drop-shadow" />
          </div>
        </div>
      </div>
    </div>
  )
}

