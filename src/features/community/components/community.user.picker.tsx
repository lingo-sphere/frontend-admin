// Component tìm kiếm và lựa chọn người dùng theo phân cấp vai trò với hỗ trợ chọn nhiều bằng checkbox.
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Loader2, ShieldCheck, GraduationCap, User, CheckSquare, Square } from 'lucide-react'
import { userService } from '@/features/users/services/user.service'
import type { UserProfile } from '@/features/users/schemas/user.schema'

interface CommunityUserPickerProps {
  selectedUser?: UserProfile | null
  onSelectUser?: (user: UserProfile | null) => void
  multiple?: boolean
  selectedUsers?: UserProfile[]
  onSelectUsers?: (users: UserProfile[]) => void
  manualUserId: string
  onChangeManualUserId: (id: string) => void
  disabledRoles?: string[]
  allowedRoles?: string[]
  themeColor?: 'indigo' | 'rose'
}

export function CommunityUserPicker({
  selectedUser,
  onSelectUser,
  multiple = false,
  selectedUsers = [],
  onSelectUsers,
  manualUserId,
  onChangeManualUserId,
  disabledRoles = [],
  allowedRoles,
  themeColor = 'indigo',
}: CommunityUserPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isManualInput, setIsManualInput] = useState(false)

  const { data: users = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ['community', 'picker-users'],
    queryFn: async () => {
      const res = await userService.getAllUsers({ limit: 200 })
      return Array.isArray(res) ? res : res?.result || []
    },
    staleTime: 60 * 1000,
  })

  const getRolePriority = (role?: string | null) => {
    const r = (role || '').toUpperCase()
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 1
    if (r === 'INSTRUCTOR' || r === 'TEACHER') return 2
    return 3
  }

  const getRoleBadge = (role?: string | null) => {
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
    let list = [...users]
    if (allowedRoles && allowedRoles.length > 0) {
      const allowed = allowedRoles.map((r) => r.toUpperCase())
      list = list.filter((u) => allowed.includes((u.role || '').toUpperCase()))
    }

    const sorted = list.sort((a, b) => {
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
  }, [users, searchQuery, allowedRoles])

  const selectedUserIds = useMemo(
    () => new Set(selectedUsers.map((u) => u.user_id)),
    [selectedUsers]
  )

  const isAllSelected = useMemo(() => {
    if (sortedAndFilteredUsers.length === 0) return false
    return sortedAndFilteredUsers.every((u) => selectedUserIds.has(u.user_id))
  }, [sortedAndFilteredUsers, selectedUserIds])

  const handleToggleUser = (user: UserProfile) => {
    if (!multiple) {
      onSelectUser?.(user)
      onChangeManualUserId(user.user_id)
      return
    }

    if (!onSelectUsers) return

    if (selectedUserIds.has(user.user_id)) {
      const next = selectedUsers.filter((u) => u.user_id !== user.user_id)
      onSelectUsers(next)
      onChangeManualUserId(next.map((u) => u.user_id).join(', '))
    } else {
      const next = [...selectedUsers, user]
      onSelectUsers(next)
      onChangeManualUserId(next.map((u) => u.user_id).join(', '))
    }
  }

  const handleToggleSelectAll = () => {
    if (!multiple || !onSelectUsers) return

    if (isAllSelected) {
      const filteredIds = new Set(sortedAndFilteredUsers.map((u) => u.user_id))
      const next = selectedUsers.filter((u) => !filteredIds.has(u.user_id))
      onSelectUsers(next)
      onChangeManualUserId(next.map((u) => u.user_id).join(', '))
    } else {
      const existingIds = new Set(selectedUsers.map((u) => u.user_id))
      const additions = sortedAndFilteredUsers.filter((u) => !existingIds.has(u.user_id))
      const next = [...selectedUsers, ...additions]
      onSelectUsers(next)
      onChangeManualUserId(next.map((u) => u.user_id).join(', '))
    }
  }

  const handleRemoveSelectedUser = (userId: string) => {
    if (!multiple || !onSelectUsers) return
    const next = selectedUsers.filter((u) => u.user_id !== userId)
    onSelectUsers(next)
    onChangeManualUserId(next.map((u) => u.user_id).join(', '))
  }

  const activeBorderColor = themeColor === 'rose' ? 'border-rose-500 focus:ring-rose-500' : 'border-indigo-500 focus:ring-indigo-500'
  const activeBgColor = themeColor === 'rose' ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900'
  const activeTextColor = themeColor === 'rose' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'

  if (!multiple && selectedUser) {
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
            onSelectUser?.(null)
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
          {multiple ? 'Chọn người dùng (chọn một hoặc nhiều)' : 'Chọn người dùng'}
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
          placeholder={multiple ? 'Nhập User ID (phân cách bằng dấu phẩy nếu nhiều người)...' : 'Nhập chính xác User ID người dùng...'}
          className={`w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${activeBorderColor} font-mono`}
        />
      ) : (
        <div className="space-y-2">
          {multiple && (
            <div className="flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>
                  {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${sortedAndFilteredUsers.length})`}
                </span>
              </button>

              {selectedUsers.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Đã chọn: {selectedUsers.length} người
                </span>
              )}
            </div>
          )}

          {multiple && selectedUsers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 max-h-20 overflow-y-auto">
              {selectedUsers.map((u) => (
                <span
                  key={u.user_id}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  <span className="truncate max-w-[120px]">{u.full_name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveSelectedUser(u.user_id)
                    }}
                    className="hover:text-rose-500 cursor-pointer p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

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

          <div className="max-h-44 sm:max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
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
                const isSelected = multiple ? selectedUserIds.has(u.user_id) : selectedUser?.user_id === u.user_id

                return (
                  <div
                    key={u.user_id}
                    onClick={() => {
                      if (isDisabled) return
                      handleToggleUser(u)
                    }}
                    className={`w-full p-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-950/20'
                        : isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 cursor-pointer'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {multiple && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => handleToggleUser(u)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                        />
                      )}

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
                      ) : !multiple ? (
                        <span className={`text-[11px] font-semibold ${activeTextColor} hover:underline`}>
                          Chọn
                        </span>
                      ) : isSelected ? (
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          Đã chọn
                        </span>
                      ) : null}
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
