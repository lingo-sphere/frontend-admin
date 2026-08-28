import { Search, X, Plus } from 'lucide-react'
import type { Permission } from '@/types/api.types'

interface PermissionsListTabProps {
  permissions: Permission[]
  permSearch: string
  onSearchChange: (val: string) => void
  selectedModule: string
  onModuleChange: (val: string) => void
  modulesList: string[]
  onOpenCreatePerm: () => void
}

export function PermissionsListTab({
  permissions,
  permSearch,
  onSearchChange,
  selectedModule,
  onModuleChange,
  modulesList,
  onOpenCreatePerm,
}: PermissionsListTabProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 w-full sm:w-72 h-10 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              value={permSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên hoặc API Path..."
              className="w-full bg-transparent border-0 outline-none placeholder:text-slate-500 p-0 text-xs focus:ring-0"
            />
            {permSearch && (
              <button
                onClick={() => onSearchChange('')}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedModule}
            onChange={(e) => onModuleChange(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả phân hệ (Modules)</option>
            {modulesList.map((m) => (
              <option key={m} value={m}>
                Phân hệ: {m}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenCreatePerm}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Permission Mới</span>
        </button>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold">
                <th className="py-3.5 px-4">Tên quyền hạn</th>
                <th className="py-3.5 px-4">Phân hệ (Module)</th>
                <th className="py-3.5 px-4">Phương thức</th>
                <th className="py-3.5 px-4">Đường dẫn API (Endpoint)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-200">
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Không tìm thấy quyền hạn nào phù hợp
                  </td>
                </tr>
              ) : (
                permissions.map((perm) => (
                  <tr
                    key={perm._id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      {perm.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {perm.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          perm.method === 'GET'
                            ? 'bg-teal-500/10 text-teal-400'
                            : perm.method === 'POST'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : perm.method === 'PUT' || perm.method === 'PATCH'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {perm.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {perm.api_path}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
