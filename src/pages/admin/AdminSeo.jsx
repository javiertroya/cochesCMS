import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

import AdminLoadingState from '@/components/Admin/UI/AdminLoadingState'
import AdminPageHeader from '@/components/Admin/Layout/AdminPageHeader'
import SeoStatusBadge from '@/components/Admin/Seo/SeoStatusBadge'
import SeoFieldCheck from '@/components/Admin/Seo/SeoFieldCheck'
import SeoScoreBar from '@/components/Admin/Seo/SeoScoreBar'
import { getAdminCmsPages } from '@/services/cms_service'

const COLUMNS = [
    { label: 'Página',     align: 'left'   },
    { label: 'Estado',     align: 'left'   },
    { label: 'Título',     align: 'center' },
    { label: 'Slug',       align: 'center' },
    { label: 'Publicada',  align: 'center' },
    { label: 'En menú',    align: 'center' },
    { label: 'Puntuación', align: 'left'   },
]

const seoScore = (page) => [
    page.title,
    page.slug,
    page.is_published,
    page.nav_visible,
].filter(Boolean).length

const AdminSeo = () => {
    const [pages, setPages]     = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await getAdminCmsPages()
                setPages(data)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center py-24">
                <AdminLoadingState label="Cargando SEO…" />
            </div>
        )
    }

    const sorted = [...pages].sort((a, b) => seoScore(a) - seoScore(b))

    return (
        <div className="h-full overflow-y-auto py-6 lg:py-8">
            <div className="space-y-6">

                <AdminPageHeader
                    icon={Search}
                    title="SEO"
                    description="Estado de los metadatos SEO para cada página del sitio."
                />

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">Estado por página</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                            Ordenado de menor a mayor puntuación. Edita cada página desde{' '}
                            <Link
                                to="/admin/pages"
                                className="font-medium text-brand-primary underline-offset-2 hover:underline"
                            >
                                Páginas
                            </Link>.
                        </p>
                    </div>

                    {sorted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                                <Search className="h-6 w-6 text-gray-300" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Sin páginas creadas</p>
                                <p className="mt-0.5 text-xs text-gray-300">Crea páginas desde la sección Páginas</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-50 bg-gray-50/70">
                                        {COLUMNS.map(({ label, align }) => (
                                            <th
                                                key={label}
                                                className={`px-6 py-3 text-${align} text-xs font-medium text-gray-400`}
                                            >
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sorted.map((page) => {
                                        const score = seoScore(page)
                                        return (
                                            <tr key={page.id} className="transition-colors hover:bg-gray-50/60">
                                                <td className="px-6 py-3.5">
                                                    <Link
                                                        to="/admin/pages"
                                                        state={{ pageSlug: page.slug }}
                                                        className="font-medium text-gray-900 transition-colors hover:text-brand-primary"
                                                    >
                                                        {page.title ?? <span className="italic text-gray-300">Sin título</span>}
                                                    </Link>
                                                    <p className="mt-0.5 font-mono text-[11px] text-gray-400">{page.slug}</p>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <SeoStatusBadge score={score} />
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <SeoFieldCheck value={page.title} />
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <SeoFieldCheck value={page.slug} />
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <SeoFieldCheck value={page.is_published} />
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <SeoFieldCheck value={page.nav_visible} />
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <SeoScoreBar score={score} />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default AdminSeo
