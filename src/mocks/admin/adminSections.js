import {
    LayoutDashboard, FileText, Layers3, Database,
    ImageIcon, Inbox, Navigation, Search, Link2,
    Users, BarChart2, Activity, SlidersHorizontal, Palette,
} from 'lucide-react'

const NAV_GROUPS = [
    {
        label: 'Contenido',
        items: [
            { id: 'overview',    label: 'Inicio',          icon: LayoutDashboard,   path: '/admin',              end: true },
            { id: 'requests',    label: 'Solicitudes',     icon: Inbox,             path: '/admin/requests' },
            { id: 'pages',       label: 'Páginas',         icon: FileText,          path: '/admin/pages' },
            { id: 'components',  label: 'Componentes',     icon: Layers3,           path: '/admin/components' },
            { id: 'carousel',    label: 'Carrusel',        icon: SlidersHorizontal, path: '/admin/carousel' },
            { id: 'collections', label: 'Colecciones',     icon: Database,          path: '/admin/collections' },
        ],
    },
    {
        label: 'Diseño',
        items: [
            { id: 'styles',     label: 'Estilos',       icon: Palette,    path: '/admin/styles',    adminOnly: true },
            { id: 'menu',       label: 'Menú',          icon: Navigation, path: '/admin/menu' },
            { id: 'seo',        label: 'SEO',           icon: Search,     path: '/admin/seo' },
            { id: 'multimedia', label: 'Multimedia',    icon: ImageIcon,  path: '/admin/multimedia' },
            { id: 'redirects',  label: 'Redirecciones', icon: Link2,      path: '/admin/redirects', adminOnly: true },
        ],
    },
    {
        label: 'Sistema',
        items: [
            { id: 'users',     label: 'Usuarios',   icon: Users,    path: '/admin/users',     adminOnly: true },
            { id: 'analytics', label: 'Analíticas', icon: BarChart2, path: '/admin/analytics' },
            { id: 'audit-log', label: 'Actividad',  icon: Activity, path: '/admin/audit-log', adminOnly: true },
        ],
    },
]

// Grupos visibles según el rol (los editores no ven las secciones adminOnly)
export const getNavGroupsForRole = (role) => NAV_GROUPS
    .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.adminOnly || role === 'admin'),
    }))
    .filter((group) => group.items.length > 0)
