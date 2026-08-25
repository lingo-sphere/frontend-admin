// Updated: 2026-08-22
// AdminShell - Layout chính của admin dashboard
// - Sidebar: fixed left, collapsible
// - Topbar: sticky top
// - Content area

import { Sheet } from '@/components/ui/sheet'
import { Sidebar } from '@/components/admin/Sidebar'
import { Topbar } from '@/components/admin/Topbar'
import { useAdminStore } from '@/store/admin-store'

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const mobileSidebarOpen = useAdminStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useAdminStore((state) => state.setMobileSidebarOpen)
  const sidebarCollapsed = useAdminStore((state) => state.sidebarCollapsed)

  return (
    <div className="admin-app">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <Sidebar mobile />
      </Sheet>

      {/* Main Content */}
      <div className={`main-frame${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar />
        {children}
      </div>
    </div>
  )
}
