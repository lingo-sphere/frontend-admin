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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <Sidebar mobile />
      </Sheet>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64'}`}>
        <Topbar />
        <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
