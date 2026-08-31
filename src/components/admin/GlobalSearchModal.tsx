import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Search,
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  FileCheck,
  Headphones,
  Mic,
  PenTool,
  Shield,
  Bot,
  HardDrive,
  Bell,
  Activity,
  Settings,
  User,
  ArrowRight,
  X,
} from 'lucide-react'
import { useAdminStore } from '@/store/admin-store'

interface NavSearchItem {
  id: string
  title: string
  subtitle: string
  category: 'NAVIGATION' | 'ACTION'
  icon: typeof LayoutDashboard
  navTarget: string
}

const NAVIGATION_INDEX: NavSearchItem[] = [
  {
    id: 'nav-dashboard',
    title: 'Tổng quan hệ thống',
    subtitle: 'Thống kê hoạt động, doanh thu và DAU/MAU',
    category: 'NAVIGATION',
    icon: LayoutDashboard,
    navTarget: 'dashboard',
  },
  {
    id: 'nav-learners',
    title: 'Quản lý Học viên',
    subtitle: 'Danh sách học viên, tiến độ TOEIC, gói cước',
    category: 'NAVIGATION',
    icon: Users,
    navTarget: 'users',
  },
  {
    id: 'nav-courses',
    title: 'Quản lý Khóa học',
    subtitle: 'Khóa học TOEIC 2 kỹ năng, 4 kỹ năng và giáo trình',
    category: 'NAVIGATION',
    icon: BookOpen,
    navTarget: 'courses',
  },
  {
    id: 'nav-vocabulary',
    title: 'Kho Từ vựng & Flashcards',
    subtitle: 'Từ điển song ngữ, phiên âm IPA, bộ thẻ SRS',
    category: 'NAVIGATION',
    icon: Layers,
    navTarget: 'vocabulary',
  },
  {
    id: 'nav-exams',
    title: 'Ngân hàng Đề thi TOEIC',
    subtitle: 'Đề Full Test 7 Parts, Mini Test và ma trận đề thi',
    category: 'NAVIGATION',
    icon: FileCheck,
    navTarget: 'exams',
  },
  {
    id: 'nav-listening',
    title: 'Luyện Nghe Listening & Dictation',
    subtitle: 'Bài nghe chép chính tả Part 1-4 và Audio Cloudflare R2',
    category: 'NAVIGATION',
    icon: Headphones,
    navTarget: 'practice-listening',
  },
  {
    id: 'nav-speaking',
    title: 'Luyện Nói & Phát âm AI Whisper',
    subtitle: 'Nhận diện phát âm chuẩn bản xứ và thang điểm chấm',
    category: 'NAVIGATION',
    icon: Mic,
    navTarget: 'practice-speaking',
  },
  {
    id: 'nav-writing',
    title: 'Luyện Viết Writing & Essay',
    subtitle: 'Viết email thương mại và bài luận chấm AI',
    category: 'NAVIGATION',
    icon: PenTool,
    navTarget: 'practice-writing',
  },
  {
    id: 'nav-roles',
    title: 'Phân quyền & Vai trò',
    subtitle: 'Quản trị RBAC, tài khoản Admin, Giảng viên',
    category: 'NAVIGATION',
    icon: Shield,
    navTarget: 'roles',
  },
  {
    id: 'nav-ai',
    title: 'Gia sư AI & Prompting',
    subtitle: 'Cấu hình Groq LPU, Gemini Flash và sinh đề thi tự động',
    category: 'NAVIGATION',
    icon: Bot,
    navTarget: 'ai',
  },
  {
    id: 'nav-media',
    title: 'Quản lý Media & R2 Storage',
    subtitle: 'Dung lượng lưu trữ Cloudflare R2, sinh giọng nói TTS',
    category: 'NAVIGATION',
    icon: HardDrive,
    navTarget: 'media',
  },
  {
    id: 'nav-notifications',
    title: 'Thông báo & Chiến dịch nhắc học',
    subtitle: 'Push Notification, Email nhắc Streak học viên',
    category: 'NAVIGATION',
    icon: Bell,
    navTarget: 'notifications',
  },
  {
    id: 'nav-progress',
    title: 'Giám sát & Báo cáo hệ thống',
    subtitle: 'Phân tích điểm TOEIC, BetterStack Uptime, PostHog',
    category: 'NAVIGATION',
    icon: Activity,
    navTarget: 'progress',
  },
  {
    id: 'nav-settings',
    title: 'Cài đặt hệ thống',
    subtitle: 'Gói thanh toán, cấu hình AI, bảo mật',
    category: 'NAVIGATION',
    icon: Settings,
    navTarget: 'settings',
  },
  {
    id: 'nav-profile',
    title: 'Hồ sơ Quản trị viên',
    subtitle: 'Đổi mật khẩu, cập nhật họ tên và ảnh đại diện',
    category: 'ACTION',
    icon: User,
    navTarget: 'admin-profile:me',
  },
]

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const setActiveNavItem = useAdminStore((state) => state.setActiveNavItem)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return NAVIGATION_INDEX
    const q = query.toLowerCase().trim()
    return NAVIGATION_INDEX.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems.length])

  const handleSelect = (navTarget: string) => {
    setActiveNavItem(navTarget)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].navTarget)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm nhanh trang, tính năng, học viên, khóa học... (Gõ phím để tìm)"
            className="w-full bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
              ESC
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <p className="text-sm font-semibold">Không tìm thấy kết quả phù hợp</p>
              <p className="text-xs">Thử tìm với từ khóa khác như "Khóa học", "Từ vựng", "Học viên"...</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.navTarget)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {item.category === 'ACTION' ? 'Thao tác' : 'Điều hướng'}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected
                          ? 'translate-x-0.5 text-indigo-600 dark:text-indigo-400'
                          : 'opacity-0'
                      }`}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↓
              </kbd>{' '}
              để chuyển
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              để chọn
            </span>
          </div>
          <span>Tìm kiếm toàn cục LingoSphere</span>
        </div>
      </div>
    </div>
  )
}
