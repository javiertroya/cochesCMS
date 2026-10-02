import { ExternalLink } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'

import { getNavGroupsForRole } from '@/mocks/admin/adminSections'
import useAuth from '@/hooks/useAuth'
import { useSiteSettings } from '@/context/SiteSettingsContext'

const AdminSidebar = () => {
    const { user } = useAuth()
    const { settings } = useSiteSettings()
    const siteName = settings?.site_name || 'Panel CMS'
    const initials = siteName.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()

    return (
        <aside className="flex h-full flex-col border-r border-slate-800 bg-[#0c1220] text-white">
            {/* Logo / Branding */}
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-primary to-blue-400 text-sm font-black text-white shadow-lg shadow-blue-900/40">
                    {initials}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold tracking-tight text-white">{siteName}</p>
                    <p className="text-xs text-slate-500">Panel de administración</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
                {getNavGroupsForRole(user?.role).map((group) => (
                    <div key={group.label}>
                        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                            {group.label}
                        </p>
                        <div className="space-y-0.5">
                            {group.items.map(({ id, label, icon: Icon, path, end }) => (
                                <NavLink
                                    key={id}
                                    to={path}
                                    end={end}
                                    className={({ isActive }) =>
                                        `group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                            isActive
                                                ? 'bg-brand-primary/20 text-white'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-primary" />
                                            )}
                                            <Icon
                                                size={17}
                                                className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}
                                            />
                                            <span className="flex-1">{label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-800 px-3 py-3">
                <Link
                    to="/"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
                >
                    <ExternalLink size={17} className="text-slate-500" />
                    Volver a la web
                </Link>
            </div>
        </aside>
    )
}

export default AdminSidebar
