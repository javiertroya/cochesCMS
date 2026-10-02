import { NAV_ICON_MAP } from '@/mocks/admin/navIcons'

export const slugFromRoute = (route) => {
    if (!route) return 'home'
    if (route === '/') return 'home'
    return route.replace(/^\//, '')
}

export const routeFromSlug = (slug) => {
    if (slug === 'home') return '/'
    return `/${slug}`
}

export const flattenMenu = (items, parent = null) => {
    return items.flatMap((item) => {
        const current = {
            ...item,
            parent,
            slug: slugFromRoute(item.route),
        }

        return [
            current,
            ...flattenMenu(item.children ?? [], current),
        ]
    })
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
        const parentSlug = page.nav_parent_slug || null
        if (parentSlug) {
            const parent = bySlug.get(parentSlug)
            if (parent) {
                parent.children = [...(parent.children ?? []), item]
            } else {
                roots.push(item)
            }
        } else {
            roots.push(item)
        }
    }

    return roots
}

export const mergeCmsPagesIntoMenu = (menu, cmsPages = []) => {
    const clonedMenu = menu.map(item => ({
        ...item,
        children: item.children ? item.children.map(child => ({ ...child })) : undefined,
    }))

    const bySlug = new Map(flattenMenu(clonedMenu).map(item => [item.slug, item]))

    cmsPages.forEach((page) => {
        const route = routeFromSlug(page.slug)
        const menuItem = {
            id: `cms-${page.id}`,
            name: page.title,
            label: `cms-${page.slug}`,
            route,
            icon: NAV_ICON_MAP[page.nav_icon] ?? undefined,
            children: undefined,
        }

        const existing = bySlug.get(page.slug)
        if (existing) {
            existing.name = page.title
            return
        }

        const parentSlug = page.nav_parent_slug
        const parent = parentSlug ? bySlug.get(parentSlug) : null

        if (parent) {
            parent.children = [
                ...(parent.children ?? []),
                menuItem,
            ]
            bySlug.set(page.slug, menuItem)
            return
        }

        clonedMenu.push(menuItem)
        bySlug.set(page.slug, menuItem)
    })

    return clonedMenu
}
