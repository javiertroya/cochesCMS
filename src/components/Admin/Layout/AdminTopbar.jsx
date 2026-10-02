import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { getNavGroupsForRole } from '@/mocks/admin/adminSections'
import useAuth from '@/hooks/useAuth'

import AdminUserMenu from '@/components/Admin/Layout/AdminUserMenu'

const ROUTE_META = {
    '/admin':             { title: 'Inicio',          subtitle: 'Resumen y acciones rápidas' },
    '/admin/requests':    { title: 'Solicitudes',     subtitle: 'Mensajes de clientes desde la web' },
    '/admin/pages':       { title: 'Páginas',         subtitle: 'Gestión de páginas y contenido dinámico' },
    '/admin/components':  { title: 'Componentes',     subtitle: 'Catálogo de componentes disponibles' },
    '/admin/carousel':    { title: 'Carrusel',        subtitle: 'Editor del carrusel de cabecera' },
    '/admin/collections': { title: 'Colecciones',     subtitle: 'Datos estructurados del sitio' },
    '/admin/multimedia':  { title: 'Multimedia',      subtitle: 'Imágenes y archivos subidos' },
    '/admin/styles':      { title: 'Estilos',         subtitle: 'Configuración visual del sitio' },
    '/admin/users':       { title: 'Usuarios',        subtitle: 'Gestión de accesos y roles' },
    '/admin/menu':        { title: 'Menú',            subtitle: 'Estructura de navegación del sitio' },
    '/admin/seo':         { title: 'SEO',             subtitle: 'Estado de optimización para buscadores' },
    '/admin/redirects':   { title: 'Redirecciones',   subtitle: 'Gestión de redirecciones de URL' },
    '/admin/analytics':   { title: 'Analíticas',      subtitle: 'Estadísticas de visitas y actividad' },
    '/admin/audit-log':   { title: 'Actividad',       subtitle: 'Historial de acciones en el panel' },
}

const AdminTopbar = () => {
    const { user } = useAuth()
    const { pathname } = useLocation()
    const meta = ROUTE_META[pathname] ?? { title: 'Admin', subtitle: '' }
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    return (
        <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
            <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-lg font-bold leading-tight text-[#111827] sm:text-xl">{meta.title}</h1>
                    <p className="line-clamp-1 text-xs text-[#9ca3af]">{meta.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={mobileOpen}
                        className="inline-flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 lg:hidden"
                        onClick={() => setMobileOpen((open) => !open)}
                    >
                        {mobileOpen ? <X size={21} /> : <Menu size={21} />}
                    </button>
                    <AdminUserMenu />
                </div>
            </div>
            {mobileOpen && (
                <nav className="absolute inset-x-0 top-full z-30 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[#eef0f4] bg-white px-4 py-3 shadow-xl lg:hidden">
                    <div className="space-y-4">
                        {getNavGroupsForRole(user?.role).map((group) => (
                            <section key={group.label}>
                                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    {group.label}
                                </p>
                                <div className="grid gap-1">
                                    {group.items.map(({ id, label, icon: Icon, path, end }) => (
                                        <NavLink
                                            key={id}
                                            to={path}
                                            end={end}
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                                    isActive
                                                        ? 'bg-brand-primary text-white'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`
                                            }
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </NavLink>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    )
}

export default AdminTopbar
