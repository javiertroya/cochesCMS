import { useLocation } from 'react-router-dom'
import { useBreadcrumbContext } from '../context/BreadcrumbContext'
import useNavigationMenu from './useNavigationMenu'

// .............................................................
const useBreadcrumbs = () => {

    // .............................
    const { pathname } = useLocation()
    const { dynamicLabels } = useBreadcrumbContext()
    const menu = useNavigationMenu()

    // .............................
    const findCrumbs = (items, path, parentCrumb = null) => {
        for (const item of items) {
            const currentCrumb = [item.route, item.name]
            const breadcrumbPath = parentCrumb ? [parentCrumb, currentCrumb] : [currentCrumb]

            if (item.route === path) return breadcrumbPath

            if (item.children) {
                const found = findCrumbs(item.children, path, currentCrumb)
                if (found) return found
            }

            // Rutas dinámicas bajo una página del menú (p. ej. /catalogo/123)
            if (path.startsWith(item.route + '/')) {
                const dynamicLabel = dynamicLabels[path]
                return dynamicLabel
                    ? [...breadcrumbPath, [path, dynamicLabel]]
                    : breadcrumbPath
            }
        }

        return null
    }

    const menuCrumbs = findCrumbs(menu, pathname)

    let crumbs
    if (menuCrumbs !== null) {
        crumbs = menuCrumbs
    } else if (dynamicLabels[pathname]) {
        // No hay entrada en el menú pero sí un label dinámico (e.g. /coleccion/:slug/:id).
        // Si hay un fromPath registrado, lo buscamos en el menú para obtener el crumb padre.
        const itemLabel = dynamicLabels[pathname]
        const fromPath = dynamicLabels[`__parent__:${pathname}`]
        const parentCrumbs = fromPath ? (findCrumbs(menu, fromPath) ?? null) : null
        crumbs = parentCrumbs
            ? [...parentCrumbs, [pathname, itemLabel]]
            : [[pathname, itemLabel]]
    } else {
        crumbs = []
    }

    // .............................
    return { pathname, crumbs }
}

export default useBreadcrumbs
