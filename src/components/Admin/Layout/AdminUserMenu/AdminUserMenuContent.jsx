import { ROLE_LABELS } from '@/mocks/UserConfig'
import { LogOut, Globe2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MenuPopup, MenuItem, MenuSeparator } from '@/components/UI/coss/menu'

import AdminUserAvatar from './AdminUserAvatar'


const AdminUserMenuContent = ({ user, onLogout }) => (
    <MenuPopup align="end" sideOffset={8} className="w-56">
        {/* Cabecera: avatar + nombre + email + rol */}
        <div className="flex items-center gap-3 px-2 py-2.5">
            <AdminUserAvatar name={user.name} />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground leading-tight">
                    {user.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground mt-0.5 leading-tight">
                    {user.email}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                    {ROLE_LABELS[user.role] ?? user.role}
                </p>
            </div>
        </div>

        <MenuSeparator />

        <MenuItem render={<Link to="/" />} className="gap-2.5 text-sm">
            <Globe2 className="h-4 w-4 opacity-70" />
            Ver sitio web
        </MenuItem>

        <MenuItem
            onClick={onLogout}
            className="gap-2.5 text-sm text-destructive-foreground data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
        >
            <LogOut className="h-4 w-4 opacity-70" />
            Cerrar sesión
        </MenuItem>
    </MenuPopup>
)

export default AdminUserMenuContent
