// Component thẻ trượt phân tích Website Analytics theo phong cách Vuexy Admin Template.
import { useState, useEffect } from 'react'
import { TrendingUp, BookOpen, Award } from 'lucide-react'

interface VuexyAnalyticsSliderCardProps {
  totalUsers: number
  activeToday: number
  totalCourses: number
  vipUsers: number
  totalWords?: number
  examsCount?: number
  publicDecksCount?: number
  grammarPointsCount?: number
  totalCoursePrice?: number
  toeicAttemptsCount?: number
  isVietnamese?: boolean
}

export function VuexyAnalyticsSliderCard({
  totalUsers,
  activeToday,
  totalCourses,
  vipUsers,
  totalWords = 0,
  examsCount = 0,
  publicDecksCount = 0,
  grammarPointsCount = 0,
  totalCoursePrice = 0,
  toeicAttemptsCount = 0,
  isVietnamese = true,
}: VuexyAnalyticsSliderCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const vipPercent = totalUsers > 0 ? Math.round((vipUsers / totalUsers) * 100) : 0

  const slides = [
    {
      title: isVietnamese ? 'Phân Tích Nền Tảng LingoSphere' : 'Website & Learning Analytics',
      subtitle: isVietnamese
        ? `${vipPercent}% Học viên nâng cấp gói VIP`
        : `${vipPercent}% Learners upgraded to VIP`,
      sectionTitle: isVietnamese ? 'Lưu Lượng Học Tập' : 'Learner Traffic',
      stats: [
        { value: `${totalUsers}`, label: isVietnamese ? 'Tổng người dùng' : 'Total Users' },
        { value: `${activeToday}`, label: isVietnamese ? 'Học hôm nay' : 'Active Today' },
        { value: `${totalCourses} Khóa`, label: isVietnamese ? 'Khóa học' : 'Courses' },
        { value: `${vipUsers}`, label: isVietnamese ? 'Gói VIP' : 'VIP Accounts' },
      ],
      badge: isVietnamese ? 'Vận hành 100%' : 'Optimal',
      icon: TrendingUp,
    },
    {
      title: isVietnamese ? 'Luyện Thi & Kho Học Liệu' : 'Practice & Learning Bank',
      subtitle: isVietnamese
        ? 'Hệ thống học liệu và đề thi TOEIC chuẩn quốc tế'
        : 'International standard TOEIC practice bank',
      sectionTitle: isVietnamese ? 'Kỹ Năng & Từ Vựng' : 'Skills & Vocabulary',
      stats: [
        { value: `${totalWords.toLocaleString('vi-VN')} từ`, label: isVietnamese ? 'Từ vựng SRS' : 'SRS Words' },
        { value: `${examsCount} Đề`, label: isVietnamese ? 'Đề thi TOEIC' : 'Mock Tests' },
        { value: `${publicDecksCount} Bộ`, label: isVietnamese ? 'Bộ thẻ Flashcard' : 'Flashcard Decks' },
        { value: `${grammarPointsCount} Điểm`, label: isVietnamese ? 'Ngữ pháp' : 'Grammar Points' },
      ],
      badge: isVietnamese ? 'Chuẩn CEFR' : 'CEFR Ready',
      icon: BookOpen,
    },
    {
      title: isVietnamese ? 'Giá Trị Khóa Học & Khảo Thí' : 'Courses & Assessment Value',
      subtitle: isVietnamese
        ? 'Tổng quan quy mô khóa học và lượt làm bài khảo thí'
        : 'Overview of courses scale and test submissions',
      sectionTitle: isVietnamese ? 'Quy Mô & Giá Trị' : 'Scale & Assessment',
      stats: [
        { value: `${totalCourses} Khóa`, label: isVietnamese ? 'Khóa học niêm yết' : 'Published Courses' },
        { value: `${totalCoursePrice.toLocaleString('vi-VN')} đ`, label: isVietnamese ? 'Giá niêm yết' : 'Total Price' },
        { value: `${toeicAttemptsCount} Lượt`, label: isVietnamese ? 'Lượt làm đề' : 'Exam Submissions' },
        { value: `${vipUsers} Gói`, label: isVietnamese ? 'Hội viên VIP' : 'VIP Learners' },
      ],
      badge: isVietnamese ? 'Hệ Sinh Thái' : 'Ecosystem',
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
