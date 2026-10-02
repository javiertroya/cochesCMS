import { useMemo, useState } from 'react'
import { FilePlus2, FileText, Search } from 'lucide-react'

import { Button } from '@/components/UI/coss/button'
import Toolbar from '@/components/Admin/UI/Toolbar'
import PageRow from './PageRow'

const STATUS_FILTERS = [
    { value: '',          label: 'Todas'      },
    { value: 'published', label: 'Publicadas' },
    { value: 'draft',     label: 'Borradores' },
]

const PagesTable = ({ pages, movingPage, deletingPage, onOpenEdit, onNewPage, onMovePage, onDeletePage }) => {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const orderedPages = useMemo(() => (
        [...pages].sort((a, b) => {
            const aOrder = Number(a.order) || 100
            const bOrder = Number(b.order) || 100
            if (aOrder !== bOrder) return aOrder - bOrder
            return a.title.localeCompare(b.title)
        })
    ), [pages])

    const filteredPages = useMemo(() => {
        const query = search.trim().toLowerCase()
        return orderedPages.filter((page) => {
            const matchesSearch = !query
                || page.title.toLowerCase().includes(query)
                || page.slug.toLowerCase().includes(query)
            const matchesStatus = !statusFilter
                || (statusFilter === 'published' ? page.is_published : !page.is_published)
            return matchesSearch && matchesStatus
        })
    }, [orderedPages, search, statusFilter])

    const filters = STATUS_FILTERS.map(f => ({
        ...f,
        count: f.value === ''          ? pages.length
             : f.value === 'published' ? pages.filter(p => p.is_published).length
             :                          pages.filter(p => !p.is_published).length,
    }))

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Toolbar
                filters={filters}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar por título o ruta..."
                filteredCount={filteredPages.length}
                totalCount={pages.length}
            />

            {pages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <FileText className="h-8 w-8 text-gray-200" />
                    <p className="text-sm font-semibold text-gray-700">Sin páginas todavía</p>
                    <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                        Crea la primera página para empezar a construir el contenido del sitio.
                    </p>
                    <Button size="sm" onClick={onNewPage}>
                        <FilePlus2 className="h-3.5 w-3.5" />
                        Nueva página
                    </Button>
                </div>
            ) : filteredPages.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Search className="h-8 w-8 text-gray-200" />
                    <p className="text-sm font-semibold text-gray-700">Sin resultados</p>
                    <p className="max-w-xs text-xs leading-relaxed text-gray-400">
                        Prueba con otra búsqueda o cambia el filtro activo.
                    </p>
                </div>
            ) : (
                <>
                    <div className="hidden border-b border-gray-100 bg-gray-50/70 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:grid lg:grid-cols-[minmax(0,1fr)_8rem_8rem_8rem_10rem_8rem] lg:gap-4">
                        <span>Página</span>
                        <span>Orden</span>
                        <span>Secciones</span>
                        <span>Estado</span>
                        <span>Menú</span>
                        <span className="text-right">Acciones</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {filteredPages.map((page, index) => (
                            <PageRow
                                key={page.id}
                                page={page}
                                pages={pages}
                                index={index}
                                filteredPages={filteredPages}
                                movingPage={movingPage}
                                deletingPage={deletingPage}
                                onOpenEdit={onOpenEdit}
                                onMovePage={onMovePage}
                                onDeletePage={onDeletePage}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default PagesTable
