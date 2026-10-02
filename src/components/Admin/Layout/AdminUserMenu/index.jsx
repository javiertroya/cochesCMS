import { ROLE_LABELS } from '@/mocks/UserConfig'
import { ChevronDown } from 'lucide-react'

import { Menu, MenuTrigger } from '@/components/UI/coss/menu'
import useAuth from '@/hooks/useAuth'

import AdminUserAvatar from './AdminUserAvatar'
import AdminUserMenuContent from './AdminUserMenuContent'


const AdminUserMenu = () => {
    const { user, logout } = useAuth()

    if (!user) return null

    return (
        <Menu>
            <MenuTrigger className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 outline-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-brand-primary/40 cursor-pointer">
                <AdminUserAvatar name={user.name} />
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold leading-tight text-[#111827]">
                        {user.name}
                    </p>
                    <p className="text-[11px] leading-tight text-[#9ca3af] mt-0.5">
                        {ROLE_LABELS[user.role] ?? user.role}
                    </p>
                </div>
                <ChevronDown
                    size={14}
                    className="hidden sm:block text-gray-400 transition-transform duration-200 group-data-[popup-open]:rotate-180"
                />
            </MenuTrigger>

            <AdminUserMenuContent user={user} onLogout={logout} />
        </Menu>
    )
}

export default AdminUserMenu
