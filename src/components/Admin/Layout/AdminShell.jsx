import { Outlet } from 'react-router-dom'
import AdminSidebar from '@/components/Admin/Layout/AdminSidebar'
import AdminTopbar from '@/components/Admin/Layout/AdminTopbar'

const AdminShell = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-[#f6f7fb] text-[#1f2937]">
            <div className="hidden lg:flex lg:w-65 lg:shrink-0 lg:flex-col">
                <AdminSidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <AdminTopbar />

                <main className="flex-1 overflow-hidden px-6 sm:px-10 lg:px-30 xl:px-60">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminShell
