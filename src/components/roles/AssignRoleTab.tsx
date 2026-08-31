import { Search, UserCheck, CheckCircle, AlertCircle } from 'lucide-react'
import type { Role, UserProfile } from '@/types/api.types'
import { CustomSelect } from '@/components/common/CustomSelect'

interface AssignRoleTabProps {
  users: UserProfile[]
  userSearch: string
  onUserSearchChange: (val: string) => void
  selectedUser: UserProfile | null
  onSelectUser: (user: UserProfile) => void
  roles: Role[]
  assignRoleName: string
  onRoleNameChange: (role: string) => void
  onAssignRole: (e: React.FormEvent) => void
  isAssigning: boolean
}

export function AssignRoleTab({
  users,
  userSearch,
  onUserSearchChange,
  selectedUser,
  onSelectUser,
  roles,
  assignRoleName,
  onRoleNameChange,
  onAssignRole,
  isAssigning,
}: AssignRoleTabProps) {
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 w-full h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => onUserSearchChange(e.target.value)}
              placeholder="Tìm kiếm tài khoản thành viên theo email hoặc tên..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden divide-y divide-slate-800/60 max-h-[520px] overflow-y-auto">
          {filteredUsers.map((u) => {
            const isSelected = selectedUser?._id === u._id

            return (
              <div
                key={u._id}
                onClick={() => onSelectUser(u)}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs shrink-0">
                    {u.full_name?.slice(0, 2).toUpperCase() || 'US'}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-slate-100">
                      {u.full_name || u.email}
                    </p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {u.role || 'STUDENT'}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 h-fit">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-400" />
          <span>Gán vai trò mới</span>
        </h3>

        {selectedUser ? (
          <form onSubmit={onAssignRole} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <p className="text-[11px] text-slate-500">Tài khoản được chọn:</p>
              <p className="text-sm font-bold text-slate-100">
                {selectedUser.full_name || selectedUser.email}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                {selectedUser.email}
              </p>
              <p className="text-[11px] text-teal-400 mt-1">
                Vai trò hiện tại: {selectedUser.role || 'STUDENT'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Chọn vai trò mới cần cấp
              </label>
              <CustomSelect
                value={assignRoleName}
                onChange={onRoleNameChange}
                options={roles.map((r) => ({
                  value: r.name,
                  label: `${r.name} - ${r.description || r.name}`,
                  badge: r.name,
                }))}
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={isAssigning}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAssigning ? 'Đang cập nhật...' : 'Cấp quyền cho thành viên'}
            </button>
          </form>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
            <p>
              Vui lòng chọn một tài khoản từ danh sách bên trái để tiến hành phân
              quyền
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
