// Component tìm kiếm và lựa chọn người dùng theo phân cấp vai trò cho quản trị cộng đồng.
import { useState, useEffect, useMemo } from 'react'
import { Search, X, Loader2, ShieldCheck, GraduationCap, User } from 'lucide-react'
import { userService } from '@/features/users/services/user.service'
import type { UserProfile } from '@/features/users/schemas/user.schema'

interface CommunityUserPickerProps {
  selectedUser: UserProfile | null
  onSelectUser: (user: UserProfile | null) => void
  manualUserId: string
  onChangeManualUserId: (id: string) => void
  disabledRoles?: string[]
  themeColor?: 'indigo' | 'rose'
}

export function CommunityUserPicker({
  selectedUser,
  onSelectUser,
  manualUserId,
  onChangeManualUserId,
  disabledRoles = [],
  themeColor = 'indigo',
}: CommunityUserPickerProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isManualInput, setIsManualInput] = useState(false)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    userService
      .getAllUsers({ limit: 200 })
      .then((res) => {
        if (!isMounted) return
        const list = Array.isArray(res) ? res : res?.result || []
        setUsers(list)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const getRolePriority = (role?: string) => {
    const r = (role || '').toUpperCase()
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 1
    if (r === 'INSTRUCTOR' || r === 'TEACHER') return 2
    return 3
  }

  const getRoleBadge = (role?: string) => {
    const r = (role || '').toUpperCase()
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') {
      return {
        label: 'Quản trị viên',
        icon: ShieldCheck,
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
      }
    }
    if (r === 'INSTRUCTOR' || r === 'TEACHER') {
      return {
        label: 'Giáo viên',
        icon: GraduationCap,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      }
    }
    return {
      label: 'Học viên',
      icon: User,
      className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
    }
  }

  const sortedAndFilteredUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      const pA = getRolePriority(a.role)
      const pB = getRolePriority(b.role)
      if (pA !== pB) return pA - pB
      return (a.full_name || '').localeCompare(b.full_name || '')
    })

    if (!searchQuery.trim()) return sorted

    const q = searchQuery.toLowerCase().trim()
    return sorted.filter((u) => {
      const name = (u.full_name || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      const uid = (u.user_id || '').toLowerCase()
      return name.includes(q) || email.includes(q) || uid.includes(q)
    })
  }, [users, searchQuery])

  const activeBorderColor = themeColor === 'rose' ? 'border-rose-500 focus:ring-rose-500' : 'border-indigo-500 focus:ring-indigo-500'
  const activeBgColor = themeColor === 'rose' ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900'
  const activeTextColor = themeColor === 'rose' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'

  if (selectedUser) {
    const badge = getRoleBadge(selectedUser.role)
    const BadgeIcon = badge.icon

    return (
      <div className={`flex items-center justify-between p-3 rounded-2xl border ${activeBgColor}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 overflow-hidden shrink-0">
            {selectedUser.avatar_url ? (
              <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (selectedUser.full_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {selectedUser.full_name}
              </span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold border ${badge.className}`}>
                <BadgeIcon className="w-3 h-3" />
                {badge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {selectedUser.email} • <span className="font-mono">ID: {selectedUser.user_id}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onSelectUser(null)
            onChangeManualUserId('')
          }}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          title="Bỏ chọn người dùng"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Chọn người dùng
        </span>
        <button
          type="button"
          onClick={() => {
            setIsManualInput(!isManualInput)
            if (isManualInput) onChangeManualUserId('')
          }}
          className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {isManualInput ? 'Chọn từ danh sách có sẵn' : 'Nhập User ID thủ công'}
        </button>
      </div>

      {isManualInput ? (
        <input
          type="text"
          required
          value={manualUserId}
          onChange={(e) => onChangeManualUserId(e.target.value)}
          placeholder="Nhập chính xác User ID người dùng..."
          className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${activeBorderColor} font-mono`}
        />
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email hoặc User ID..."
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${activeBorderColor}`}
            />
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span>Đang tải danh sách người dùng...</span>
              </div>
            ) : sortedAndFilteredUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Không tìm thấy người dùng phù hợp
              </div>
            ) : (
              sortedAndFilteredUsers.map((u) => {
                const badge = getRoleBadge(u.role)
                const BadgeIcon = badge.icon
                const isDisabled = disabledRoles.map((r) => r.toUpperCase()).includes((u.role || '').toUpperCase())

                return (
                  <div
                    key={u.user_id}
                    onClick={() => {
                      if (isDisabled) return
                      onSelectUser(u)
                      onChangeManualUserId(u.user_id)
                    }}
                    className={`w-full p-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (u.full_name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {u.full_name}
                          </p>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-semibold border ${badge.className}`}>
                            <BadgeIcon className="w-2.5 h-2.5" />
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {u.email} • <span className="font-mono">ID: {u.user_id.slice(-6)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isDisabled ? (
                        <span className="text-[10px] text-slate-400 italic">
                          Không khả dụng
                        </span>
                      ) : (
                        <span className={`text-[11px] font-semibold ${activeTextColor} hover:underline`}>
                          Chọn
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
