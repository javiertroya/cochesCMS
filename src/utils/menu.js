import { NAV_ICON_MAP } from '@/mocks/admin/navIcons'

export const routeFromSlug = (slug) => {
    if (slug === 'home') return '/'
    return `/${slug}`
}

// Construye el menú de navegación exclusivamente desde páginas CMS.
// Usa dos pasadas para resolver la jerarquía independientemente del orden del array.
export const buildCmsOnlyMenu = (cmsPages = []) => {
    const bySlug = new Map()

    // Primera pasada: crear todos los items
    for (const page of cmsPages) {
        bySlug.set(page.slug, {
            id: `cms-${page.id}`,
            name: page.title,
            label: `cms-${page.slug}`,
            route: routeFromSlug(page.slug),
            icon: NAV_ICON_MAP[page.nav_icon] ?? undefined,
        })
    }

    const roots = []

    // Segunda pasada: enlazar hijos a padres o añadir a la raíz
    for (const page of cmsPages) {
        const item = bySlug.get(page.slug)
        const parent = page.nav_parent_slug && bySlug.get(page.nav_parent_slug)
        if (parent) {
            parent.children = [...(parent.children ?? []), item]
        } else {
            roots.push(item)
        }
    }

    return roots
}
