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
      
      <Sidebar />

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <Sidebar mobile />
      </Sheet>

      <div className={`main-frame${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar />
        {children}
      </div>
    </div>
  )
}
