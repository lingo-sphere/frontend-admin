// Component khung giao diện quản trị Admin kèm thanh bên và tiêu đề
import { useLocation } from 'react-router-dom'
import { Sheet } from '@/components/sheet'
import { Sidebar } from '@/layouts/sidebar'
import { Topbar } from '@/layouts/topbar'
import { useAdminLayout } from '@/contexts/admin.layout.context'
import { PageTransition } from '@/components/page.transition'

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const location = useLocation()
  const { mobileSidebarOpen, setMobileSidebarOpen, sidebarCollapsed } = useAdminLayout()

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col relative selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 transition-colors duration-200">
      <Sidebar />

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <Sidebar mobile />
      </Sheet>

      <div className={`flex-1 flex flex-col min-w-0 transition-[padding-left] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64'}`}>
        <Topbar />
        <main className="flex-1 flex flex-col w-full p-4 sm:p-6 lg:p-7">
          <PageTransition locationKey={location.pathname}>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  )
}


