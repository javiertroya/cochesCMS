import { routeFromSlug } from '@/utils/menu'

export const makeCmsComponent = (componentType) => ({
    id: `${componentType.type}-${Date.now()}`,
    type: componentType.type,
    props: componentType.default_props ?? {},
})

export const pageToDraft = (page, fallbackPage) => {
    const nextPage = page ?? fallbackPage

    return {
        title: nextPage.title,
        slug: nextPage.slug,
        requires_auth: Boolean(nextPage.requires_auth),
        is_published: Boolean(nextPage.is_published),
        nav_visible: Boolean(nextPage.nav_visible),
        nav_parent_slug: nextPage.nav_parent_slug ?? '',
        nav_order: nextPage.nav_order ?? 100,
        nav_icon: nextPage.nav_icon ?? '',
        components: nextPage.components ?? [],
        header_slides: nextPage.header_slides ?? [],
    }
}

export const buildEditablePages = (cmsPages) => {
    return cmsPages.map(page => ({
        id: `cms-${page.id}`,
        title: page.title,
        slug: page.slug,
        route: routeFromSlug(page.slug),
        source: 'cms',
        cmsPage: page,
    }))
}
