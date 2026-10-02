import { useEffect, useState } from 'react'
import { Navigation, Info, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import NavNodeCard from '@/components/Admin/Menu/NavNodeCard'
import { getAdminCmsPages, updateCmsPage } from '@/services/cms_service'

function buildTree(pages) {
    const navPages = pages.filter((p) => p.nav_visible)
    const bySlug   = Object.fromEntries(navPages.map((p) => [p.slug, { ...p, children: [] }]))

    const roots = []
    for (const node of Object.values(bySlug)) {
        const parentSlug = node.nav_parent_slug
        if (!parentSlug || !bySlug[parentSlug]) {
            roots.push(node)
        } else {
            bySlug[parentSlug].children.push(node)
        }
    }

    const sortByOrder = (arr) => arr.sort((a, b) => (a.nav_order ?? 100) - (b.nav_order ?? 100))
    for (const node of Object.values(bySlug)) {
        sortByOrder(node.children)
    }

    return sortByOrder(roots)
}

const AdminMenu = () => {
    const [pages, setPages]     = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving]   = useState(false)

    const loadPages = async () => {
        const data = await getAdminCmsPages()
        setPages(data)
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            try { await loadPages() } finally { setLoading(false) }
        }
        init()
    }, [])

    const handleSwap = async (nodeA, nodeB) => {
        const orderA = nodeA.nav_order ?? 100
        const orderB = nodeB.nav_order ?? 100

        setPages(prev => prev.map(p => {
            if (p.id === nodeA.id) return { ...p, nav_order: orderB }
            if (p.id === nodeB.id) return { ...p, nav_order: orderA }
            return p
        }))

        setSaving(true)
        try {
            await Promise.all([
                updateCmsPage(nodeA.id, { nav_order: orderB }),
                updateCmsPage(nodeB.id, { nav_order: orderA }),
            ])
            await loadPages()
        } catch {
            setPages(prev => prev.map(p => {
                if (p.id === nodeA.id) return { ...p, nav_order: orderA }
                if (p.id === nodeB.id) return { ...p, nav_order: orderB }
                return p
            }))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center py-20">
                <AdminLoadingState label="Cargando menú…" />
            </div>
        )
    }

    const tree = buildTree(pages)

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-5">

                <AdminPageHeader
                    icon={Navigation}
                    title="Menú de navegación"
                    description="Estructura jerárquica del menú principal del sitio."
                />

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Árbol de navegación</p>
                            <p className="mt-0.5 text-xs text-gray-400">
                                Usa las flechas para reordenar. Edita la estructura desde{' '}
                                <Link to="/admin/pages" className="text-brand-primary underline-offset-2 hover:underline">
                                    Páginas
                                </Link>.
                            </p>
                        </div>
                        {saving && (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-300 shrink-0" />
                        )}
                    </div>
                    <div className="p-5">
                        {tree.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                                <Navigation className="h-8 w-8 text-gray-200" />
                                <p className="text-sm font-medium text-gray-400">No hay páginas en el menú</p>
                                <p className="text-xs text-gray-300">
                                    Activa «Visible en el menú» al editar una página para que aparezca aquí.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tree.map((node, idx) => (
                                    <NavNodeCard
                                        key={node.slug}
                                        node={node}
                                        siblings={tree}
                                        siblingIndex={idx}
                                        onSwap={handleSwap}
                                        saving={saving}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5">
                    <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">¿Cómo añadir páginas al menú?</p>
                            <p className="mt-0.5 text-xs text-blue-600">
                                Ve a{' '}
                                <Link to="/admin/pages" className="font-medium underline underline-offset-2">
                                    Páginas
                                </Link>
                                , edita cualquier página y activa la opción «Visible en el menú de navegación». Puedes
                                asignar un orden y una página padre para crear submenús.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AdminMenu
